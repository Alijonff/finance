
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, PieChart, Plus, WalletCards, Layers, Loader2, CreditCard } from 'lucide-react';
import { useApp } from '../context';

export const Layout = () => {
  const { isLoading, state, actions, t } = useApp();
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Set default account for modal
  React.useEffect(() => {
    if (state.accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(state.accounts[0].id);
    }
  }, [state.accounts]);

  const handleSubscriptionResponse = async (paid: boolean) => {
      if (!state.pendingSubscription) return;
      setIsProcessing(true);
      try {
          await actions.processSubscriptionPayment(
              state.pendingSubscription, 
              paid ? selectedAccountId : null
          );
      } catch (e) {
          alert(t.error + ": " + e);
      } finally {
          setIsProcessing(false);
      }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center font-sans">
         <div className="flex flex-col items-center gap-3 text-blue-600 dark:text-blue-400">
             <Loader2 className="animate-spin" size={48} />
             <p className="font-medium text-gray-500 dark:text-gray-400 text-sm animate-pulse">{t.syncing}</p>
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
        <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center z-40 safe-area-pb transition-colors duration-200">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">{t.nav_home}</span>
          </NavLink>

          <NavLink 
            to="/budgets" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <PieChart size={22} />
            <span className="text-[10px] font-medium">{t.nav_budget}</span>
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
            <span className="text-[10px] font-medium">{t.nav_debts}</span>
          </NavLink>

          <NavLink 
            to="/menu" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <Layers size={22} />
            <span className="text-[10px] font-medium">{t.nav_menu}</span>
          </NavLink>
        </nav>

        {/* Subscription Alert Modal */}
        {state.pendingSubscription && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4 text-indigo-600 dark:text-indigo-400">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sub_alert_title}</h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {t.sub_alert_text} <strong className="text-gray-900 dark:text-white">{state.pendingSubscription.name}</strong>.
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        {state.pendingSubscription.amount.toLocaleString()} {state.pendingSubscription.currency}
                    </p>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{t.sub_alert_q}</label>
                        <select 
                            value={selectedAccountId} 
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none dark:text-white"
                        >
                            {state.accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleSubscriptionResponse(false)}
                            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            disabled={isProcessing}
                        >
                            {t.no}
                        </button>
                        <button 
                            onClick={() => handleSubscriptionResponse(true)}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex justify-center items-center"
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : t.yes_paid}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
