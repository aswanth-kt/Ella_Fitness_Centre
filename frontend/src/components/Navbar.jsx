import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Dumbbell, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { gym_first_name, gym_second_name } from '../constants/constants';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Scroll to section helper (for home page anchors)
  const scrollToSection = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation before scrolling
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl backdrop-saturate-150 bg-deep-black/40 border-b border-gold/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_32px_-8px_rgba(0,0,0,0.45)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-premium-yellow to-gold p-2 rounded-lg text-deep-black group-hover:scale-110 transition-transform duration-300">
              <Dumbbell className="h-6 w-6" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wider text-gold-gradient group-hover:opacity-95 transition-opacity">
              {gym_first_name}<span className="text-white font-sans text-sm font-normal tracking-widest ml-1 uppercase">{gym_second_name}</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Common/Guest Links */}
            {!user || user.role === 'client' ? (
              <>
                <button onClick={() => scrollToSection('hero')} className="cursor-pointer text-gray-300 hover:text-gold transition-colors font-medium text-sm tracking-wide">HOME</button>
                <button onClick={() => scrollToSection('about')} className="cursor-pointer text-gray-300 hover:text-gold transition-colors font-medium text-sm tracking-wide">ABOUT</button>
                <button onClick={() => scrollToSection('facilities')} className="cursor-pointer text-gray-300 hover:text-gold transition-colors font-medium text-sm tracking-wide">FACILITIES</button>
                <button onClick={() => scrollToSection('trainers')} className="cursor-pointer text-gray-300 hover:text-gold transition-colors font-medium text-sm tracking-wide">TRAINERS</button>
                <button onClick={() => scrollToSection('plans')} className="cursor-pointer text-gray-300 hover:text-gold transition-colors font-medium text-sm tracking-wide">PLANS</button>
              </>
            ) : null}

            {/* Client Links */}
            {user && user.role === 'client' && (
              <Link 
                to="/dashboard" 
                className={`text-sm tracking-wide font-medium transition-colors ${isActive('/dashboard') ? 'text-gold' : 'text-gray-300 hover:text-gold'}`}
              >
                DASHBOARD
              </Link>
            )}

            {/* Admin Links */}
            {user && user.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`text-sm tracking-wide font-medium flex items-center space-x-1 transition-colors ${isActive('/admin') ? 'text-gold' : 'text-gray-300 hover:text-gold'}`}
              >
                <Shield className="h-4 w-4" />
                <span>ADMIN PANEL</span>
              </Link>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm hidden lg:inline border-l border-gray-700 pl-4">
                  Welcome, <strong className="text-gold font-medium">{user.name}</strong>
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 cursor-pointer text-sm font-medium border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-full transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-sm tracking-wide font-medium text-gray-300 hover:text-gold transition-colors px-3 py-2"
                >
                  LOGIN
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-semibold text-xs tracking-wider px-6 py-3 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg shadow-gold/25"
                >
                  JOIN NOW
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-gold focus:outline-none focus:text-gold p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden backdrop-blur-2xl backdrop-saturate-150 bg-deep-black/50 border-t border-gold/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] animate-fade-in-up">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-center">
            {!user || user.role === 'client' ? (
              <>
                <button 
                  onClick={() => scrollToSection('hero')} 
                  className="block w-full text-center px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                  HOME
                </button>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="block w-full text-center px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                  ABOUT
                </button>
                <button 
                  onClick={() => scrollToSection('facilities')} 
                  className="block w-full text-center px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                  FACILITIES
                </button>
                <button 
                  onClick={() => scrollToSection('trainers')} 
                  className="block w-full text-center px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                  TRAINERS
                </button>
                <button 
                  onClick={() => scrollToSection('plans')} 
                  className="block w-full text-center px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                >
                  PLANS
                </button>
              </>
            ) : null}

            {user && user.role === 'client' && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
              >
                DASHBOARD
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gold hover:bg-gold/10 transition-colors"
              >
                ADMIN PANEL
              </Link>
            )}

            <div className="pt-4 border-t border-gold/10 mt-4 px-4">
              {user ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">
                    Logged in as: <strong className="text-gold">{user.name}</strong>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 text-base font-medium border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 py-3 rounded-full transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>LOGOUT</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium text-gray-300 hover:text-gold py-2 transition-colors"
                  >
                    LOGIN
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-semibold py-3 rounded-full shadow-lg shadow-gold/25"
                  >
                    JOIN NOW
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;