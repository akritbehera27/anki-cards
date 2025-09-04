import React, { useState } from 'react';
import LockClosedIcon from './icons/LockClosedIcon';
import ArrowUturnLeftIcon from './icons/ArrowUturnLeftIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';

interface LoginProps {
  onLogin: (password: string) => Promise<boolean>;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(password);
    if (!success) {
      setError('Invalid password or session already active.');
      setIsLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">PNotes</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Access your private study notes.</p>
        </div>

        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 p-3 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="Enter your access key"
                  required
                  aria-describedby="password-error"
                />
                 <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-slate-500" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
              </div>
            </div>

            {error && <p id="password-error" className="text-red-500 text-sm text-center mb-4" role="alert">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full px-6 py-3 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button onClick={onBack} className="flex items-center justify-center mx-auto px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
            <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
            Back to Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
