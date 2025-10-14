// frontend/src/components/ResultModal.js
import React from 'react';
import { CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultModal = ({ results, onClose, isWinner }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            {isWinner ? (
              <>
                <Trophy className="mx-auto text-yellow-500 mb-2" size={48} />
                <h2 className="text-3xl font-bold text-green-600">
                  🎉 Congratulations! You Won! 🎉
                </h2>
              </>
            ) : results.allPassed ? (
              <>
                <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
                <h2 className="text-2xl font-bold text-green-600">All Tests Passed!</h2>
                <p className="text-gray-600 mt-2">But someone else finished first</p>
              </>
            ) : (
              <>
                <XCircle className="mx-auto text-red-500 mb-2" size={48} />
                <h2 className="text-2xl font-bold text-red-600">Some Tests Failed</h2>
              </>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
              <span className="font-semibold">Total Tests:</span>
              <span className="text-lg">{results.totalTests}</span>
            </div>
            <div className="flex items-center justify-between bg-green-100 p-4 rounded-lg">
              <span className="font-semibold text-green-800">Passed:</span>
              <span className="text-lg text-green-800">{results.passedTests}</span>
            </div>
            <div className="flex items-center justify-between bg-red-100 p-4 rounded-lg">
              <span className="font-semibold text-red-800">Failed:</span>
              <span className="text-lg text-red-800">
                {results.totalTests - results.passedTests}
              </span>
            </div>
          </div>

          {/* Individual Test Cases */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-lg">Test Case Details:</h3>
            {results.results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.passed
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Test Case {index + 1}</span>
                  {result.passed ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Status:</span> {result.status}
                  </div>
                  {result.time && (
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>Time: {result.time}s</span>
                    </div>
                  )}
                  {!result.passed && (
                    <>
                      <div className="mt-2">
                        <span className="font-medium">Expected:</span>
                        <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
                          {result.expected}
                        </pre>
                      </div>
                      <div>
                        <span className="font-medium">Got:</span>
                        <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
                          {result.output}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;