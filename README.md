# CodeClash 

A real-time competitive coding platform where developers battle head-to-head solving algorithmic challenges. Built with modern web technologies for seamless multiplayer coding experiences.

##  Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Integration](#api-integration)
- [Real-time Communication](#real-time-communication)
- [State Management](#state-management)

##  Overview

CodeClash is a competitive programming platform that enables developers to compete in real-time coding battles. Users can create or join rooms, solve algorithmic problems, and climb the leaderboard. The platform features a sophisticated real-time architecture with WebSocket-based communication, JWT authentication, and a responsive React-based UI.

##  Key Features

- **Real-time Multiplayer Battles**: Live coding competitions with synchronized timers and instant updates
- **Interactive Code Editor**: Monaco Editor integration supporting multiple programming languages (JavaScript, Python, C++, Java)
- **WebSocket Communication**: Bi-directional real-time data flow using Socket.IO
- **JWT Authentication**: Secure token-based authentication with automatic token refresh
- **Room Management**: Dynamic room creation, player lobbies, and battle orchestration
- **Live Leaderboard**: Global ranking system with real-time score updates
- **Code Execution**: Remote code execution with test case validation
- **Chat System**: In-battle messaging for player communication
- **Responsive UI**: Mobile-first design with Tailwind CSS utility framework

##  Technology Stack

### Frontend Core
- **React 19.2.0**: Component-based UI library with concurrent rendering and automatic batching
- **React DOM 19.2.0**: Virtual DOM implementation for efficient UI updates
- **React Router DOM 7.9.4**: Client-side routing with lazy loading and nested route support


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

##  Getting Started

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

##  API Integration

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

##  Real-time Communication

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

##  State Management

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

##  Security Features

- **JWT Authentication**: Stateless token-based auth with expiration
- **HTTP-Only Tokens**: Secure token storage recommendations
- **CORS Configuration**: Cross-origin resource sharing policies
- **XSS Protection**: React's built-in XSS prevention through JSX escaping
- **Input Validation**: Client-side validation for user inputs
