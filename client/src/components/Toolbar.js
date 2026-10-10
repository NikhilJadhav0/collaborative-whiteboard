import React from 'react';

const Toolbar = ({ 
  strokeWidth, 
  setStrokeWidth, 
  strokeColor, 
  setStrokeColor, 
  onClearCanvas 
}) => {
  const colors = ['black', 'red', 'blue', 'green'];

  return (
    <div className="toolbar">
      <div className="tool-group">
        <label>Brush Size:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
        />
        <span>{strokeWidth}px</span>
      </div>
      
      <div className="tool-group">
        <label>Color:</label>
        <div className="color-picker">
          {colors.map(color => (
            <button
              key={color}
              className={`color-btn ${strokeColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setStrokeColor(color)}
            />
          ))}
        </div>
      </div>
      
      <div className="tool-group">
        <button className="clear-btn" onClick={onClearCanvas}>
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Toolbar;