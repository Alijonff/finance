import React, { useState } from 'react';
import { useApp } from '../context';
import { Trash2, Plus, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { Currency, AccountType } from '../types';

export const ManageAccounts = () => {
  const { state, actions, isLoading } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('CARD');
  const [currency, setCurrency] = useState<Currency>('UZS');
  const [balance, setBalance] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && balance) {
      setIsSubmitting(true);
      try {
        await actions.addAccount({
            name,
            type,
            currency,
            balance: parseFloat(balance)
        });
        setName('');
        setBalance('');
        setIsAdding(false);
      } catch (e) {
          alert('Ошибка: ' + e);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Удалить счет "${name}"?`)) {
        try {
            await actions.deleteAccount(id);
        } catch(e) {
            alert('Не удалось удалить: ' + e);
        }
    }
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="p-5">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Управление счетами</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Карты и наличные</p>
      </header>

      {/* Add Button */}
      {!isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 text-white font-bold py-3 rounded-xl mb-6 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
        >
          <Plus size={20} /> Добавить счет
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3">Новый счет</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Название</label>
              <input 
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Например, Ipak Yuli"
                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Тип</label>
                <select 
                  value={type} onChange={e => setType(e.target.value as AccountType)}
                  className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="CARD">Карта</option>
                  <option value="CASH">Наличные</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Валюта</label>
                <select 
                  value={currency} onChange={e => setCurrency(e.target.value as Currency)}
                  className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="UZS">UZS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Текущий баланс</label>
              <input 
                type="number"
                value={balance} onChange={e => setBalance(e.target.value)}
                placeholder="0"
                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
               <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-gray-500 dark:text-gray-400">Отмена</button>
               <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center">
                   {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Сохранить'}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {state.accounts.map(acc => (
          <div key={acc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${acc.type === 'CASH' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'}`}>
                {acc.type === 'CASH' ? <Banknote size={20} /> : <CreditCard size={20} />}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{acc.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{acc.balance.toLocaleString()} {acc.currency}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(acc.id, acc.name)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
