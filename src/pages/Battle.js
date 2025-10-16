// frontend/src/pages/Battle.js (FIXED VERSION)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI } from '../services/api';
import { getSocket } from '../services/socket';
import CodeEditor from '../components/CodeEditor';
import PlayerList from '../components/PlayerList';
import QuestionPanel from '../components/QuestionPanel';
import ResultModal from '../components/ResultModal';
import { Play, Send, Loader, Clock, CheckCircle, MessageCircle, X } from 'lucide-react';

const Battle = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useRef(null);
  const chatEndRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [status, setStatus] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [chatMessages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // Timer states
  const [duration, setDuration] = useState(1200);
  const [remainingTime, setRemainingTime] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const [lastRunResults, setLastRunResults] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [finishedCount, setFinishedCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Auto-scroll chat
  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  useEffect(() => {
    if (!user) return;

    socket.current = getSocket();

    roomAPI.checkExists(roomId)
      .then(response => {
        if (!response.data.exists) {
          setError(response.data.message || 'Room not found');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

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
      setTotalPlayers(data.players.length);
      
      if (data.question) {
        setQuestion(data.question);
        setCode(data.question.starterCode[language] || '');
      }
      
      if (data.duration) {
        setDuration(data.duration);
      }
      
      if (data.remainingTime !== null) {
        setRemainingTime(data.remainingTime);
      }

      // If battle not active, redirect to lobby
      if (data.status === 'waiting') {
        navigate(`/room/${roomId}`);
      }
    });

    socket.current.on('playerJoined', (data) => {
      setPlayers(data.players);
      setTotalPlayers(data.players.length);
    });

    socket.current.on('playerLeft', (data) => {
      setPlayers(prev => prev.filter(p => p.userId !== data.userId));
      setTotalPlayers(prev => prev - 1);
    });

    socket.current.on('battleStarted', (data) => {
      setQuestion(data.question);
      setStatus('active');
      setCode(data.question.starterCode[language] || '');
      setDuration(data.duration);
      setRemainingTime(data.duration);
    });

    socket.current.on('timerUpdate', (data) => {
      setRemainingTime(data.remainingTime);
    });

    socket.current.on('codeRunning', (data) => {
      setRunning(true);
    });

    socket.current.on('runResult', (data) => {
      setRunning(false);
      setResults(data);
      setLastRunResults(data);
      setHasRun(true);
      setShowResults(true);
    });

    socket.current.on('submissionAccepted', (data) => {
      setSubmitting(false);
      setSubmitted(true);
      setLastRunResults(data.testResults);
      setShowResults(false);
    });

    socket.current.on('playerSubmitted', (data) => {
      setFinishedCount(data.finishedCount);
      setTotalPlayers(data.totalPlayers);
    });

    socket.current.on('battleEnded', (data) => {
      setStatus('finished');
      setTimeout(() => {
        navigate(`/result/${roomId}`);
      }, 2000);
    });

    socket.current.on('newMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.current.on('error', (data) => {
      setError(data.message);
      setRunning(false);
      setSubmitting(false);
    });

    return () => {
      if (socket.current) {
        socket.current.off('roomJoined');
        socket.current.off('playerJoined');
        socket.current.off('playerLeft');
        socket.current.off('battleStarted');
        socket.current.off('timerUpdate');
        socket.current.off('codeRunning');
        socket.current.off('runResult');
        socket.current.off('submissionAccepted');
        socket.current.off('playerSubmitted');
        socket.current.off('battleEnded');
        socket.current.off('newMessage');
        socket.current.off('error');
      }
    };
  }, [roomId, user, navigate, language]);

  const handleRunCode = () => {
    if (!code.trim()) {
      setError('Please write some code before running');
      return;
    }

    setRunning(true);
    setError('');
    
    socket.current.emit('runCode', {
      roomId,
      code,
      language
    });
  };

  const handleSubmitCode = () => {
    if (!hasRun) {
      setError('Please run your code at least once before submitting');
      return;
    }

    setSubmitting(true);
    setError('');
    
    socket.current.emit('submitCode', {
      roomId
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

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (remainingTime === null) return 'text-gray-600';
    if (remainingTime > 300) return 'text-green-600';
    if (remainingTime > 60) return 'text-yellow-600';
    return 'text-red-600 animate-pulse';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Joining battle...</p>
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

  // Waiting for results page
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto text-green-500 animate-bounce" size={80} />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Submission Successful! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Your code has been submitted. Waiting for other players to finish...
          </p>

          {lastRunResults && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-3">Your Results:</h3>
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {lastRunResults.passedTests}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-4xl text-gray-300">/</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-700">
                    {lastRunResults.totalTests}
                  </div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Loader className="animate-spin text-blue-600" size={24} />
              <span className="text-lg font-semibold text-blue-800">
                Waiting for others...
              </span>
            </div>
            <p className="text-blue-700">
              {finishedCount} / {totalPlayers} players have submitted
            </p>
            
            <div className="mt-4 w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(finishedCount / totalPlayers) * 100}%` }}
              ></div>
            </div>
          </div>

          <p className="text-gray-500 mt-6 text-sm">
            You'll be redirected to the results page when everyone is done or time runs out
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Battle: {roomId}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
              status === 'active' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status.toUpperCase()}
            </span>

            {/* Timer Display */}
            {status === 'active' && remainingTime !== null && (
              <div className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg ${getTimerColor()}`}>
                <Clock size={20} />
                <span className="text-xl font-bold font-mono">
                  {formatTime(remainingTime)}
                </span>
              </div>
            )}
          </div>
        </div>
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

          {/* Last Run Results Summary */}
          {hasRun && lastRunResults && status === 'active' && (
            <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
                <CheckCircle size={18} />
                <span>Last Run</span>
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Tests Passed:</span>
                <span className="font-bold text-green-600">
                  {lastRunResults.passedTests}/{lastRunResults.totalTests}
                </span>
              </div>
              {lastRunResults.allPassed && (
                <div className="mt-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded text-center">
                  ✅ All tests passed! Ready to submit
                </div>
              )}
            </div>
          )}

          {/* Chat Section */}
          {showChat ? (
            <div className="mt-4 bg-white rounded-lg shadow-md border-2 border-purple-300 flex flex-col" style={{ height: '300px' }}>
              <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle size={18} />
                  <span className="font-semibold">Battle Chat</span>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="hover:bg-purple-700 p-1 rounded transition"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.type === 'system' ? (
                      <div className="text-center">
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {msg.message}
                        </span>
                      </div>
                    ) : (
                      <div className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${
                          msg.userId === user?.id 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-white border border-gray-200'
                        } rounded-lg px-3 py-2 text-xs`}>
                          <p className={`font-semibold mb-1 ${
                            msg.userId === user?.id ? 'text-purple-200' : 'text-purple-600'
                          }`}>
                            {msg.username}
                          </p>
                          <p>{msg.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="p-2 border-t border-gray-200 bg-white rounded-b-lg">
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
            </div>
          ) : (
            <button
              onClick={() => setShowChat(true)}
              className="mt-4 w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
            >
              <MessageCircle size={18} />
              <span>Open Chat</span>
            </button>
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

              <div className="flex items-center space-x-3">
                {/* Run Button */}
                <button
                  onClick={handleRunCode}
                  disabled={status !== 'active' || running}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {running ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      <span>Run Code</span>
                    </>
                  )}
                </button>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitCode}
                  disabled={status !== 'active' || submitting || !hasRun}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  title={!hasRun ? 'Run your code first before submitting' : 'Submit your final solution'}
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hint message */}
            {status === 'active' && !hasRun && (
              <div className="mb-2 bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm text-blue-800">
                💡 Tip: Click "Run Code" to test your solution before submitting
              </div>
            )}

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

      {/* Results Modal (for Run Code) */}
      {showResults && results && !submitted && (
        <ResultModal
          results={results}
          onClose={() => setShowResults(false)}
          isWinner={false}
          isRunOnly={true}
        />
      )}
    </div>
  );
};

export default Battle;