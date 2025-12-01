import React, { useState } from 'react';
import { useApp } from '../context';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { Currency } from '../types';

export const Budgets = () => {
  const { state, actions, isLoading } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [currency, setCurrency] = useState<Currency>('UZS');

  // Helper to calculate spent amount per category
  const calculateSpent = (category: string, currency: string) => {
    return state.transactions
      .filter(t => t.type === 'EXPENSE' && t.category === category && t.currency === currency)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getPercentage = (spent: number, limit: number) => {
    const p = (spent / limit) * 100;
    return Math.min(p, 100);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category && limit) {
        setIsSubmitting(true);
        try {
            await actions.addBudget({
                category,
                limit: parseFloat(limit),
                currency
            });
            setIsAdding(false);
            setCategory('');
            setLimit('');
        } catch (e) {
            alert('Ошибка: ' + e);
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Удалить бюджет?')) {
        try {
            await actions.deleteBudget(id);
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Бюджет</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Контроль расходов</p>
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

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 mb-6 relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-2 right-2 text-gray-400"><X size={16}/></button>
            <h3 className="font-bold text-gray-800 dark:text-white mb-3">Новый бюджет</h3>
            <form onSubmit={handleAdd} className="space-y-3">
                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Категория</label>
                    <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)}
                        className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    >
                        <option value="">Выберите...</option>
                        {state.expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Лимит</label>
                        <input 
                            type="number" 
                            value={limit} 
                            onChange={e => setLimit(e.target.value)}
                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="0"
                            required
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Валюта</label>
                        <select 
                            value={currency} 
                            onChange={e => setCurrency(e.target.value as Currency)}
                            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="UZS">UZS</option>
                            <option value="USD">USD</option>
                            <option value="RUB">RUB</option>
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium flex justify-center items-center">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Создать'}
                </button>
            </form>
        </div>
      )}

      <div className="space-y-6">
        {state.budgets.length === 0 && !isAdding && (
            <div className="text-center text-gray-400 dark:text-gray-500 py-10">Бюджеты не заданы</div>
        )}

        {state.budgets.map(budget => {
          const spent = calculateSpent(budget.category, budget.currency);
          const percent = getPercentage(spent, budget.limit);
          const remaining = budget.limit - spent;
          const isOver = remaining < 0;

          return (
            <div key={budget.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors relative group">
              <button 
                onClick={() => handleDelete(budget.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                   <div>
                       <h3 className="font-bold text-gray-800 dark:text-gray-200">{budget.category}</h3>
                       <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium">{budget.currency}</span>
                   </div>
                </div>
                <div className="text-right pr-6">
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Лимит</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{budget.limit.toLocaleString()}</span>
                </div>
              </div>

              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Потрачено: <span className="text-gray-800 dark:text-gray-200 font-medium">{spent.toLocaleString()}</span></span>
                <span className={isOver ? 'text-red-600 dark:text-red-400 font-bold' : 'text-green-600 dark:text-green-400 font-bold'}>
                  {isOver ? 'Превышено' : 'Осталось'}: {Math.abs(remaining).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};