// frontend/src/pages/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import { Trophy, Medal, Award, TrendingUp, Loader } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getTop();
      setLeaderboard(response.data.leaderboard);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={32} />;
      case 2:
        return <Medal className="text-gray-400" size={28} />;
      case 3:
        return <Award className="text-amber-600" size={28} />;
      default:
        return null;
    }
  };

  const getWinRate = (wins, totalBattles) => {
    if (totalBattles === 0) return 0;
    return Math.round((wins / totalBattles) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Trophy size={40} />
          <h1 className="text-4xl font-bold">Global Leaderboard</h1>
        </div>
        <p className="text-yellow-100 text-lg">
          Top coding warriors competing worldwide
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No players yet. Be the first to compete!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Player
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Points
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Battles
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((player, index) => {
                  const rank = index + 1;
                  const winRate = getWinRate(player.wins, player.totalBattles);
                  
                  return (
                    <tr
                      key={player._id}
                      className={`hover:bg-gray-50 transition ${
                        rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getMedalIcon(rank)}
                          <span className="text-2xl font-bold text-gray-700">
                            #{rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {player.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="text-purple-600" size={16} />
                          <span className="font-bold text-purple-600 text-lg">
                            {player.points}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-700">{player.totalBattles}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-green-600">
                          {player.wins}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-800">
                            {winRate}%
                          </span>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${winRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Points Work</h3>
        <ul className="space-y-1 text-blue-800 text-sm">
          <li>🏆 Win a battle: <strong>+100 points</strong></li>
          <li>🎯 Participate: <strong>+10 points</strong></li>
          <li>⚡ The faster you solve, the better your chances of winning!</li>
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;

