// backend/routes/rooms.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Generate unique room ID
const generateRoomId = () => {
  return crypto.randomBytes(4).toString('hex'); // 8 characters
};

// @route   POST /api/rooms/create
// @desc    Create a new room
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const roomId = generateRoomId();

    const room = new Room({
      roomId,
      host: req.user._id,
      players: [{
        userId: req.user._id,
        username: req.user.username,
        socketId: null,
        joinedAt: new Date()
      }]
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      roomId: room.roomId,
      joinLink: `${process.env.CLIENT_URL}/room/${room.roomId}`
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Error creating room' });
  }
});

// @route   GET /api/rooms/:roomId
// @desc    Get room details
// @access  Private
router.get('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('host', 'username')
      .populate('players.userId', 'username');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Error fetching room' });
  }
});

// @route   GET /api/rooms/:roomId/exists
// @desc    Check if room exists
// @access  Public
router.get('/:roomId/exists', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({ exists: false, message: 'Room not found' });
    }

    if (room.status === 'finished') {
      return res.json({ exists: false, message: 'This battle has already ended' });
    }

    res.json({ 
      exists: true, 
      room: {
        roomId: room.roomId,
        status: room.status,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers
      }
    });
  } catch (error) {
    console.error('Room exists check error:', error);
    res.status(500).json({ message: 'Error checking room' });
  }
});

module.exports = router;
