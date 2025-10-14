// frontend/src/pages/Room.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI } from '../services/api';
import { getSocket } from '../services/socket';
import CodeEditor from '../components/CodeEditor';
import PlayerList from '../components/PlayerList';
import QuestionPanel from '../components/QuestionPanel';
import ResultModal from '../components/ResultModal';
import { Play, Send, Loader, Trophy, Users, MessageCircle } from 'lucide-react';

const Room = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useRef(null);

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [status, setStatus] = useState('waiting'); // waiting, active, finished
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isWinner, setIsWinner] = useState(false);
  const [error, setError] = useState('');
  const [chatMessages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Initialize socket
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
      setStatus(data.status);
      if (data.question) {
        setQuestion(data.question);
        setCode(data.question.starterCode[language] || '');
      }
    });

    socket.current.on('playerJoined', (data) => {
      setPlayers(data.players);
    });

    socket.current.on('playerLeft', (data) => {
      setPlayers(prev => prev.filter(p => p.userId !== data.userId));
    });

    socket.current.on('battleStarted', (data) => {
      setQuestion(data.question);
      setStatus('active');
      setCode(data.question.starterCode[language] || '');
    });

    socket.current.on('userSubmitting', (data) => {
      // You can show a notification that someone is submitting
      console.log(`${data.username} is submitting their code`);
    });

    socket.current.on('submissionResult', (data) => {
      setSubmitting(false);
      setResults(data);
      setShowResults(true);
    });

    socket.current.on('battleEnded', (data) => {
      setStatus('finished');
      if (data.winner.userId === user.id) {
        setIsWinner(true);
      }
      // Optionally show winner announcement
      setTimeout(() => {
        navigate(`/result/${roomId}`);
      }, 3000);
    });

    socket.current.on('newMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.current.on('error', (data) => {
      setError(data.message);
      setSubmitting(false);
    });

    // Cleanup
    return () => {
      if (socket.current) {
        socket.current.off('roomJoined');
        socket.current.off('playerJoined');
        socket.current.off('playerLeft');
        socket.current.off('battleStarted');
        socket.current.off('userSubmitting');
        socket.current.off('submissionResult');
        socket.current.off('battleEnded');
        socket.current.off('newMessage');
        socket.current.off('error');
      }
    };
  }, [roomId, user, navigate, language]);

  const handleStartBattle = () => {
    socket.current.emit('startBattle', {
      roomId,
      userId: user.id
    });
  };

  const handleSubmitCode = () => {
    if (!code.trim()) {
      setError('Please write some code before submitting');
      return;
    }

    setSubmitting(true);
    setError('');
    
    socket.current.emit('submitCode', {
      roomId,
      code,
      language
    });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (question && question.starterCode) {
      setCode(question.starterCode[newLanguage] || '');
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">❌</div>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const isHost = room?.host === user?.id;
  const canStart = isHost && status === 'waiting' && players.length >= 2;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Room: {roomId}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
              status === 'active' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isHost && status === 'waiting' && (
              <button
                onClick={handleStartBattle}
                disabled={!canStart}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Play size={18} />
                <span>Start Battle</span>
              </button>
            )}
            
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <MessageCircle size={18} />
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>
        </div>

        {!canStart && isHost && status === 'waiting' && (
          <p className="text-amber-600 text-sm mt-2">
            Waiting for at least 2 players to start the battle...
          </p>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Players */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <PlayerList 
            players={players}
            hostId={room?.host}
            currentUserId={user?.id}
          />

          {/* Chat Section */}
          {showChat && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 h-64 flex flex-col">
              <h3 className="font-semibold mb-2 flex items-center space-x-2">
                <MessageCircle size={18} />
                <span>Chat</span>
              </h3>
              <div className="flex-1 overflow-y-auto mb-2 space-y-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-semibold text-purple-600">{msg.username}:</span>
                    <span className="ml-1 text-gray-700">{msg.message}</span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center - Question & Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question Panel */}
          <div className="h-1/3 overflow-y-auto p-4 border-b border-gray-200">
            <QuestionPanel question={question} />
          </div>

          {/* Code Editor */}
          <div className="h-2/3 flex flex-col p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Language:</label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  disabled={status !== 'active'}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <button
                onClick={handleSubmitCode}
                disabled={status !== 'active' || submitting}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1">
              <CodeEditor
                code={code}
                language={language}
                onChange={(value) => setCode(value || '')}
                readOnly={status !== 'active'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && results && (
        <ResultModal
          results={results}
          onClose={() => setShowResults(false)}
          isWinner={isWinner}
        />
      )}
    </div>
  );
};

export default Room;