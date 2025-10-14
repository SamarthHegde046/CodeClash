// backend/utils/judge0.js
const axios = require('axios');

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  cpp: 54,         // C++ (GCC 9.2.0)
  java: 62         // Java (OpenJDK 13.0.1)
};

/**
 * Submit code to Judge0 for execution
 * @param {string} code - The source code to execute
 * @param {string} language - Programming language (javascript, python, cpp, java)
 * @param {string} input - Input data for the code (optional)
 * @returns {Promise<Object>} - Submission token and status
 */
const submitCode = async (code, language, input = '') => {
  try {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const options = {
      method: 'POST',
      url: `${JUDGE0_API}/submissions`,
      params: { base64_encoded: 'false', wait: 'true' },
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'
      },
      data: {
        language_id: languageId,
        source_code: code,
        stdin: input
      }
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Judge0 submission error:', error.response?.data || error.message);
    throw new Error('Code execution failed');
  }
};

/**
 * Get submission result
 * @param {string} token - Submission token
 * @returns {Promise<Object>} - Execution result
 */
const getSubmission = async (token) => {
  try {
    const options = {
      method: 'GET',
      url: `${JUDGE0_API}/submissions/${token}`,
      params: { base64_encoded: 'false' },
      headers: {
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Judge0 get submission error:', error.response?.data || error.message);
    throw new Error('Failed to get submission result');
  }
};

/**
 * Run code with test cases
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of test cases with input and expected output
 * @returns {Promise<Object>} - Test results
 */
const runTestCases = async (code, language, testCases) => {
  try {
    const results = [];

    for (const testCase of testCases) {
      const submission = await submitCode(code, language, testCase.input);
      
      // Check if execution was successful
      const passed = submission.status.id === 3 && 
                     submission.stdout?.trim() === testCase.expected.trim();

      results.push({
        input: testCase.input,
        expected: testCase.expected,
        output: submission.stdout?.trim() || submission.stderr || 'No output',
        passed,
        status: submission.status.description,
        time: submission.time,
        memory: submission.memory
      });
    }

    const allPassed = results.every(r => r.passed);

    return {
      success: true,
      allPassed,
      results,
      totalTests: testCases.length,
      passedTests: results.filter(r => r.passed).length
    };
  } catch (error) {
    console.error('Test cases execution error:', error);
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
};

module.exports = {
  submitCode,
  getSubmission,
  runTestCases,
  LANGUAGE_IDS
};