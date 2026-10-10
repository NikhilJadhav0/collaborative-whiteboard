import React from 'react';

const UserCursors = ({ cursors }) => {
  const cursorColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d'];

  return (
    <div className="user-cursors">
      {Object.entries(cursors).map(([userId, position], index) => (
        <div
          key={userId}
          className="user-cursor"
          style={{
            left: position.x,
            top: position.y,
            borderColor: cursorColors[index % cursorColors.length]
          }}
        />
      ))}
    </div>
  );
};

export default UserCursors;