
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { TransactionType, Currency } from '../types';
import { ArrowRightLeft, ArrowDownCircle, ArrowUpCircle, Loader2, Tag, X } from 'lucide-react';

export const AddOperation = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(state.accounts[1]?.id || '');
  
  const availableCategories = type === 'INCOME' ? state.incomeCategories : state.expenseCategories;
  const [category, setCategory] = useState(availableCategories[0] || '');
  
  React.useEffect(() => {
    if (type === 'INCOME') {
      setCategory(state.incomeCategories[0] || '');
    } else if (type === 'EXPENSE') {
      setCategory(state.expenseCategories[0] || '');
    }
  }, [type, state.incomeCategories, state.expenseCategories]);

  // If no accounts exist yet
  React.useEffect(() => {
    if (state.accounts.length > 0 && !accountId) {
        setAccountId(state.accounts[0].id);
    }
    if (state.accounts.length > 1 && !toAccountId) {
        setToAccountId(state.accounts[1].id);
    }
  }, [state.accounts]);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tags State
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const selectedAccount = state.accounts.find(a => a.id === accountId);
  const targetAccount = state.accounts.find(a => a.id === toAccountId);
  
  const isMultiCurrencyTransfer = 
    type === 'TRANSFER' && 
    selectedAccount && 
    targetAccount && 
    selectedAccount.currency !== targetAccount.currency;

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
          e.preventDefault();
          const val = currentTag.trim();
          if (val && !tags.includes(val)) {
              setTags([...tags, val]);
              setCurrentTag('');
          }
      }
  };

  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    try {
        setIsSubmitting(true);
        await actions.addTransaction({
            type,
            amount: parseFloat(amount),
            currency: selectedAccount?.currency || 'UZS',
            accountId,
            toAccountId: type === 'TRANSFER' ? toAccountId : undefined,
            category: type === 'TRANSFER' ? 'Перевод' : category,
            date,
            note,
            exchangeRate: isMultiCurrencyTransfer ? parseFloat(exchangeRate) : undefined,
            tags
        });
        navigate('/');
    } catch (e) {
        alert('Ошибка при сохранении: ' + e);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (state.accounts.length === 0) {
      return (
          <div className="p-10 text-center text-gray-500">
              Сначала создайте счет в разделе "Счета"
          </div>
      )
  }

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">Новая операция</h2>

      {/* Type Switcher */}
      <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl mb-6 transition-colors">
        <button
          onClick={() => setType('INCOME')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-all ${type === 'INCOME' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <ArrowDownCircle size={16} /> Доход
        </button>
        <button
          onClick={() => setType('EXPENSE')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-all ${type === 'EXPENSE' ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <ArrowUpCircle size={16} /> Расход
        </button>
        <button
          onClick={() => setType('TRANSFER')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-all ${type === 'TRANSFER' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <ArrowRightLeft size={16} /> Перевод
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Account Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
            {type === 'TRANSFER' ? 'Откуда' : 'Счет'}
          </label>
          <select 
            value={accountId} 
            onChange={e => setAccountId(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {state.accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </select>
        </div>

        {type === 'TRANSFER' && (
           <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Куда</label>
            <select 
                value={toAccountId} 
                onChange={e => setToAccountId(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {state.accounts.filter(a => a.id !== accountId).map(acc => (
                <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                </option>
                ))}
            </select>
           </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Сумма ({selectedAccount?.currency})</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full text-3xl font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300 dark:placeholder-gray-600"
            required
          />
        </div>

        {/* Exchange Rate for Multi-Currency Transfer */}
        {isMultiCurrencyTransfer && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                <label className="block text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase mb-1">
                    Курс обмена (1 {selectedAccount.currency} = ? {targetAccount?.currency})
                </label>
                <input
                    type="number"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value)}
                    placeholder="Например, 12600"
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-lg border border-yellow-200 dark:border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                />
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                   Получится: {amount && exchangeRate ? (parseFloat(amount) * parseFloat(exchangeRate)).toLocaleString() : '0'} {targetAccount?.currency}
                </p>
            </div>
        )}

        {/* Category (Hide for Transfer) */}
        {type !== 'TRANSFER' && (
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Категория</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date & Note */}
        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Дата</label>
            <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
           </div>
           <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Заметка</label>
            <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Комментарий..."
                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
           </div>
        </div>
        
        {/* Tags Input */}
        <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Теги</label>
            <div className="relative">
                <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="text" 
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Введите тег и нажмите пробел"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                        <span key={tag} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                            #{tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14}/></button>
                        </span>
                    ))}
                </div>
            )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-4 rounded-xl mt-6 active:scale-95 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Сохранить'}
        </button>
      </form>
    </div>
  );
};