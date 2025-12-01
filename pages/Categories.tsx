import React, { useState } from 'react';
import { useApp } from '../context';
import { Trash2, Plus, ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react';

export const Categories = () => {
  const { state, actions, isLoading } = useApp();
  const [tab, setTab] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategories = tab === 'INCOME' ? state.incomeCategories : state.expenseCategories;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      setIsSubmitting(true);
      try {
        await actions.addCategory({ type: tab, name: newCategory.trim() });
        setNewCategory('');
      } catch (e) {
          alert('Ошибка: ' + e);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (name: string) => {
    if (confirm(`Удалить категорию "${name}"?`)) {
      try {
        await actions.deleteCategory({ type: tab, name });
      } catch(e) {
        alert('Ошибка: ' + e);
      }
    }
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="p-5">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Категории</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Управление категориями</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl mb-6 transition-colors">
        <button
          onClick={() => setTab('INCOME')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-all ${tab === 'INCOME' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <ArrowDownCircle size={16} /> Доходы
        </button>
        <button
          onClick={() => setTab('EXPENSE')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-all ${tab === 'EXPENSE' ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <ArrowUpCircle size={16} /> Расходы
        </button>
      </div>

      {/* Add New */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input 
            type="text" 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Новая категория..."
            className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50"
        >
            {isSubmitting ? <Loader2 className="animate-spin" size={24}/> : <Plus size={24} />}
        </button>
      </form>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {currentCategories.length === 0 ? (
            <p className="p-4 text-center text-gray-400">Нет категорий</p>
        ) : (
            currentCategories.map((cat, index) => (
                <div key={cat} className={`p-4 flex justify-between items-center ${index !== currentCategories.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{cat}</span>
                    <button 
                        onClick={() => handleDelete(cat)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
