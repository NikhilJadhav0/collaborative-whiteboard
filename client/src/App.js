import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = async (roomId) => {
    try {
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${serverUrl}/api/rooms/join`, { roomId });
      
      if (response.data.success) {
        socket.emit('join-room', roomId);
        setCurrentRoom(roomId);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave-room', currentRoom);
      setCurrentRoom(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="app">
        <div className="connection-status">
          Connecting to server...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!currentRoom ? (
        <RoomJoin onJoinRoom={joinRoom} />
      ) : (
        <Whiteboard 
          socket={socket} 
          roomId={currentRoom} 
          onLeaveRoom={leaveRoom} 
        />
      )}
    </div>
  );
}

export default App;
