const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

// Generate random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Join or create room
router.post('/join', async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    let room = await Room.findOne({ roomId });
    
    if (!room) {
      // Create new room
      room = new Room({ roomId });
      await room.save();
    } else {
      // Update last activity
      room.lastActivity = new Date();
      await room.save();
    }

    res.json({ 
      success: true, 
      roomId: room.roomId,
      drawingData: room.drawingData 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get room info
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      roomId: room.roomId,
      drawingData: room.drawingData,
      lastActivity: room.lastActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;