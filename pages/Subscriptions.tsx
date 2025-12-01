import React, { useState } from 'react';
import { useApp } from '../context';
import { Repeat, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { Currency } from '../types';

export const Subscriptions = () => {
  const { state, actions, isLoading } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('UZS');
  const [period, setPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [category, setCategory] = useState('');

  const totalMonthlyUZS = state.subscriptions
    .filter(s => s.currency === 'UZS')
    .reduce((acc, s) => acc + (s.period === 'MONTHLY' ? s.amount : s.amount / 12), 0);

  const totalMonthlyUSD = state.subscriptions
    .filter(s => s.currency === 'USD')
    .reduce((acc, s) => acc + (s.period === 'MONTHLY' ? s.amount : s.amount / 12), 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && amount) {
        setIsSubmitting(true);
        try {
            await actions.addSubscription({
                name,
                amount: parseFloat(amount),
                currency,
                period,
                category: category || 'Подписки'
            });
            setIsAdding(false);
            setName('');
            setAmount('');
            setCategory('');
        } catch(e) {
            alert('Ошибка: ' + e);
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleDelete = async (id: string) => {
      if(confirm('Удалить подписку?')) {
          try {
              await actions.deleteSubscription(id);
          } catch(e) {
              alert('Ошибка: ' + e);
          }
      }
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="p-5">
      <header className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Подписки</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Регулярные платежи</p>
        </div>
        {!isAdding && (
            <button 
                onClick={() => setIsAdding(true)}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full"
            >
                <Plus size={20} />
            </button>
        )}
      </header>

      {/* Summary */}
      <div className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-xl p-5 mb-6 shadow-lg shadow-indigo-200 dark:shadow-none">
          <div className="flex items-center gap-2 mb-2 opacity-80">
              <Repeat size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Итого в месяц (прим.)</span>
          </div>
          <div className="flex gap-6">
             <div>
                <p className="text-2xl font-bold">{Math.round(totalMonthlyUZS).toLocaleString()}</p>
                <p className="text-xs opacity-70">UZS</p>
             </div>
             <div className="border-l border-indigo-400 pl-6">
                <p className="text-2xl font-bold">{Math.round(totalMonthlyUSD).toLocaleString()}</p>
                <p className="text-xs opacity-70">USD</p>
             </div>
          </div>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-900 mb-6 relative">
             <button onClick={() => setIsAdding(false)} className="absolute top-2 right-2 text-gray-400"><X size={16}/></button>
             <h3 className="font-bold text-gray-800 dark:text-white mb-3">Новая подписка</h3>
             <form onSubmit={handleAdd} className="space-y-3">
                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Название</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Netflix, Интернет..." required />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Сумма</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Валюта</label>
                        <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="UZS">UZS</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Период</label>
                    <select value={period} onChange={e => setPeriod(e.target.value as any)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="MONTHLY">Ежемесячно</option>
                        <option value="YEARLY">Ежегодно</option>
                    </select>
                </div>
                <div>
                     <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Категория</label>
                     <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                         <option value="">Выберите...</option>
                         {state.expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium flex justify-center items-center">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Добавить'}
                </button>
             </form>
        </div>
      )}

      <div className="space-y-3">
        {state.subscriptions.length === 0 && !isAdding && (
             <div className="text-center text-gray-400 dark:text-gray-500 py-6">Нет подписок</div>
        )}

        {state.subscriptions.map(sub => (
          <div key={sub.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center transition-colors">
             <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{sub.name}</h3>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded mt-1 inline-block">{sub.category}</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-gray-200">{sub.amount.toLocaleString()} {sub.currency}</p>
                    <p className="text-xs text-gray-400">{sub.period === 'MONTHLY' ? 'Ежемесячно' : 'Ежегодно'}</p>
                </div>
                <button onClick={() => handleDelete(sub.id)} className="text-gray-300 hover:text-red-500 p-1">
                    <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
