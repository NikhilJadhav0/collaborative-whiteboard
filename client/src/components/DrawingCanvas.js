import React, { useRef, useEffect, useState, useCallback } from 'react';

const DrawingCanvas = ({ 
  socket, 
  strokeWidth, 
  strokeColor, 
  onClearCanvas,
  cursors,
  setCursors 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Set drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setContext(ctx);
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    
const replayDrawingHistory = (history) => {
  if (!context || !canvasRef.current) return;

  const canvas = canvasRef.current;
  const pixelRatio = window.devicePixelRatio || 1;

  // Clear the canvas using its logical dimensions.
  context.clearRect(
    0,
    0,
    canvas.width / pixelRatio,
    canvas.height / pixelRatio
  );

  // Replay saved events in their original order.
  history.forEach((command) => {
    if (command.type === 'clear') {
      context.clearRect(
        0,
        0,
        canvas.width / pixelRatio,
        canvas.height / pixelRatio
      );
      return;
    }

    const data = command.data || {};

    if (data.action === 'start') {
      context.beginPath();
      context.moveTo(data.x, data.y);
      context.strokeStyle = data.color || '#000000';
      context.lineWidth = data.width || 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
    } else if (data.action === 'move') {
      context.lineTo(data.x, data.y);
      context.stroke();
    } else if (data.action === 'end') {
      context.closePath();
    }
  });
};

socket.on('drawing-history', replayDrawingHistory);

    socket.on('draw-start', (data) => {
      if (context) {
        context.beginPath();
        context.moveTo(data.x, data.y);
        context.strokeStyle = data.color;
        context.lineWidth = data.width;
      }
    });

    socket.on('draw-move', (data) => {
      if (context) {
        context.lineTo(data.x, data.y);
        context.stroke();
      }
    });

    socket.on('draw-end', () => {
      if (context) {
        context.closePath();
      }
    });

   socket.on('clear-canvas', () => {
  const canvas = canvasRef.current;

  if (!context || !canvas) return;

  const pixelRatio = window.devicePixelRatio || 1;

  context.clearRect(
    0,
    0,
    canvas.width / pixelRatio,
    canvas.height / pixelRatio
  );
});

    socket.on('cursor-move', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y }
      }));
    });

    socket.on('user-disconnected', (userId) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    });

    return () => {
      socket.off('draw-start');
      socket.off('draw-move');
      socket.off('draw-end');
      socket.off('clear-canvas');
      socket.off('cursor-move');
      socket.off('user-disconnected');
      socket.off('drawing-history', replayDrawingHistory);
    };
  }, [socket, context, setCursors]);

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e) => {
    if (!context) return;
    
    const pos = getMousePos(e);
    setIsDrawing(true);
    
    context.beginPath();
    context.moveTo(pos.x, pos.y);
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;
    
    socket.emit('draw-start', {
      x: pos.x,
      y: pos.y,
      color: strokeColor,
      width: strokeWidth
    });
  }, [context, strokeColor, strokeWidth, socket, getMousePos]);

  const draw = useCallback((e) => {
    if (!isDrawing || !context) return;
    
    const pos = getMousePos(e);
    
    context.lineTo(pos.x, pos.y);
    context.stroke();
    
    socket.emit('draw-move', pos);
  }, [isDrawing, context, socket, getMousePos]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !context) return;
    
    setIsDrawing(false);
    context.closePath();
    
    socket.emit('draw-end');
  }, [isDrawing, context, socket]);

  const handleMouseMove = useCallback((e) => {
    const pos = getMousePos(e);
    socket.emit('cursor-move', pos);
    
    if (isDrawing) {
      draw(e);
    }
  }, [socket, getMousePos, isDrawing, draw]);

  const clearCanvas = useCallback(() => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      socket.emit('clear-canvas');
      onClearCanvas();
    }
  }, [context, socket, onClearCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={startDrawing}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default DrawingCanvas;