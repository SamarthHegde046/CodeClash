// frontend/src/pages/Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI } from '../services/api';
import { Plus, Link as LinkIcon, Trophy, Swords, Target, Award, Copy, Check } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [createRoomLink, setCreateRoomLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await roomAPI.create();
      const { roomId, joinLink } = response.data;
      
      setCreateRoomLink(joinLink);
      
      // Navigate to the room after a short delay
      setTimeout(() => {
        navigate(`/room/${roomId}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    navigate(`/room/${joinRoomId.trim()}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createRoomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    {
      icon: <Swords className="text-purple-600" size={24} />,
      label: 'Total Battles',
      value: user?.totalBattles || 0,
      bg: 'bg-purple-100'
    },
    {
      icon: <Trophy className="text-yellow-600" size={24} />,
      label: 'Wins',
      value: user?.wins || 0,
      bg: 'bg-yellow-100'
    },
    {
      icon: <Target className="text-red-600" size={24} />,
      label: 'Losses',
      value: user?.losses || 0,
      bg: 'bg-red-100'
    },
    {
      icon: <Award className="text-blue-600" size={24} />,
      label: 'Points',
      value: user?.points || 0,
      bg: 'bg-blue-100'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username}! 👋</h1>
        <p className="text-purple-100 text-lg">Ready to challenge other developers?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className={`${stat.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Create Room */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-4">
            <Plus className="text-purple-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">Create Battle Room</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Start a new coding battle and invite your friends to compete!
          </p>

          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Creating room...</span>
            ) : (
              <>
                <Plus size={20} />
                <span>Create New Room</span>
              </>
            )}
          </button>

          {createRoomLink && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                Room created! Share this link:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={createRoomLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center space-x-1"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Join Room */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-4">
            <LinkIcon className="text-blue-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">Join Battle Room</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Enter a room ID or paste the invite link to join an existing battle!
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Enter Room ID (e.g., abc123)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              onClick={handleJoinRoom}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
            >
              <LinkIcon size={20} />
              <span>Join Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Quick Guide */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Play 🎮</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">1</div>
            <h3 className="font-semibold text-lg">Create or Join</h3>
            <p className="text-gray-600 text-sm">
              Create a new room or join using a room ID shared by your friend
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">2</div>
            <h3 className="font-semibold text-lg">Wait & Start</h3>
            <p className="text-gray-600 text-sm">
              Wait for players to join, then the host starts the battle
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">3</div>
            <h3 className="font-semibold text-lg">Code & Win</h3>
            <p className="text-gray-600 text-sm">
              Solve the coding problem faster than others and win points!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;