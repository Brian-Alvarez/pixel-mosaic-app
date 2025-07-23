import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GRID_SIZE = 100;

type PixelData = {
  color: string;
  ownerId: string | null;
};

const PixelGrid = () => {
  const [pixels, setPixels] = useState<{ [key: string]: PixelData }>({});
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const { email, userId, logout } = useAuth();

  useEffect(() => {
    axios
      .get('/api/pixels')
      .then(res => setPixels(res.data))
      .catch(err => console.error('Failed to fetch pixels:', err));
  }, []);

  const handleClick = async (row: number, col: number) => {
    const pixelId = `${row}-${col}`;
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in to purchase a pixel.');

    const pixel = pixels[pixelId];

    if (!pixel?.ownerId) {
      try {
        const res = await axios.post('/api/checkout', { pixelId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.location.href = res.data.url;
      } catch (err) {
        console.error('Checkout failed:', err);
        alert('Failed to start checkout.');
      }
    } else if (pixel.ownerId === userId) {
      try {
        await axios.post(`/api/pixels/${pixelId}/color`, {
          color: selectedColor,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
    } else {
      alert('This pixel is owned by someone else.');
    }
  };

const placeDragon = async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("You must be logged in to place the dragon.");

  try {
    const response = await fetch("/dragon_pixel_map_100x100.json");
    const pixelArray = await response.json(); // should be an array of { row, col, color }

    const res = await fetch("/api/place-dragon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pixelArray), // send the array directly
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to place dragon.");
    }

    alert("Dragon placed!");
    // Optionally, refresh pixels:
    const updated = await axios.get("/api/pixels");
    setPixels(updated.data);
  } catch (err) {
    console.error("Error placing dragon:", err);
    alert("Something went wrong while placing the dragon.");
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
            title={title}
            onClick={() => handleClick(row, col)}
            style={{ backgroundColor: color }}
            className="transition-transform duration-100 group-hover:border group-hover:border-gray-300 hover:scale-125 hover:outline hover:outline-1 hover:outline-black"
          />
        );
      }
    }

    return grid;
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold mb-2">Pixel Grid</h2>

      {email && (
        <div className="mb-4">
          Logged in as <strong>{email}</strong>{' '}
          <button
            onClick={logout}
            className="ml-2 px-2 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded"
          >
            Logout
          </button>
        </div>
      )}

      <input
        type="color"
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
        className="mb-4"
      />
      <button
        onClick={placeDragon}
        className="mb-4 ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Place Dragon 🐉
      </button>

      <div
        className="group mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 10px)`,
          gridAutoRows: '10px',
          gap: '0px',
          width: `${GRID_SIZE * 10}px`,
          overflow: 'auto'
        }}
      >
        {renderGrid()}
      </div>
    </div>
  );
};

export default PixelGrid;
