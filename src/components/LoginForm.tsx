import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, UserCheck, Users, Shield } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'membre', email: 'membre@demo.com', icon: Users, color: 'blue', label: 'Membre' },
    { role: 'controleur', email: 'controleur@demo.com', icon: Shield, color: 'orange', label: 'Contrôleur' },
    { role: 'administrateur', email: 'admin@musaib.com', icon: UserCheck, color: 'purple', label: 'Administrateur' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Plateforme de Mutuelle
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="votre@email.com"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 text-xs sm:text-sm">Comptes de démonstration</span>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-2">
              {demoAccounts.map(({ role: demoRole, email: demoEmail, icon: Icon, color, label }) => (
                <button
                  key={demoRole}
                  onClick={() => {
                    setEmail(demoEmail);
                    setPassword('demo123');
                  }}
                  className={`flex items-center justify-center px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors`}
                >
                  <Icon className={`w-4 h-4 mr-2 text-${color}-600`} />
                  <span className="truncate">
                    <span className="hidden sm:inline">{label} - </span>
                    {demoEmail}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center">
              Mot de passe pour tous les comptes : demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}