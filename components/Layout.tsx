
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, PieChart, Plus, WalletCards, Layers, Loader2 } from 'lucide-react';
import { useApp } from '../context';

export const Layout = () => {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center font-sans">
         <div className="flex flex-col items-center gap-3 text-blue-600 dark:text-blue-400">
             <Loader2 className="animate-spin" size={48} />
             <p className="font-medium text-gray-500 dark:text-gray-400 text-sm animate-pulse">Синхронизация...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 flex justify-center transition-colors duration-200">
      {/* Mobile container - limited width on desktop */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 min-h-screen shadow-2xl relative flex flex-col transition-colors duration-200">
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
           <Outlet />
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center z-50 safe-area-pb transition-colors duration-200">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">Главная</span>
          </NavLink>

          <NavLink 
            to="/budgets" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <PieChart size={22} />
            <span className="text-[10px] font-medium">Бюджет</span>
          </NavLink>

          <NavLink 
            to="/add" 
            className="flex flex-col items-center -mt-8"
          >
            <div className="bg-blue-600 dark:bg-blue-500 rounded-full p-4 shadow-lg text-white hover:bg-blue-700 transition-colors">
               <Plus size={28} />
            </div>
          </NavLink>

          <NavLink 
            to="/debts" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <WalletCards size={22} />
            <span className="text-[10px] font-medium">Долги</span>
          </NavLink>

          <NavLink 
            to="/menu" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <Layers size={22} />
            <span className="text-[10px] font-medium">Меню</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};
