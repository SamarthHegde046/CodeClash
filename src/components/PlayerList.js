// frontend/src/components/PlayerList.js
import React from 'react';
import { Users, Crown } from 'lucide-react';

const PlayerList = ({ players, hostId, currentUserId }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="text-purple-600" size={20} />
        <h3 className="font-semibold text-lg">Players ({players.length})</h3>
      </div>

      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={player.userId}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.userId === currentUserId
                ? 'bg-purple-100 border-2 border-purple-500'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <span className="font-medium">{player.username}</span>
              {player.userId === currentUserId && (
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                  You
                </span>
              )}
            </div>
            {player.userId === hostId && (
              <Crown className="text-yellow-500" size={20} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;