import React, { useState, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';

const Whiteboard = ({ socket, roomId, onLeaveRoom }) => {
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeColor, setStrokeColor] = useState('black');
  const [userCount, setUserCount] = useState(0);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    if (!socket) return;

    socket.on('user-count', (count) => {
      setUserCount(count);
    });

    return () => {
      socket.off('user-count');
    };
  }, [socket]);

  const handleClearCanvas = () => {
if (!socket) return;
  socket.emit('clear-canvas');
  };

  return (
    <div className="whiteboard">
      <div className="whiteboard-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <span className="user-count">Users: {userCount}</span>
        </div>
        <button className="leave-room-btn" onClick={onLeaveRoom}>
          Leave Room
        </button>
      </div>
      
      <Toolbar
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        onClearCanvas={handleClearCanvas}
      />
      
      <div className="canvas-container">
        <DrawingCanvas
          socket={socket}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          onClearCanvas={handleClearCanvas}
          cursors={cursors}
          setCursors={setCursors}
        />
        <UserCursors cursors={cursors} />
      </div>
    </div>
  );
};

export default Whiteboard;