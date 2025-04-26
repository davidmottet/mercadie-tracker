import React, { useState, useEffect } from 'react';
import Parse from '../parseConfig';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = Parse.User.current();
        if (currentUser) {
          // Verify the session is still valid
          const session = await Parse.Session.current();
          if (session) {
            onLogin();
          } else {
            // Session is invalid, log out
            await Parse.User.logOut();
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const user = await Parse.User.logIn(email, password);
        if (!user) {
          throw new Error('Failed to authenticate user');
        }
      } else {
        const user = new Parse.User();
        user.set("username", email);
        user.set("email", email);
        user.set("password", password);
        const result = await user.signUp();
        if (!result) {
          throw new Error('Failed to create user account');
        }
      }
      
      if (Parse.User.current()) {
        onLogin();
      } else {
        throw new Error('Authentication succeeded but user session is invalid');
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-white">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          {isLogin ? 'Connexion' : 'Inscription'}
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
            <button
              className="mt-2 text-red-600 hover:text-red-800"
              onClick={() => setError('')}
            >
              Fermer
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            {isLogin ? (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">🔑</span>
                <span>Se connecter</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">✨</span>
                <span>Créer un compte</span>
              </div>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 font-medium transition duration-200"
          >
            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;