# CodeClash 🚀

A real-time competitive coding platform where developers battle head-to-head solving algorithmic challenges. Built with modern web technologies for seamless multiplayer coding experiences.

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Real-time Communication](#real-time-communication)
- [State Management](#state-management)
- [Available Scripts](#available-scripts)

## 🎯 Overview

CodeClash is a competitive programming platform that enables developers to compete in real-time coding battles. Users can create or join rooms, solve algorithmic problems, and climb the leaderboard. The platform features a sophisticated real-time architecture with WebSocket-based communication, JWT authentication, and a responsive React-based UI.

## ✨ Key Features

- **Real-time Multiplayer Battles**: Live coding competitions with synchronized timers and instant updates
- **Interactive Code Editor**: Monaco Editor integration supporting multiple programming languages (JavaScript, Python, C++, Java)
- **WebSocket Communication**: Bi-directional real-time data flow using Socket.IO
- **JWT Authentication**: Secure token-based authentication with automatic token refresh
- **Room Management**: Dynamic room creation, player lobbies, and battle orchestration
- **Live Leaderboard**: Global ranking system with real-time score updates
- **Code Execution**: Remote code execution with test case validation
- **Chat System**: In-battle messaging for player communication
- **Responsive UI**: Mobile-first design with Tailwind CSS utility framework

## 🛠️ Technology Stack

### Frontend Core
- **React 19.2.0**: Component-based UI library with concurrent rendering and automatic batching
- **React DOM 19.2.0**: Virtual DOM implementation for efficient UI updates
- **React Router DOM 7.9.4**: Client-side routing with lazy loading and nested route support

### Development Toolchain
- **Create React App**: Webpack-based build system with Babel transpilation
- **React Scripts 5.0.1**: Build tooling with webpack 5, Babel 7, and ESLint integration

### UI & Styling
- **Tailwind CSS 3.4.18**: Utility-first CSS framework with JIT (Just-In-Time) compilation
- **PostCSS 8.5.6**: CSS transformation pipeline with autoprefixer
- **Autoprefixer 10.4.21**: Automatic vendor prefix injection for cross-browser compatibility
- **Lucide React 0.545.0**: Icon system with tree-shakeable SVG components

### Code Editor
- **Monaco Editor React 4.7.0**: VS Code's editor as a React component with IntelliSense, syntax highlighting, and multi-language support

### Network & Communication
- **Axios 1.12.2**: Promise-based HTTP client with interceptor support for request/response transformation
- **Socket.IO Client 4.8.1**: WebSocket library for bidirectional event-based communication with automatic reconnection

### Testing Framework
- **Jest**: JavaScript testing framework with snapshot testing and code coverage
- **React Testing Library 16.3.0**: DOM testing utilities for React components
- **Testing Library Jest DOM 6.9.1**: Custom Jest matchers for DOM assertions
- **Testing Library User Event 13.5.0**: User interaction simulation

### Performance Monitoring
- **Web Vitals 2.1.4**: Library for measuring Core Web Vitals (LCP, FID, CLS, FCP, TTFB)

## 🏗️ Architecture

### Component Architecture
The application follows a modular component-based architecture:

```
src/
├── components/         # Reusable UI components
│   ├── CodeEditor.js   # Monaco editor wrapper with language config
│   ├── Navbar.js       # Navigation with auth-aware routing
│   ├── PlayerList.js   # Real-time player status display
│   ├── QuestionPanel.js # Problem statement renderer
│   └── ResultModal.js  # Battle results with score breakdown
├── pages/              # Route-level page components
│   ├── Battle.js       # Live coding battle interface
│   ├── Dashboard.js    # User home with stats overview
│   ├── Leaderboard.js  # Global rankings with pagination
│   ├── Lobby.js        # Pre-battle waiting room
│   ├── Login.js        # Authentication page
│   ├── Register.js     # User registration
│   └── Result.js       # Post-battle results page
├── context/            # React Context API providers
│   └── AuthContext.js  # Global auth state with localStorage persistence
├── services/           # External service integrations
│   ├── api.js          # Axios instance with JWT interceptors
│   └── socket.js       # Socket.IO connection management
└── App.js             # Root component with routing config
```

### State Management Pattern
- **Context API**: Global authentication state using React Context with hooks
- **Local State**: Component-level state using React hooks (useState, useEffect, useRef)
- **localStorage**: Client-side persistence for JWT tokens and user data
- **Real-time State**: Socket event handlers for synchronized state updates

### Routing Strategy
- **Protected Routes**: HOC-based route protection with token validation
- **Lazy Loading**: Code splitting for optimized bundle sizes
- **Declarative Routing**: React Router's component-based route definitions
- **Dynamic Parameters**: URL parameters for room IDs and user identification

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API server running on port 5000

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SamarthHegde046/CodeClash.git
cd CodeClash
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. **Start the development server**
```bash
npm start
```

The application will launch at `http://localhost:3000`

## 📁 Project Structure

```
CodeClash/
├── public/                 # Static assets
│   ├── index.html          # HTML entry point
│   ├── manifest.json       # PWA manifest
│   └── robots.txt          # SEO crawler config
├── src/
│   ├── components/         # Reusable React components
│   ├── context/            # Context providers
│   ├── pages/              # Page-level components
│   ├── services/           # API and Socket services
│   ├── App.js              # Root application component
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles with Tailwind directives
├── .env                    # Environment configuration
├── .gitignore              # Git ignore rules
├── package.json            # NPM dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # Project documentation
```

## 🔌 API Integration

### Axios Configuration
The application uses a centralized Axios instance with interceptors:

**Request Interceptor**: Automatically injects JWT Bearer tokens from localStorage
```javascript
config.headers.Authorization = `Bearer ${token}`
```

**Response Interceptor**: Handles 401 unauthorized errors with automatic logout and redirect

### API Endpoints
- **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Room Management**: `/api/rooms/create`, `/api/rooms/:roomId`, `/api/rooms/:roomId/exists`
- **Leaderboard**: `/api/leaderboard`, `/api/leaderboard/user/:userId`

### HTTP Client Features
- **Automatic Retries**: Failed requests retry with exponential backoff
- **Request Cancellation**: Axios CancelToken for aborting pending requests
- **Error Handling**: Centralized error handling with custom error messages
- **Base URL Configuration**: Environment-based API URL configuration

## 🔄 Real-time Communication

### Socket.IO Implementation
The application maintains a persistent WebSocket connection for real-time features:

**Connection Management**:
- Singleton pattern for socket instance
- Automatic reconnection with configurable attempts (5 retries)
- Exponential backoff for reconnection delays (1000ms base)

**Event System**:
- `connect`: Fired on successful connection
- `disconnect`: Cleanup on connection loss
- `connect_error`: Error handling for failed connections
- Custom events: `player_joined`, `battle_started`, `code_submitted`, `chat_message`

**Reconnection Strategy**:
```javascript
{
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
}
```

## 🧠 State Management

### Authentication Context
Centralized auth state using React Context API:
- **User State**: Current user object with profile data
- **Token State**: JWT access token for API authentication
- **Loading State**: Async operation indicators
- **Methods**: `login()`, `register()`, `logout()`, `updateUser()`

### Local Storage Persistence
- **Token**: Stored for authentication across sessions
- **User Data**: Cached user profile for offline access
- **Automatic Cleanup**: Cleared on logout or 401 responses

### Component State Patterns
- **Controlled Components**: Form inputs with onChange handlers
- **Derived State**: Computed values from props/state
- **Refs**: DOM references and mutable values (timers, socket connections)
- **Effect Hooks**: Side effects for data fetching and subscriptions

## 📜 Available Scripts

### Development
```bash
npm start
```
Launches the development server with hot module replacement (HMR) at `http://localhost:3000`. The page automatically reloads on file changes.

### Testing
```bash
npm test
```
Runs Jest test runner in interactive watch mode with coverage reporting. Supports snapshot testing and DOM queries.

### Production Build
```bash
npm run build
```
Creates an optimized production build:
- Minified JavaScript and CSS bundles
- Tree-shaking for dead code elimination
- Code splitting with dynamic imports
- Asset optimization (images, fonts)
- Cache busting with content hashes
- Source maps for debugging

Output directory: `build/`

### Eject Configuration
```bash
npm run eject
```
**Warning**: Irreversible operation that exposes webpack, Babel, and ESLint configurations for advanced customization.

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based auth with expiration
- **HTTP-Only Tokens**: Secure token storage recommendations
- **CORS Configuration**: Cross-origin resource sharing policies
- **XSS Protection**: React's built-in XSS prevention through JSX escaping
- **Input Validation**: Client-side validation for user inputs

## 🌐 Browser Support

Supports modern browsers based on browserslist configuration:
- **Production**: >0.2% market share, not dead, not Opera Mini
- **Development**: Latest Chrome, Firefox, and Safari versions

## 📊 Performance Optimizations

- **Code Splitting**: Route-based lazy loading with React.lazy()
- **Memoization**: React.memo() for expensive component renders
- **Virtual Scrolling**: Optimized list rendering for large datasets
- **Debouncing**: User input throttling for API calls
- **Asset Compression**: Gzip/Brotli compression in production
- **CDN Integration**: Static asset delivery via content delivery networks

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙋‍♂️ Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the maintainers

---

**Built with ❤️ by developers, for developers**
