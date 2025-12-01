
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { Repeat, BarChart3, Settings, HelpCircle, ChevronRight, Moon, Sun, History, List, LogOut } from 'lucide-react';

export const Menu = () => {
  const { state, dispatch, actions, session } = useApp();

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' });
  };

  const handleLogout = async () => {
      if(confirm('Выйти из аккаунта?')) {
          await actions.signOut();
      }
  };

  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Меню</h1>
        <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
      </div>
      
      {/* Main Features */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors duration-200">
        <Link to="/history" className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <History className="text-orange-500" size={20} />
                <span className="font-medium">История операций</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <Link to="/subscriptions" className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Repeat className="text-indigo-500" size={20} />
                <span className="font-medium">Подписки</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <Link to="/analytics" className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <BarChart3 className="text-blue-500" size={20} />
                <span className="font-medium">Аналитика</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <Link to="/categories" className="flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <List className="text-purple-500" size={20} />
                <span className="font-medium">Категории</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
      </div>

      {/* Settings & System */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200 mb-6">
        
        {/* Theme Toggle */}
        <div 
          onClick={toggleTheme}
          className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
        >
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                {state.theme === 'light' ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-blue-300" size={20} />}
                <span className="font-medium">Тема</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${state.theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 opacity-50">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Settings className="text-gray-500 dark:text-gray-400" size={20} />
                <span className="font-medium">Настройки</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </div>
        <div className="flex items-center justify-between p-4 opacity-50">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <HelpCircle className="text-gray-500 dark:text-gray-400" size={20} />
                <span className="font-medium">Помощь</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-6"
      >
        <LogOut size={20} /> Выйти
      </button>
      
      <p className="text-center text-xs text-gray-400">Версия 1.1.0 (Auth + Analytics)</p>
    </div>
  );
};
