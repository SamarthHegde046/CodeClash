// frontend/src/components/QuestionPanel.js
import React from 'react';
import { AlertCircle } from 'lucide-react';

const QuestionPanel = ({ question }) => {
  if (!question) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 text-gray-500">
          <AlertCircle size={20} />
          <p>Waiting for battle to start...</p>
        </div>
      </div>
    );
  }

  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{question.title}</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            difficultyColor[question.difficulty]
          }`}
        >
          {question.difficulty}
        </span>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap">{question.description}</p>
      </div>

      {question.examples && question.examples.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Examples:</h3>
          {question.examples.map((example, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <span className="font-medium">Input:</span>
                <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                  {example.input}
                </code>
              </div>
              <div>
                <span className="font-medium">Output:</span>
                <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                  {example.output}
                </code>
              </div>
              {example.explanation && (
                <div>
                  <span className="font-medium">Explanation:</span>
                  <p className="text-gray-600 text-sm mt-1">{example.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;


