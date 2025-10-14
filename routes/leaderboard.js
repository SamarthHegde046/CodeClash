// backend/routes/leaderboard.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/leaderboard
// @desc    Get top 10 players by points
// @access  Public
router.get('/', async (req, res) => {
  try {
    const topPlayers = await User.find()
      .select('username totalBattles wins losses points')
      .sort({ points: -1, wins: -1 })
      .limit(10);

    res.json({ leaderboard: topPlayers });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user rank
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username totalBattles wins losses points');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate rank
    const rank = await User.countDocuments({
      $or: [
        { points: { $gt: user.points } },
        { points: user.points, wins: { $gt: user.wins } }
      ]
    }) + 1;

    res.json({
      user,
      rank
    });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ message: 'Error fetching user rank' });
  }
});

module.exports = router;