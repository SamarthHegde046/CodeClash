// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">⚔️ CodeClash</div>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/leaderboard"
                  className="flex items-center space-x-1 hover:text-yellow-300 transition"
                >
                  <Trophy size={20} />
                  <span>Leaderboard</span>
                </Link>

                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                  <User size={18} />
                  <span className="font-medium">{user?.username}</span>
                  <span className="bg-yellow-400 text-purple-900 px-2 py-0.5 rounded text-sm font-bold">
                    {user?.points || 0}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-red-300 transition"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-300 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;





