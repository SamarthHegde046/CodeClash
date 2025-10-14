// backend/utils/questions.js
const questions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Your code here\n}",
      python: "def two_sum(nums, target):\n    # Your code here\n    pass",
      cpp: "#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}"
    },
    testCases: [
      { input: "([2,7,11,15], 9)", expected: "[0,1]" },
      { input: "([3,2,4], 6)", expected: "[1,2]" },
      { input: "([3,3], 6)", expected: "[0,1]" }
    ]
  },
  {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]'
      }
    ],
    starterCode: {
      javascript: "function reverseString(s) {\n  // Your code here\n}",
      python: "def reverse_string(s):\n    # Your code here\n    pass",
      cpp: "#include <vector>\nusing namespace std;\n\nvoid reverseString(vector<char>& s) {\n    // Your code here\n}",
      java: "class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}"
    },
    testCases: [
      { input: '(["h","e","l","l","o"])', expected: '["o","l","l","e","h"]' },
      { input: '(["H","a","n","n","a","h"])', expected: '["h","a","n","n","a","H"]' }
    ]
  },
  {
    id: 3,
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      }
    ],
    starterCode: {
      javascript: "function isPalindrome(x) {\n  // Your code here\n}",
      python: "def is_palindrome(x):\n    # Your code here\n    pass",
      cpp: "bool isPalindrome(int x) {\n    // Your code here\n}",
      java: "class Solution {\n    public boolean isPalindrome(int x) {\n        // Your code here\n    }\n}"
    },
    testCases: [
      { input: "(121)", expected: "true" },
      { input: "(-121)", expected: "false" },
      { input: "(10)", expected: "false" }
    ]
  },
  {
    id: 4,
    title: "FizzBuzz",
    difficulty: "Easy",
    description: "Given an integer n, return a string array answer (1-indexed) where:\n- answer[i] == 'FizzBuzz' if i is divisible by 3 and 5\n- answer[i] == 'Fizz' if i is divisible by 3\n- answer[i] == 'Buzz' if i is divisible by 5\n- answer[i] == i (as a string) if none of the above",
    examples: [
      {
        input: "n = 5",
        output: '["1","2","Fizz","4","Buzz"]'
      }
    ],
    starterCode: {
      javascript: "function fizzBuzz(n) {\n  // Your code here\n}",
      python: "def fizz_buzz(n):\n    # Your code here\n    pass",
      cpp: "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<string> fizzBuzz(int n) {\n    // Your code here\n}",
      java: "class Solution {\n    public List<String> fizzBuzz(int n) {\n        // Your code here\n    }\n}"
    },
    testCases: [
      { input: "(3)", expected: '["1","2","Fizz"]' },
      { input: "(5)", expected: '["1","2","Fizz","4","Buzz"]' },
      { input: "(15)", expected: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }
    ]
  }
];

// Get random question
const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};

// Get question by ID
const getQuestionById = (id) => {
  return questions.find(q => q.id === id);
};

module.exports = {
  questions,
  getRandomQuestion,
  getQuestionById
};
