
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { useApp } from '../context';

export const Auth = () => {
  // Can't use useApp() fully because Auth is outside provider in App.tsx logic? 
  // Wait, Auth is rendered inside App which HAS provider. So we can use t.
  const { t } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('OK!');
        setIsLogin(true);
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-300 dark:shadow-blue-900/50">
                <LogIn className="text-white" size={32} />
            </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {isLogin ? t.login : t.register}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
            FinTrack Mobile - {t.auth_subtitle}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{t.email}</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="name@example.com"
                    required
                />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{t.password}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                />
            </div>
          </div>

          {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900">
                  {error}
              </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {isLogin ? t.login : t.register}
          </button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
            >
                {isLogin ? (
                    <>{t.no_account} <span className="font-bold">{t.register}</span></>
                ) : (
                    <>{t.has_account} <span className="font-bold">{t.login}</span></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
