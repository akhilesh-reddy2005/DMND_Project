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
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 animate-fade-down">
      <nav className="glass w-full max-w-6xl rounded-2xl md:rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-outfit font-bold text-sm shadow-lg group-hover:shadow-brand-500/50 group-hover:scale-105 transition-all duration-300">
            FJD
          </div>
          <span className="font-outfit font-bold text-xl text-slate-800 tracking-tight hidden sm:block">
            FakeJobDetector
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={`px-5 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
              isActive("/") 
                ? "text-brand-600 bg-brand-50 shadow-sm" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
            }`}
          >
            Home
          </Link>

          {currentUser && (
            <Link
              to="/history"
              className={`px-5 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
                isActive("/history") 
                  ? "text-brand-600 bg-brand-50 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              History
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100/80 transition-all duration-300 border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
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
                <span className="text-sm font-medium text-slate-700 hidden lg:block">
                  {currentUser.displayName || 'User'}
                </span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${profileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-xl py-2 z-50 animate-fade-up origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100/50">
                    <p className="text-sm text-slate-500">Signed in as</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdown(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-brand-600 transition-colors"
                    >
                      Profile Settings
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setProfileDropdown(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-brand-600 transition-colors"
                    >
                      My History
                    </Link>
                  </div>
                  <div className="py-1 border-t border-slate-100/50">
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-slate-600 font-medium text-sm hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-300"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-brand-600 shadow-md hover:shadow-brand-500/30 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 glass rounded-2xl shadow-xl animate-fade-down overflow-hidden">
          <div className="p-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive("/") ? "text-brand-600 bg-brand-50" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Home
            </Link>

            {currentUser && (
              <Link
                to="/history"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive("/history") ? "text-brand-600 bg-brand-50" : "text-slate-600 hover:bg-slate-50"
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
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive("/profile") ? "text-brand-600 bg-brand-50" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Profile
                </Link>
                <div className="h-px bg-slate-100 my-2"></div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-slate-100 my-2"></div>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-4 py-3 mt-2 rounded-xl bg-slate-900 text-white font-medium text-center text-sm hover:bg-brand-600 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;