import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-0">
      <div className="flex items-center space-x-6">
        <nav className="hidden md:flex space-x-4">
          <Link 
            to="/" 
            className={`px-2 lg:px-4 py-2 rounded-full shadow-lg transition duration-300 ${
              isActive('/') 
                ? 'bg-gray-900 text-gray-100' 
                : 'bg-white text-gray-800 hover:bg-gray-900 hover:text-gray-100'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="hidden xl:inline ml-2">Accueil</span>
          </Link>
          
          <Link 
            to="/progress" 
            className={`px-2 lg:px-4 py-2 rounded-full shadow-lg transition duration-300 ${
              isActive('/progress') 
                ? 'bg-gray-900 text-gray-100' 
                : 'bg-white text-gray-800 hover:bg-gray-900 hover:text-gray-100'
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="hidden xl:inline ml-2">Progrès</span>
          </Link>

          <Link 
            to="/calendar" 
            className={`px-2 lg:px-4 py-2 rounded-full shadow-lg transition duration-300 ${
              isActive('/calendar') 
                ? 'bg-gray-900 text-gray-100' 
                : 'bg-white text-gray-800 hover:bg-gray-900 hover:text-gray-100'
            }`}
          >
            <span className="text-xl">📅</span>
            <span className="hidden xl:inline ml-2">Calendrier</span>
          </Link>

          <Link 
            to="/params" 
            className={`px-2 lg:px-4 py-2 rounded-full shadow-lg transition duration-300 ${
              isActive('/params') 
                ? 'bg-gray-900 text-gray-100' 
                : 'bg-white text-gray-800 hover:bg-gray-900 hover:text-gray-100'
            }`}
          >
            <span className="text-xl">⚙️</span>
            <span className="hidden xl:inline ml-2">Paramètres</span>
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <button
            onClick={onLogout}
            className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg hover:bg-gray-900 hover:text-gray-100 transition duration-300"
          >
            <span className="text-xl mr-2">🚪</span>Déconnexion
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg hover:bg-gray-900 hover:text-gray-100 transition duration-300"
            >
              <span className="text-xl mr-2">🔑</span>Connexion
            </Link>
            <Link
              to="/signup"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
            >
              <span className="text-xl mr-2">✨</span>Inscription
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;