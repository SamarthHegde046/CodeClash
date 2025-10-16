// backend/socket/socketHandler.js (UPDATED with Timer & Run/Submit)
const Room = require('../models/Room');
const User = require('../models/User');
const Result = require('../models/Result');
const { getRandomQuestion } = require('../utils/questions');
const { runTestCases } = require('../utils/judge0');

module.exports = (io) => {
  // Store active rooms in memory for quick access
  const activeRooms = new Map();
  const roomTimers = new Map(); // Store timer intervals

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join a room
    socket.on('joinRoom', async ({ roomId, userId, username }) => {
      try {
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

        const existingPlayer = room.players.find(
          p => p.userId.toString() === userId
        );

        if (!existingPlayer) {
          room.players.push({
            userId,
            username,
            socketId: socket.id,
            joinedAt: new Date()
          });
          await room.save();
        } else {
          existingPlayer.socketId = socket.id;
          await room.save();
        }

        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;
        socket.username = username;

        // Get remaining time if battle is active
        let remainingTime = null;
        if (room.status === 'active' && activeRooms.has(roomId)) {
          const roomData = activeRooms.get(roomId);
          const elapsed = Date.now() - roomData.startTime;
          remainingTime = Math.max(0, Math.floor((roomData.duration - elapsed) / 1000));
        }

        socket.emit('roomJoined', {
          roomId: room.roomId,
          host: room.host.toString(),
          players: room.players.map(p => ({
            userId: p.userId.toString(),
            username: p.username,
            socketId: p.socketId
          })),
          status: room.status,
          question: room.question,
          duration: room.duration || 1200, // Default 20 minutes
          remainingTime
        });

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

    // Start the battle with timer
    socket.on('startBattle', async ({ roomId, userId, duration = 1200 }) => {
      try {
        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

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
        room.duration = duration;
        room.startedAt = new Date();
        await room.save();

        // Store in active rooms with player submissions tracking
        activeRooms.set(roomId, {
          startTime: Date.now(),
          duration: duration * 1000, // Convert to milliseconds
          question,
          submissions: new Map(), // userId -> { testResults, lastRun, submitted }
          finishedPlayers: new Set()
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
            testCases: question.testCases.map(tc => ({ input: tc.input }))
          },
          duration: duration, // in seconds
          startTime: Date.now()
        });

        // Start countdown timer
        startBattleTimer(io, roomId, duration);

        console.log(`🎮 Battle started in room: ${roomId} (Duration: ${duration}s)`);
      } catch (error) {
        console.error('Start battle error:', error);
        socket.emit('error', { message: 'Failed to start battle' });
      }
    });

    // Run code (test without submitting)
    socket.on('runCode', async ({ roomId, code, language }) => {
      try {
        const room = await Room.findOne({ roomId });

        if (!room || !room.question) {
          socket.emit('error', { message: 'Invalid room or no active question' });
          return;
        }

        if (room.status !== 'active') {
          socket.emit('error', { message: 'Battle is not active' });
          return;
        }

        socket.emit('codeRunning', { message: 'Running your code...' });

        // Run code against test cases
        const results = await runTestCases(
          code,
          language,
          room.question.testCases
        );

        // Store last run results
        const activeRoom = activeRooms.get(roomId);
        if (activeRoom) {
          if (!activeRoom.submissions.has(socket.userId)) {
            activeRoom.submissions.set(socket.userId, {
              testResults: results,
              lastRun: Date.now(),
              submitted: false
            });
          } else {
            const submission = activeRoom.submissions.get(socket.userId);
            submission.testResults = results;
            submission.lastRun = Date.now();
          }
        }

        // Send results back to the user only
        socket.emit('runResult', {
          success: results.success,
          allPassed: results.allPassed,
          results: results.results,
          totalTests: results.totalTests,
          passedTests: results.passedTests
        });

        console.log(`🔍 ${socket.username} ran code in room: ${roomId}`);
      } catch (error) {
        console.error('Run code error:', error);
        socket.emit('error', { 
          message: 'Code execution failed. Please try again.' 
        });
      }
    });

    // Submit code (final submission)
    socket.on('submitCode', async ({ roomId }) => {
      try {
        const room = await Room.findOne({ roomId });

        if (!room || !room.question) {
          socket.emit('error', { message: 'Invalid room or no active question' });
          return;
        }

        if (room.status !== 'active') {
          socket.emit('error', { message: 'Battle is not active' });
          return;
        }

        const activeRoom = activeRooms.get(roomId);
        if (!activeRoom) {
          socket.emit('error', { message: 'Battle session not found' });
          return;
        }

        // Get last run results
        const userSubmission = activeRoom.submissions.get(socket.userId);
        
        if (!userSubmission || !userSubmission.testResults) {
          socket.emit('error', { 
            message: 'Please run your code at least once before submitting' 
          });
          return;
        }

        // Mark as submitted
        userSubmission.submitted = true;
        userSubmission.submittedAt = Date.now();
        activeRoom.finishedPlayers.add(socket.userId);

        // Navigate user to waiting page
        socket.emit('submissionAccepted', {
          message: 'Submission recorded! Waiting for others...',
          testResults: userSubmission.testResults,
          passedTests: userSubmission.testResults.passedTests,
          totalTests: userSubmission.testResults.totalTests
        });

        // Notify all players
        io.to(roomId).emit('playerSubmitted', {
          userId: socket.userId,
          username: socket.username,
          finishedCount: activeRoom.finishedPlayers.size,
          totalPlayers: room.players.length
        });

        console.log(`📝 ${socket.username} submitted in room: ${roomId}`);

        // Check if all players have submitted
        if (activeRoom.finishedPlayers.size === room.players.length) {
          endBattle(io, roomId);
        }
      } catch (error) {
        console.error('Submit code error:', error);
        socket.emit('error', { 
          message: 'Submission failed. Please try again.' 
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
  });

  // Start battle timer
  function startBattleTimer(io, roomId, duration) {
    let remainingTime = duration;

    const interval = setInterval(() => {
      remainingTime--;

      // Emit time update every second
      io.to(roomId).emit('timerUpdate', { remainingTime });

      // Time's up!
      if (remainingTime <= 0) {
        clearInterval(interval);
        roomTimers.delete(roomId);
        endBattle(io, roomId);
      }
    }, 1000);

    roomTimers.set(roomId, interval);
  }

  // End battle and calculate results
  async function endBattle(io, roomId) {
    try {
      const room = await Room.findOne({ roomId });
      const activeRoom = activeRooms.get(roomId);

      if (!room || !activeRoom) return;

      // Calculate scores and determine winner
      let highestScore = -1;
      let winnerId = null;
      const playerScores = [];

      for (const [userId, submission] of activeRoom.submissions) {
        const score = submission.testResults?.passedTests || 0;
        const player = room.players.find(p => p.userId.toString() === userId);

        playerScores.push({
          userId,
          username: player?.username || 'Unknown',
          score,
          totalTests: submission.testResults?.totalTests || 0,
          submitted: submission.submitted,
          submittedAt: submission.submittedAt
        });

        if (submission.submitted && score > highestScore) {
          highestScore = score;
          winnerId = userId;
        } else if (submission.submitted && score === highestScore && winnerId) {
          // Tie-breaker: who submitted first
          const currentWinner = activeRoom.submissions.get(winnerId);
          if (submission.submittedAt < currentWinner.submittedAt) {
            winnerId = userId;
          }
        }
      }

      // Update room status
      room.status = 'finished';
      room.winner = winnerId;
      room.finishedAt = new Date();
      await room.save();

      // Update user stats
      for (const playerScore of playerScores) {
        const user = await User.findById(playerScore.userId);
        if (user) {
          user.totalBattles += 1;
          
          if (playerScore.userId === winnerId) {
            user.wins += 1;
            user.points += 100; // Winner points
          } else {
            user.losses += 1;
            // Award participation points based on score
            const participationPoints = Math.floor((playerScore.score / playerScore.totalTests) * 50);
            user.points += Math.max(10, participationPoints);
          }
          
          await user.save();
        }
      }

      // Save result
      const duration = Math.floor((Date.now() - activeRoom.startTime) / 1000);
      const result = new Result({
        room: room._id,
        winner: winnerId,
        participants: playerScores.map(ps => ({
          user: ps.userId,
          submissionTime: ps.submittedAt ? new Date(ps.submittedAt) : null,
          passed: ps.userId === winnerId,
          score: ps.score,
          totalTests: ps.totalTests
        })),
        question: room.question,
        duration
      });
      await result.save();

      // Find winner details
      const winner = playerScores.find(ps => ps.userId === winnerId);

      // Announce results to all players
      io.to(roomId).emit('battleEnded', {
        winner: winner ? {
          userId: winner.userId,
          username: winner.username,
          score: winner.score,
          totalTests: winner.totalTests
        } : null,
        playerScores: playerScores.sort((a, b) => b.score - a.score),
        duration,
        roomId
      });

      // Clean up
      activeRooms.delete(roomId);
      if (roomTimers.has(roomId)) {
        clearInterval(roomTimers.get(roomId));
        roomTimers.delete(roomId);
      }

      console.log(`🏁 Battle ended in room: ${roomId}`);
    } catch (error) {
      console.error('End battle error:', error);
    }
  }

  console.log('🔌 Socket.IO handler initialized with timer support');
};