
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { Account } from '../types';
import { Wallet, CreditCard, Banknote, ArrowRight, Settings, PlusCircle } from 'lucide-react';

const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount) + ` ${currency}`;
};

export const Home = () => {
  const { state } = useApp();

  const totalUZS = state.accounts
    .filter(a => a.currency === 'UZS')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalUSD = state.accounts
    .filter(a => a.currency === 'USD')
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="p-5">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Мои Финансы</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Обзор баланса</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200 dark:shadow-none">
          <p className="text-blue-100 text-xs font-medium uppercase mb-1">Баланс UZS</p>
          <p className="text-xl font-bold">{formatMoney(totalUZS, 'UZS')}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200 dark:shadow-none">
          <p className="text-emerald-100 text-xs font-medium uppercase mb-1">Баланс USD</p>
          <p className="text-xl font-bold">{formatMoney(totalUSD, 'USD')}</p>
        </div>
      </div>

      {/* Accounts List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Счета</h2>
          <Link to="/accounts" className="text-gray-400 dark:text-gray-500 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Settings size={18} />
          </Link>
        </div>
        
        {state.accounts.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
             <div className="flex justify-center mb-3 text-gray-300 dark:text-gray-600">
                <Wallet size={40} />
             </div>
             <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">Счетов пока нет</p>
             <Link to="/accounts" className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center justify-center gap-1 hover:underline">
                <PlusCircle size={16} /> Создать первый счет
             </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {state.accounts.map((acc) => (
              <div key={acc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${acc.type === 'CASH' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                    {acc.type === 'CASH' ? <Banknote size={20} /> : <CreditCard size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{acc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{acc.type === 'CASH' ? 'Наличные' : 'Карта'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${acc.currency === 'UZS' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatMoney(acc.balance, acc.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions Preview */}
      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Последние операции</h2>
            <Link to="/history" className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                Все <ArrowRight size={12} />
            </Link>
        </div>
        
        {state.transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            Нет операций
          </div>
        ) : (
          <div className="space-y-3">
            {state.transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
                 <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{tx.category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                 </div>
                 <span className={`font-bold text-sm ${tx.type === 'EXPENSE' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                    {tx.type === 'EXPENSE' ? '-' : '+'}{formatMoney(tx.amount, tx.currency)}
                 </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
