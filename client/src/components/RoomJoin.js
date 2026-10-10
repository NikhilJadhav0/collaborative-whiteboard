import React, { useState } from 'react';

const RoomJoin = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    setIsJoining(true);
    try {
      await onJoinRoom(roomId.trim().toUpperCase());
    } catch (error) {
      alert('Failed to join room. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const generateRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  return (
    <div className="room-join">
      <div className="room-join-container">
        <h1>Collaborative Whiteboard</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room code"
              maxLength="8"
              disabled={isJoining}
            />
            <button type="submit" disabled={isJoining || !roomId.trim()}>
              {isJoining ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>
        <button 
          className="generate-room-btn"
          onClick={generateRandomRoom}
          disabled={isJoining}
        >
          Generate Random Room
        </button>
      </div>
    </div>
  );
};

export default RoomJoin;