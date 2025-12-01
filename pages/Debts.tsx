import React, { useState } from 'react';
import { useApp } from '../context';
import { CheckCircle, Circle, Plus, X, Loader2 } from 'lucide-react';
import { Currency } from '../types';

export const Debts = () => {
  const { state, actions, isLoading } = useApp();
  const [tab, setTab] = useState<'I_OWE' | 'OWED_TO_ME'>('I_OWE');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('UZS');
  const [dueDate, setDueDate] = useState('');

  const filteredDebts = state.debts.filter(d => d.type === tab);

  const handleToggle = async (id: string) => {
    try {
        await actions.toggleDebt(id);
    } catch(e) {
        alert('Ошибка: ' + e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if(personName && amount) {
          setIsSubmitting(true);
          try {
              await actions.addDebt({
                  type: tab,
                  personName,
                  amount: parseFloat(amount),
                  currency,
                  dueDate: dueDate || undefined,
                  isPaid: false
              });
              setIsAdding(false);
              setPersonName('');
              setAmount('');
              setDueDate('');
          } catch(e) {
              alert('Ошибка: ' + e);
          } finally {
              setIsSubmitting(false);
          }
      }
  }

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="p-5">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Долги</h1>
        {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full">
                <Plus size={20} />
            </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl mb-6 transition-colors">
        <button
          onClick={() => setTab('I_OWE')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'I_OWE' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Я должен
        </button>
        <button
          onClick={() => setTab('OWED_TO_ME')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'OWED_TO_ME' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Мне должны
        </button>
      </div>

      {isAdding && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 mb-6 relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-2 right-2 text-gray-400"><X size={16}/></button>
            <h3 className="font-bold text-gray-800 dark:text-white mb-3">Новый долг ({tab === 'I_OWE' ? 'Я должен' : 'Мне должны'})</h3>
            <form onSubmit={handleAdd} className="space-y-3">
                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Имя</label>
                    <input value={personName} onChange={e => setPersonName(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
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
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Срок (необязательно)</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium flex justify-center items-center">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Добавить'}
                </button>
            </form>
          </div>
      )}

      <div className="space-y-3">
        {filteredDebts.length === 0 && !isAdding && (
            <p className="text-center text-gray-400 dark:text-gray-500 mt-10">Список пуст</p>
        )}
        {filteredDebts.map(debt => (
          <div key={debt.id} className={`bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors ${debt.isPaid ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => handleToggle(debt.id)} className="text-gray-400 hover:text-green-500 transition-colors">
                {debt.isPaid ? <CheckCircle className="text-green-500" size={24} /> : <Circle size={24} />}
              </button>
              <div>
                <h3 className={`font-bold text-gray-800 dark:text-gray-200 ${debt.isPaid ? 'line-through' : ''}`}>{debt.personName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{debt.dueDate ? `До ${new Date(debt.dueDate).toLocaleDateString()}` : 'Нет даты'}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`block font-bold text-lg ${debt.type === 'I_OWE' ? 'text-red-500' : 'text-green-500'}`}>
                {debt.amount.toLocaleString()} <span className="text-sm text-gray-500 dark:text-gray-400">{debt.currency}</span>
              </span>
              {debt.isPaid && <span className="text-xs text-green-600 font-bold uppercase">Погашен</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
