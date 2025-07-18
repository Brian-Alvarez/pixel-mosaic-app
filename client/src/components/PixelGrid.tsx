import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PixelGrid.css';

const GRID_SIZE = 10; // 10x10 grid

type PixelData = {
  color: string;
  ownerId: string | null;
};

const PixelGrid = () => {
  const [pixels, setPixels] = useState<{ [key: string]: PixelData }>({});
  const [selectedColor, setSelectedColor] = useState('#ff0000');

    useEffect(() => {
    axios.get('/api/pixels')
      .then(res => setPixels(res.data))
      .catch(err => console.error('Failed to fetch pixels:', err));
  }, []);


  const handleClick = async (row: number, col: number) => {
    const pixelId = `${row}-${col}`;
    const token = localStorage.getItem('token');
if (!token) {
  alert('You must be logged in to change pixel colors.');
  return;
}


    try {
      await axios.post(`/api/pixels/${pixelId}/color`, {
        color: selectedColor,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      // optimistic UI update
      setPixels(prev => ({
        ...prev,
        [pixelId]: {
          ...prev[pixelId],
          color: selectedColor,
        }
      }));
    } catch (err) {
      console.error('Error updating pixel color:', err);
    }
  };
  // Transform pixelStore object into a 2D array for rendering

    const renderGrid = () => {
    const grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
  for (let col = 0; col < GRID_SIZE; col++) {

        const id = `${row}-${col}`;
        const color = pixels[id]?.color || '#ffffff';
        grid.push(
          <div
            key={id}
            className="pixel"
            style={{ backgroundColor: color }}
            onClick={() => handleClick(row, col)}
          />
        );
      }
    }
    return grid;
  };

    if (Object.keys(pixels).length === 0) {
  return <p>Loading pixel grid...</p>;
}

    return (
    <div className="pixel-grid-wrapper">
      <h2>Pixel Grid</h2>
      <input
        type="color"
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
      />
      <div className="grid">{renderGrid()}</div>
    </div>
  );


};

export default PixelGrid;
