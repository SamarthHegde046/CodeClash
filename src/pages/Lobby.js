// frontend/src/pages/Lobby.js (NEW - Pre-Battle Waiting Room)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { 
  Users, Crown, Copy, Check, Play, Loader, 
  MessageCircle, Send, Link as LinkIcon, UserPlus,
  Clock, Trophy, Zap
} from 'lucide-react';

const Lobby = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useRef(null);
  const chatEndRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(1200);
  const [chatMessages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const joinLink = `${window.location.origin}/room/${roomId}`;

  useEffect(() => {
    if (!user) return;

    socket.current = getSocket();

    // Check if room exists
    roomAPI.checkExists(roomId)
      .then(response => {
        if (!response.data.exists) {
          setError(response.data.message || 'Room not found');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        // Join room via socket
        socket.current.emit('joinRoom', {
          roomId,
          userId: user.id,
          username: user.username
        });

        setLoading(false);
      })
      .catch(err => {
        setError('Failed to check room');
        setLoading(false);
      });

    // Socket event listeners
    socket.current.on('roomJoined', (data) => {
      setRoom(data);
      setPlayers(data.players);
      
      // If battle already started, navigate to battle page
      if (data.status === 'active') {
        navigate(`/battle/${roomId}`);
      }
    });

    socket.current.on('playerJoined', (data) => {
      setPlayers(data.players);
      
      // Add system message
      const joinedPlayer = data.players.find(p => 
        !players.some(existing => existing.userId === p.userId)
      );
      if (joinedPlayer && joinedPlayer.userId !== user.id) {
        setMessages(prev => [...prev, {
          type: 'system',
          message: `${joinedPlayer.username} joined the room`,
          timestamp: new Date()
        }]);
      }
    });

    socket.current.on('playerLeft', (data) => {
      setPlayers(prev => prev.filter(p => p.userId !== data.userId));
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${data.username} left the room`,
        timestamp: new Date()
      }]);
    });

    socket.current.on('battleStarted', (data) => {
      // Navigate all players to battle page
      navigate(`/battle/${roomId}`);
    });

    socket.current.on('newMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.current.on('error', (data) => {
      setError(data.message);
    });

    // Cleanup
    return () => {
      if (socket.current) {
        socket.current.off('roomJoined');
        socket.current.off('playerJoined');
        socket.current.off('playerLeft');
        socket.current.off('battleStarted');
        socket.current.off('newMessage');
        socket.current.off('error');
      }
    };
  }, [roomId, user, navigate]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartBattle = () => {
    socket.current.emit('startBattle', {
      roomId,
      userId: user.id,
      duration: parseInt(duration)
    });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    socket.current.emit('sendMessage', {
      roomId,
      message: chatInput
    });
    
    setChatInput('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Joining lobby...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const isHost = room?.host === user?.id;
  const canStart = isHost && players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Battle Lobby
              </h1>
              <p className="text-gray-600">Room ID: <span className="font-mono font-semibold text-purple-600">{roomId}</span></p>
            </div>
            <div className="text-right">
              {isHost && (
                <span className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <Crown size={16} />
                  <span>You're the Host</span>
                </span>
              )}
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <LinkIcon className="text-purple-600" size={20} />
              <span className="font-semibold text-gray-700">Share this link to invite players:</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={joinLink}
                readOnly
                className="flex-1 px-4 py-2 bg-white border border-purple-300 rounded-lg text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Players & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Players List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="text-purple-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">
                  Players ({players.length})
                </h2>
              </div>

              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={player.userId}
                    className={`flex items-center justify-between p-3 rounded-lg transition ${
                      player.userId === user?.id
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {player.username}
                        </p>
                        {player.userId === user?.id && (
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                    {player.userId === room?.host && (
                      <Crown className="text-yellow-500" size={20} />
                    )}
                  </div>
                ))}

                {players.length < 2 && (
                  <div className="text-center py-6 text-gray-500">
                    <UserPlus className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm">Waiting for more players...</p>
                    <p className="text-xs mt-1">Need at least 2 players to start</p>
                  </div>
                )}
              </div>
            </div>

            {/* Battle Settings (Host Only) */}
            {isHost && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="text-blue-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">
                    Battle Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={600}>⚡ 10 Minutes - Quick Battle</option>
                      <option value={900}>🔥 15 Minutes - Sprint</option>
                      <option value={1200}>⚔️ 20 Minutes - Standard</option>
                      <option value={1800}>🎯 30 Minutes - Extended</option>
                      <option value={2700}>🏆 45 Minutes - Marathon</option>
                      <option value={3600}>👑 60 Minutes - Epic</option>
                    </select>
                  </div>

                  <button
                    onClick={handleStartBattle}
                    disabled={!canStart}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <Play size={24} />
                    <span>Start Battle!</span>
                  </button>

                  {!canStart && (
                    <p className="text-amber-600 text-sm text-center">
                      ⚠️ Need at least 2 players to start
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Battle Info */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-3">How It Works</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <Zap size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Host starts the battle when ready</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Trophy size={16} className="mt-0.5 flex-shrink-0" />
                  <span>All players get the same coding challenge</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Solve it before time runs out</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Crown size={16} className="mt-0.5 flex-shrink-0" />
                  <span>First to pass all tests wins!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <MessageCircle size={24} />
                  <h2 className="text-xl font-bold">Lobby Chat</h2>
                </div>
                <p className="text-purple-100 text-sm mt-1">
                  Chat with other players while waiting
                </p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx}>
                      {msg.type === 'system' ? (
                        <div className="text-center">
                          <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                            {msg.message}
                          </span>
                        </div>
                      ) : (
                        <div className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md ${
                            msg.userId === user?.id 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-white border border-gray-200'
                          } rounded-lg px-4 py-2 shadow`}>
                            <p className={`font-semibold text-sm mb-1 ${
                              msg.userId === user?.id ? 'text-purple-200' : 'text-purple-600'
                            }`}>
                              {msg.username}
                              {msg.userId === user?.id && ' (You)'}
                            </p>
                            <p className={msg.userId === user?.id ? 'text-white' : 'text-gray-800'}>
                              {msg.message}
                            </p>
                            <p className={`text-xs mt-1 ${
                              msg.userId === user?.id ? 'text-purple-200' : 'text-gray-400'
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
                  >
                    <Send size={20} />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;