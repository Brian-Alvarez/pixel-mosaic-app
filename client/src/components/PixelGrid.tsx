import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PixelGrid.css';
import { useAuth } from '../context/AuthContext';

const GRID_SIZE = 10;

type PixelData = {
  color: string;
  ownerId: string | null;
};

const PixelGrid = () => {
  const [pixels, setPixels] = useState<{ [key: string]: PixelData }>({});
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const { email, userId, logout } = useAuth();

  useEffect(() => {
    axios.get('/api/pixels')
      .then(res => setPixels(res.data))
      .catch(err => console.error('Failed to fetch pixels:', err));
  }, []);

  const handleClick = async (row: number, col: number) => {
    const pixelId = `${row}-${col}`;
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in to change pixels.');

    try {
      await axios.post(`/api/pixels/${pixelId}/color`, {
        color: selectedColor,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setPixels(prev => ({
        ...prev,
        [pixelId]: {
          ...prev[pixelId],
          color: selectedColor,
          ownerId: userId,
        }
      }));
    } catch (err) {
      console.error('Error updating pixel color:', err);
    }
  };

  const renderGrid = () => {
    const grid = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const id = `${row}-${col}`;
        const pixel = pixels[id];
        const color = pixel?.color || '#ffffff';

        const title = pixel?.ownerId
          ? pixel.ownerId === userId
            ? 'Owned by you'
            : 'Owned by someone else'
          : 'Unclaimed';

        grid.push(
          <div
            key={id}
            className="pixel"
            style={{ backgroundColor: color }}
            title={title}
            onClick={() => handleClick(row, col)}
          />
        );
      }
    }

    return grid;
  };

  return (
    <div className="pixel-grid-wrapper">
      <h2>Pixel Grid</h2>

      {email && (
        <div style={{ marginBottom: '1rem' }}>
          Logged in as <strong>{email}</strong> | <button onClick={logout}>Logout</button>
        </div>
      )}

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
