
import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { Currency } from '../types';
import { TrendingUp, TrendingDown, Activity, Wallet, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Analytics = () => {
  const { state, t } = useApp();
  const [currency, setCurrency] = useState<Currency>('UZS');

  // --- Helpers ---
  const getMonthData = (offset = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() - offset);
    return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleDateString(state.language === 'ru' ? 'ru-RU' : 'uz-UZ', { month: 'long' })
    };
  };

  const currentMonth = getMonthData(0);
  const prevMonth = getMonthData(1);

  // --- Data Processing ---
  const stats = useMemo(() => {
    const txs = state.transactions.filter(t => t.currency === currency);
    
    const currentMonthTxs = txs.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth.month && d.getFullYear() === currentMonth.year;
    });

    const prevMonthTxs = txs.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === prevMonth.month && d.getFullYear() === prevMonth.year;
    });

    const calcTotal = (list: typeof txs, type: 'INCOME' | 'EXPENSE') => 
        list.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0);

    const income = calcTotal(currentMonthTxs, 'INCOME');
    const expense = calcTotal(currentMonthTxs, 'EXPENSE');
    const prevExpense = calcTotal(prevMonthTxs, 'EXPENSE');
    
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    const expenseChange = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0;

    // Heatmap Data (Last 30 days)
    const heatmapData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0];
        const daySum = txs
            .filter(t => t.type === 'EXPENSE' && t.date === dateStr)
            .reduce((sum, t) => sum + t.amount, 0);
        return { date: d, val: daySum, dayStr: d.getDate() };
    });

    // Category Breakdown
    const expenseByCategory = currentMonthTxs
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, curr) => {
            const existing = acc.find(i => i.name === curr.category);
            if (existing) {
                existing.value += curr.amount;
                existing.count += 1;
            } else {
                acc.push({ name: curr.category, value: curr.amount, count: 1 });
            }
            return acc;
        }, [] as { name: string; value: number; count: number }[])
        .sort((a, b) => b.value - a.value);

    // Insight Generation
    let insight = { text: t.insight_neutral, type: 'neutral' };
    if (expenseChange > 15) {
        insight = { text: t.insight_bad_expense.replace('{val}', Math.round(expenseChange).toString()), type: 'bad' };
    } else if (expenseChange < -10) {
        insight = { text: t.insight_good_expense.replace('{val}', Math.round(Math.abs(expenseChange)).toString()), type: 'good' };
    } else if (savingsRate > 20) {
        insight = { text: t.insight_good_savings.replace('{val}', Math.round(savingsRate).toString()), type: 'good' };
    } else if (income > 0 && expense > income) {
        insight = { text: t.insight_bad_flow, type: 'bad' };
    }

    // Chart Data (Last 6 Months)
    const chartData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const m = d.getMonth();
        const y = d.getFullYear();
        
        const mIncome = calcTotal(txs.filter(t => {
            const td = new Date(t.date);
            return td.getMonth() === m && td.getFullYear() === y;
        }), 'INCOME');
        
        const mExpense = calcTotal(txs.filter(t => {
            const td = new Date(t.date);
            return td.getMonth() === m && td.getFullYear() === y;
        }), 'EXPENSE');

        return {
            name: d.toLocaleDateString(state.language === 'ru' ? 'ru-RU' : 'uz-UZ', { month: 'short' }),
            income: mIncome,
            expense: mExpense,
            net: mIncome - mExpense
        };
    });

    return {
        income,
        expense,
        savingsRate,
        expenseChange,
        heatmapData,
        expenseByCategory,
        insight,
        chartData
    };
  }, [state.transactions, currency, currentMonth.month, currentMonth.year, prevMonth.month, prevMonth.year, state.language, t]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="p-5 pb-20">
      <header className="mb-6 flex justify-between items-center sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 py-2">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.analytics}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">{currentMonth.label} {currentMonth.year}</p>
        </div>
        <select 
            value={currency} 
            onChange={e => setCurrency(e.target.value as Currency)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white text-sm rounded-lg p-2 font-bold focus:outline-none shadow-sm"
        >
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
            <option value="RUB">RUB</option>
        </select>
      </header>

      {/* 1. Smart Insight Card */}
      <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
          stats.insight.type === 'good' ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800' :
          stats.insight.type === 'bad' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' :
          'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800'
      }`}>
          <div className={`p-2 rounded-full ${
              stats.insight.type === 'good' ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300' :
              stats.insight.type === 'bad' ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300' :
              'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
          }`}>
             {stats.insight.type === 'good' ? <CheckCircle2 size={20} /> : stats.insight.type === 'bad' ? <AlertCircle size={20} /> : <Activity size={20} />}
          </div>
          <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.financial_insight}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stats.insight.text}</p>
          </div>
      </div>

      {/* 2. Financial Health Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Savings Rate */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                <Wallet size={16} />
                <span className="text-xs font-bold uppercase">{t.savings_rate}</span>
             </div>
             <p className={`text-2xl font-bold ${stats.savingsRate >= 20 ? 'text-green-500' : stats.savingsRate > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {Math.round(stats.savingsRate)}%
             </p>
             <p className="text-[10px] text-gray-400">{t.from_income}</p>
          </div>

          {/* Expense Trend */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                {stats.expenseChange > 0 ? <TrendingUp size={16} className="text-red-500"/> : <TrendingDown size={16} className="text-green-500"/>}
                <span className="text-xs font-bold uppercase">{t.trend}</span>
             </div>
             <p className={`text-2xl font-bold ${stats.expenseChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.expenseChange > 0 ? '+' : ''}{Math.round(stats.expenseChange)}%
             </p>
             <p className="text-[10px] text-gray-400">{t.vs_prev_month}</p>
          </div>
      </div>

      {/* 3. Net Flow Chart (Area) */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">{t.net_flow}</h3>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-48">
             <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                     <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                     <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                     <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: number) => val.toLocaleString()}
                     />
                     <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                     <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                 </AreaChart>
             </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Spending Heatmap (Last 30 days) */}
      <div className="mb-8">
         <div className="flex items-center gap-2 mb-3">
             <Calendar size={16} className="text-gray-400"/>
             <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">{t.spending_heatmap}</h3>
         </div>
         <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
             <div className="flex gap-1 min-w-max justify-between">
                {stats.heatmapData.map((day, i) => {
                    const intensity = Math.min(day.val / (stats.expense / 30 || 1), 1.5); // Normalize relative to daily avg
                    let bg = 'bg-gray-100 dark:bg-gray-700';
                    if (day.val > 0) bg = 'bg-blue-200 dark:bg-blue-900/40';
                    if (intensity > 0.5) bg = 'bg-blue-300 dark:bg-blue-800/60';
                    if (intensity > 1.0) bg = 'bg-blue-500 dark:bg-blue-600';
                    
                    return (
                        <div key={i} className="flex flex-col items-center gap-1 group relative">
                            <div className={`w-2 h-8 rounded-full ${bg} transition-all`}></div>
                            <span className="text-[9px] text-gray-400 font-mono">{day.dayStr}</span>
                            {/* Tooltip */}
                            {day.val > 0 && (
                                <div className="absolute bottom-full mb-1 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                    {day.val.toLocaleString()}
                                </div>
                            )}
                        </div>
                    );
                })}
             </div>
         </div>
      </div>

      {/* 5. Top Categories */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">{t.top_categories}</h3>
        {stats.expenseByCategory.length > 0 ? (
            <div className="space-y-3">
                {stats.expenseByCategory.map((item, index) => (
                    <div key={item.name} className="relative bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Background Bar */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 bg-blue-50 dark:bg-blue-900/10 transition-all duration-500"
                            style={{ width: `${(item.value / stats.expenseByCategory[0].value) * 100}%` }}
                        ></div>
                        
                        <div className="relative flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.name}</p>
                                    <p className="text-[10px] text-gray-400">{item.count} ops</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{item.value.toLocaleString()} {currency}</p>
                                <p className="text-[10px] text-gray-400">
                                    {Math.round((item.value / stats.expense) * 100)}%
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                {t.no_expenses}
            </div>
        )}
      </div>

    </div>
  );
};
