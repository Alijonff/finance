
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { Repeat, BarChart3, Settings, HelpCircle, ChevronRight, Moon, Sun, History, List, LogOut, Globe } from 'lucide-react';

export const Menu = () => {
  const { state, actions, session, t } = useApp();

  const toggleTheme = () => {
    actions.setTheme(state.theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    actions.setLanguage(state.language === 'ru' ? 'uz' : 'ru');
  };

  const handleLogout = async () => {
      if(confirm(t.confirm_logout)) {
          await actions.signOut();
      }
  };

  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.settings}</h1>
        <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
      </div>
      
      {/* Main Features */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors duration-200">
        <Link to="/history" className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <History className="text-orange-500" size={20} />
                <span className="font-medium">{t.history}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <Link to="/subscriptions" className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Repeat className="text-indigo-500" size={20} />
                <span className="font-medium">{t.subs_title}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <Link to="/analytics" className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <BarChart3 className="text-blue-500" size={20} />
                <span className="font-medium">{t.analytics}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
        <Link to="/categories" className="flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <List className="text-purple-500" size={20} />
                <span className="font-medium">{t.categories}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
      </div>

      {/* Settings & System */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200 mb-6">
        
        {/* Language Toggle */}
        <div 
          onClick={toggleLanguage}
          className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
        >
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Globe className="text-green-500" size={20} />
                <span className="font-medium">{t.language}</span>
            </div>
            <div className="flex items-center gap-2">
                 <span className={`text-sm font-bold ${state.language === 'ru' ? 'text-blue-600' : 'text-gray-400'}`}>RU</span>
                 <div className={`w-10 h-5 rounded-full p-0.5 flex transition-colors ${state.language === 'uz' ? 'bg-green-500 justify-end' : 'bg-blue-500 justify-start'}`}>
                     <div className="w-4 h-4 bg-white rounded-full"></div>
                 </div>
                 <span className={`text-sm font-bold ${state.language === 'uz' ? 'text-green-600' : 'text-gray-400'}`}>UZ</span>
            </div>
        </div>

        {/* Theme Toggle */}
        <div 
          onClick={toggleTheme}
          className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
        >
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                {state.theme === 'light' ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-blue-300" size={20} />}
                <span className="font-medium">{t.theme}</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${state.theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
        </div>

        <div className="flex items-center justify-between p-4 opacity-50">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <HelpCircle className="text-gray-500 dark:text-gray-400" size={20} />
                <span className="font-medium">{t.help}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-6"
      >
        <LogOut size={20} /> {t.logout}
      </button>
      
      <p className="text-center text-xs text-gray-400">FinTrack v1.2</p>
    </div>
  );
};
