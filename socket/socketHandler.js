// backend/socket/socketHandler.js
const Room = require('../models/Room');
const User = require('../models/User');
const Result = require('../models/Result');
const { getRandomQuestion } = require('../utils/questions');
const { runTestCases } = require('../utils/judge0');

module.exports = (io) => {
  // Store active rooms in memory for quick access
  const activeRooms = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join a room
    socket.on('joinRoom', async ({ roomId, userId, username }) => {
      try {
        // Find room in database
        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.status === 'finished') {
          socket.emit('error', { message: 'This battle has already ended' });
          return;
        }

        if (room.players.length >= room.maxPlayers) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }

        // Check if user already in room
        const existingPlayer = room.players.find(
          p => p.userId.toString() === userId
        );

        if (!existingPlayer) {
          // Add player to room
          room.players.push({
            userId,
            username,
            socketId: socket.id,
            joinedAt: new Date()
          });
          await room.save();
        } else {
          // Update socket ID if player reconnects
          existingPlayer.socketId = socket.id;
          await room.save();
        }

        // Join socket room
        socket.join(roomId);

        // Store room info in socket
        socket.roomId = roomId;
        socket.userId = userId;
        socket.username = username;

        // Send current room state to the joining user
        socket.emit('roomJoined', {
          roomId: room.roomId,
          host: room.host.toString(),
          players: room.players.map(p => ({
            userId: p.userId.toString(),
            username: p.username,
            socketId: p.socketId
          })),
          status: room.status,
          question: room.question
        });

        // Notify all users in room about new player
        io.to(roomId).emit('playerJoined', {
          userId,
          username,
          players: room.players.map(p => ({
            userId: p.userId.toString(),
            username: p.username
          }))
        });

        console.log(`👤 ${username} joined room: ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Start the battle (only host can start)
    socket.on('startBattle', async ({ roomId, userId }) => {
      try {
        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is host
        if (room.host.toString() !== userId) {
          socket.emit('error', { message: 'Only host can start the battle' });
          return;
        }

        if (room.status !== 'waiting') {
          socket.emit('error', { message: 'Battle already started' });
          return;
        }

        if (room.players.length < 2) {
          socket.emit('error', { message: 'Need at least 2 players to start' });
          return;
        }

        // Get random question
        const question = getRandomQuestion();

        // Update room
        room.status = 'active';
        room.question = question;
        room.startedAt = new Date();
        await room.save();

        // Store in active rooms
        activeRooms.set(roomId, {
          startTime: Date.now(),
          question,
          submissions: new Map()
        });

        // Emit question to all players
        io.to(roomId).emit('battleStarted', {
          question: {
            id: question.id,
            title: question.title,
            difficulty: question.difficulty,
            description: question.description,
            examples: question.examples,
            starterCode: question.starterCode,
            testCases: question.testCases.map(tc => ({ input: tc.input })) // Don't send expected output
          }
        });

        console.log(`🎮 Battle started in room: ${roomId}`);
      } catch (error) {
        console.error('Start battle error:', error);
        socket.emit('error', { message: 'Failed to start battle' });
      }
    });

    // Code change (broadcast to other players)
    socket.on('codeChange', ({ roomId, code, language }) => {
      socket.to(roomId).emit('codeUpdated', {
        userId: socket.userId,
        username: socket.username,
        code,
        language
      });
    });

    // Submit code for testing
    socket.on('submitCode', async ({ roomId, code, language }) => {
      try {
        const room = await Room.findOne({ roomId });

        if (!room || !room.question) {
          socket.emit('error', { message: 'Invalid room or no active question' });
          return;
        }

        // Notify room that user is submitting
        io.to(roomId).emit('userSubmitting', {
          userId: socket.userId,
          username: socket.username
        });

        // Run code against test cases
        const results = await runTestCases(
          code,
          language,
          room.question.testCases
        );

        // Send results back to the user
        socket.emit('submissionResult', {
          success: results.success,
          allPassed: results.allPassed,
          results: results.results,
          totalTests: results.totalTests,
          passedTests: results.passedTests
        });

        // If all tests passed and no winner yet
        if (results.allPassed && room.status === 'active') {
          const activeRoom = activeRooms.get(roomId);
          
          // Check if this is the first correct submission
          if (!activeRoom.submissions.has('winner')) {
            activeRoom.submissions.set('winner', socket.userId);

            // Update room
            room.status = 'finished';
            room.winner = socket.userId;
            room.finishedAt = new Date();
            await room.save();

            // Calculate duration
            const duration = Math.floor((Date.now() - activeRoom.startTime) / 1000);

            // Update user stats
            const winner = await User.findById(socket.userId);
            if (winner) {
              winner.totalBattles += 1;
              winner.wins += 1;
              winner.points += 100; // Award 100 points for winning
              await winner.save();
            }

            // Update losers' stats
            for (const player of room.players) {
              if (player.userId.toString() !== socket.userId) {
                const loser = await User.findById(player.userId);
                if (loser) {
                  loser.totalBattles += 1;
                  loser.losses += 1;
                  loser.points += 10; // Participation points
                  await loser.save();
                }
              }
            }

            // Save result
            const result = new Result({
              room: room._id,
              winner: socket.userId,
              participants: room.players.map(p => ({
                user: p.userId,
                submissionTime: p.userId.toString() === socket.userId ? new Date() : null,
                passed: p.userId.toString() === socket.userId
              })),
              question: room.question,
              duration
            });
            await result.save();

            // Announce winner to all players
            io.to(roomId).emit('battleEnded', {
              winner: {
                userId: socket.userId,
                username: socket.username
              },
              duration,
              roomId
            });

            // Clean up active room
            activeRooms.delete(roomId);

            console.log(`🏆 ${socket.username} won the battle in room: ${roomId}`);
          }
        }
      } catch (error) {
        console.error('Submit code error:', error);
        socket.emit('error', { 
          message: 'Code execution failed. Please try again.' 
        });
      }
    });

    // Send chat message
    socket.on('sendMessage', ({ roomId, message }) => {
      io.to(roomId).emit('newMessage', {
        userId: socket.userId,
        username: socket.username,
        message,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);

      if (socket.roomId) {
        // Notify room that user left
        io.to(socket.roomId).emit('playerLeft', {
          userId: socket.userId,
          username: socket.username
        });
      }
    });

    // Leave room manually
    socket.on('leaveRoom', ({ roomId }) => {
      socket.leave(roomId);
      
      io.to(roomId).emit('playerLeft', {
        userId: socket.userId,
        username: socket.username
      });

      socket.roomId = null;
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.IO handler initialized');
};