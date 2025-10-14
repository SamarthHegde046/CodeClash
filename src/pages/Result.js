// frontend/src/pages/Result.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomAPI } from '../services/api';
import { Trophy, Target, Clock, Users, Home, BarChart } from 'lucide-react';

const Result = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const response = await roomAPI.get(roomId);
      setRoom(response.data.room);
    } catch (err) {
      setError('Failed to load battle results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-purple-600 mx-auto mb-4 text-4xl">⚡</div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <p className="text-red-600 font-semibold mb-4">{error || 'Room not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const winner = room.players.find(p => p.userId._id === room.winner?.toString());
  const duration = room.finishedAt && room.startedAt 
    ? Math.floor((new Date(room.finishedAt) - new Date(room.startedAt)) / 1000)
    : 0;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Winner Announcement */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-lg shadow-2xl p-12 text-white mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <Trophy className="mx-auto mb-4 animate-bounce" size={64} />
          <h1 className="text-5xl font-bold mb-2">🎉 Battle Complete! 🎉</h1>
          <p className="text-2xl font-semibold text-yellow-100 mb-4">
            Winner: <span className="text-white">{winner?.username || 'Unknown'}</span>
          </p>
          <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <p className="text-lg">
              Solved in <span className="font-bold">{formatDuration(duration)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Battle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="text-purple-600" size={24} />
            <h3 className="font-semibold text-gray-700">Participants</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{room.players.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="text-blue-600" size={24} />
            <h3 className="font-semibold text-gray-700">Duration</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatDuration(duration)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="text-green-600" size={24} />
            <h3 className="font-semibold text-gray-700">Difficulty</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {room.question?.difficulty || 'N/A'}
          </p>
        </div>
      </div>

      {/* Question Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Problem Solved</h2>
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-700">Title:</span>
            <span className="ml-2 text-gray-800">{room.question?.title || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Description:</span>
            <p className="text-gray-600 mt-1 whitespace-pre-wrap">
              {room.question?.description || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Players Ranking */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart className="text-purple-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Final Standings</h2>
        </div>
        
        <div className="space-y-3">
          {room.players.map((player, index) => {
            const isWinner = player.userId._id === room.winner?.toString();
            
            return (
              <div
                key={player.userId._id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isWinner
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isWinner
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {player.username}
                    </p>
                    {isWinner && (
                      <p className="text-xs text-orange-700 font-medium">
                        🏆 Winner (+100 points)
                      </p>
                    )}
                  </div>
                </div>
                
                {isWinner && (
                  <Trophy className="text-yellow-600" size={24} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center space-x-2"
        >
          <Home size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <button
          onClick={() => navigate('/leaderboard')}
          className="flex-1 bg-yellow-600 text-white py-4 rounded-lg font-semibold hover:bg-yellow-700 transition flex items-center justify-center space-x-2"
        >
          <Trophy size={20} />
          <span>View Leaderboard</span>
        </button>
      </div>
    </div>
  );
};

export default Result;