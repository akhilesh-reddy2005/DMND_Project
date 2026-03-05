import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../authContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
            FJD
          </div>
          <span className="font-semibold text-gray-900 hidden sm:inline">
            FakeJobDetector
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive("/") 
                ? "text-indigo-600 bg-indigo-50" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            } font-medium text-sm`}
          >
            Home
          </Link>

          {currentUser && (
            <Link
              to="/history"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive("/history") 
                  ? "text-indigo-600 bg-indigo-50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              } font-medium text-sm`}
            >
              History
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            // Logged in - Show profile dropdown
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.displayName || 'User'}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdown(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setProfileDropdown(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    My History
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => {
                      setProfileDropdown(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - Show Login/Register buttons
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 hover:scale-105"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-gray-700 hover:text-gray-900"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95">
          <div className="px-6 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive("/")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>

            {currentUser && (
              <Link
                to="/history"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive("/history")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                History
              </Link>
            )}

            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive("/profile")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium text-center text-sm hover:shadow-lg transition mt-4"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;