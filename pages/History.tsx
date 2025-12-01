
import React, { useState } from 'react';
import { useApp } from '../context';
import { Transaction } from '../types';
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount) + ` ${currency}`;
};

export const History = () => {
  const { state, t } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const locale = state.language === 'ru' ? 'ru-RU' : 'uz-UZ';
  const monthName = currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const formattedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Filter Transactions by selected month
  const filteredTransactions = state.transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentDate.getMonth() && txDate.getFullYear() === currentDate.getFullYear();
  });

  // Calculate Summary for this month
  const totalIncomeUZS = filteredTransactions
    .filter(t => t.type === 'INCOME' && t.currency === 'UZS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseUZS = filteredTransactions
    .filter(t => t.type === 'EXPENSE' && t.currency === 'UZS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncomeUSD = filteredTransactions
    .filter(t => t.type === 'INCOME' && t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseUSD = filteredTransactions
    .filter(t => t.type === 'EXPENSE' && t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0);


  // Group transactions by date for display
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = tx.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getIcon = (type: string) => {
    switch (type) {
        case 'INCOME': return <ArrowDownRight size={18} className="text-green-500" />;
        case 'EXPENSE': return <ArrowUpRight size={18} className="text-red-500" />;
        default: return <ArrowRightLeft size={18} className="text-blue-500" />;
    }
  };

  const getFriendlyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t.today;
    if (date.toDateString() === yesterday.toDateString()) return t.yesterday;
    
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  };

  return (
    <div className="p-5">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.history_title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t.history_desc}</p>
      </header>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronLeft size={20} />
        </button>
        <span className="font-bold text-gray-800 dark:text-white text-lg capitalize">{formattedMonthName}</span>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronRight size={20} />
        </button>
      </div>

      {/* Monthly Summary */}
      {(totalIncomeUZS > 0 || totalExpenseUZS > 0 || totalIncomeUSD > 0 || totalExpenseUSD > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800/30">
                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">{t.income}</p>
                {totalIncomeUZS > 0 && <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{formatMoney(totalIncomeUZS, 'UZS')}</p>}
                {totalIncomeUSD > 0 && <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{formatMoney(totalIncomeUSD, 'USD')}</p>}
                {totalIncomeUZS === 0 && totalIncomeUSD === 0 && <p className="text-gray-400 text-sm">-</p>}
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800/30">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">{t.expense}</p>
                {totalExpenseUZS > 0 && <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{formatMoney(totalExpenseUZS, 'UZS')}</p>}
                {totalExpenseUSD > 0 && <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{formatMoney(totalExpenseUSD, 'USD')}</p>}
                {totalExpenseUZS === 0 && totalExpenseUSD === 0 && <p className="text-gray-400 text-sm">-</p>}
            </div>
        </div>
      )}

      {sortedDates.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-400 dark:text-gray-500">{t.no_ops_month}</p>
          </div>
      ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 ml-1">{getFriendlyDate(date)}</h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {groupedTransactions[date].map((tx, index) => (
                        <div 
                            key={tx.id} 
                            className={`p-4 flex justify-between items-start ${index !== groupedTransactions[date].length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full mt-1 ${
                                    tx.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/30' : 
                                    tx.type === 'EXPENSE' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                                }`}>
                                    {getIcon(tx.type)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{tx.category}</p>
                                    {tx.note && <p className="text-xs text-gray-500 dark:text-gray-400">{tx.note}</p>}
                                    {tx.type === 'TRANSFER' && (
                                        <p className="text-xs text-gray-400">{t.transfer}</p>
                                    )}
                                    {tx.tags && tx.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {tx.tags.map(tag => (
                                                <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`font-bold text-sm whitespace-nowrap ${
                                    tx.type === 'EXPENSE' ? 'text-red-500 dark:text-red-400' : 
                                    tx.type === 'INCOME' ? 'text-green-500 dark:text-green-400' : 'text-blue-500 dark:text-blue-400'
                                }`}>
                                    {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : ''}
                                    {formatMoney(tx.amount, tx.currency)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};
