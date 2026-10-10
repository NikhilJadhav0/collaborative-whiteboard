const Room = require('../models/Room');

const socketHandler = (io) => {
  // Store active rooms and user counts
  const activeRooms = new Map();
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async (roomId) => {
      try {
  if (socket.currentRoom) {
    socket.leave(socket.currentRoom);

    if (activeRooms.has(socket.currentRoom)) {
      activeRooms.get(socket.currentRoom).delete(socket.id);
    }
  }

  socket.join(roomId);
  socket.currentRoom = roomId;

  // Load the saved room and its drawing history.
  const room = await Room.findOneAndUpdate(
    { roomId },
    { $set: { lastActivity: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  // Send history only to the participant who just joined.
  socket.emit('drawing-history', room.drawingData || []);

  // Track active users.
  if (!activeRooms.has(roomId)) {
    activeRooms.set(roomId, new Set());
  }

  activeRooms.get(roomId).add(socket.id);

  io.to(roomId).emit(
    'user-count',
    activeRooms.get(roomId).size
  );

  console.log(
    `User ${socket.id} joined room ${roomId}; ` +
    `${(room.drawingData || []).length} saved events loaded`
  );
}catch (error) {
        socket.emit('error', 'Failed to join room');
      }
    });

    // Explicit leave-room handler so the client can leave a room
    // without closing the underlying WebSocket connection
    socket.on('leave-room', (roomId) => {
      const targetRoom = roomId || socket.currentRoom;

      if (!targetRoom) return;

      socket.leave(targetRoom);

      if (activeRooms.has(targetRoom)) {
        activeRooms.get(targetRoom).delete(socket.id);

        const userCount = activeRooms.get(targetRoom).size;
        io.to(targetRoom).emit('user-count', userCount);

        // Remove cursor for this user
        socket.to(targetRoom).emit('user-disconnected', socket.id);

        if (userCount === 0) {
          activeRooms.delete(targetRoom);
        }
      }

      if (socket.currentRoom === targetRoom) {
        socket.currentRoom = null;
      }
    });

    socket.on('cursor-move', (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('cursor-move', {
          userId: socket.id,
          x: data.x,
          y: data.y
        });
      }
    });

    socket.on('draw-start', async (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-start', data);
        
        // Save to database
        await Room.findOneAndUpdate(
          { roomId: socket.currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: { ...data, action: 'start' },
                timestamp: new Date()
              }
            },
            lastActivity: new Date()
          }
        );
      }
    });

    socket.on('draw-move', async (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-move', data);
        
        // Save to database (throttled)
        await Room.findOneAndUpdate(
          { roomId: socket.currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: { ...data, action: 'move' },
                timestamp: new Date()
              }
            },
            lastActivity: new Date()
          }
        );
      }
    });

    socket.on('draw-end', async (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-end', data);
        
        // Save to database
        await Room.findOneAndUpdate(
          { roomId: socket.currentRoom },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: { ...data, action: 'end' },
                timestamp: new Date()
              }
            },
            lastActivity: new Date()
          }
        );
      }
    });

    socket.on('clear-canvas', async () => {
  const roomId = socket.currentRoom;

  if (!roomId) {
    console.error('Cannot clear canvas: socket has not joined a room');
    return;
  }

  try {
    // Save the clear operation so old drawings do not return.
    await Room.findOneAndUpdate(
      { roomId },
      {
        $set: {
          drawingData: [
            {
              type: 'clear',
              data: {},
              timestamp: new Date()
            }
          ],
          lastActivity: new Date()
        }
      },
      { upsert: true }
    );

    // Broadcast to EVERY participant, including the sender.
    io.to(roomId).emit('clear-canvas');

    console.log(`Canvas cleared in room ${roomId}`);
  } catch (error) {
    console.error('Failed to clear canvas:', error);
    socket.emit('error', 'Failed to clear canvas');
  }
});

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.currentRoom && activeRooms.has(socket.currentRoom)) {
        activeRooms.get(socket.currentRoom).delete(socket.id);
        
        const userCount = activeRooms.get(socket.currentRoom).size;
        io.to(socket.currentRoom).emit('user-count', userCount);
        
        // Remove cursor
        socket.to(socket.currentRoom).emit('user-disconnected', socket.id);
        
        // Clean up empty rooms
        if (userCount === 0) {
          activeRooms.delete(socket.currentRoom);
        }
      }
    });
  });
};

module.exports = socketHandler;