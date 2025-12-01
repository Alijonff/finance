
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState, useCallback } from 'react';
import { Account, Transaction, Debt, Budget, Subscription, Currency, Theme } from './types';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

// --- Initial State ---

interface AppState {
  theme: Theme;
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  subscriptions: Subscription[];
  incomeCategories: string[];
  expenseCategories: string[];
  pendingSubscription: Subscription | null; // For the alert
}

const defaultState: AppState = {
  theme: 'light',
  accounts: [],
  transactions: [],
  debts: [],
  budgets: [],
  subscriptions: [],
  incomeCategories: [],
  expenseCategories: [],
  pendingSubscription: null,
};

// --- Actions ---

type Action =
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'TOGGLE_DEBT'; payload: string }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'ADD_CATEGORY'; payload: { type: 'INCOME' | 'EXPENSE'; name: string } }
  | { type: 'DELETE_CATEGORY'; payload: { type: 'INCOME' | 'EXPENSE'; name: string } }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_PENDING_SUBSCRIPTION'; payload: Subscription | null }
  | { type: 'CLEAR_DATA' };

// --- Reducer ---

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOAD_DATA':
        return { ...state, ...action.payload };
    case 'CLEAR_DATA':
        return { ...defaultState, theme: state.theme }; 
    case 'ADD_TRANSACTION': {
      const tx = action.payload;
      const newAccounts = state.accounts.map((acc) => {
        // Handle Income/Expense
        if (tx.type === 'INCOME' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance + tx.amount };
        }
        if (tx.type === 'EXPENSE' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        // Handle Transfer
        if (tx.type === 'TRANSFER') {
            if (acc.id === tx.accountId) {
                // Source account (decrease)
                return { ...acc, balance: acc.balance - tx.amount };
            }
            if (acc.id === tx.toAccountId) {
                // Target account (increase)
                let amountToAdd = tx.amount;
                if (tx.exchangeRate && tx.exchangeRate > 0) {
                    amountToAdd = tx.amount * tx.exchangeRate;
                }
                return { ...acc, balance: acc.balance + amountToAdd };
            }
        }
        return acc;
      });

      return {
        ...state,
        accounts: newAccounts,
        transactions: [tx, ...state.transactions],
      };
    }
    case 'ADD_DEBT':
      return { ...state, debts: [action.payload, ...state.debts] };
    case 'TOGGLE_DEBT':
      return {
        ...state,
        debts: state.debts.map(d => d.id === action.payload ? { ...d, isPaid: !d.isPaid } : d)
      };
    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [action.payload, ...state.subscriptions] };
    case 'DELETE_SUBSCRIPTION':
      return { ...state, subscriptions: state.subscriptions.filter(s => s.id !== action.payload) };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_CATEGORY':
      if (action.payload.type === 'INCOME') {
        if (state.incomeCategories.includes(action.payload.name)) return state;
        return { ...state, incomeCategories: [...state.incomeCategories, action.payload.name] };
      } else {
        if (state.expenseCategories.includes(action.payload.name)) return state;
        return { ...state, expenseCategories: [...state.expenseCategories, action.payload.name] };
      }
    case 'DELETE_CATEGORY':
      if (action.payload.type === 'INCOME') {
        return { ...state, incomeCategories: state.incomeCategories.filter(c => c !== action.payload.name) };
      } else {
        return { ...state, expenseCategories: state.expenseCategories.filter(c => c !== action.payload.name) };
      }
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'DELETE_ACCOUNT':
      return { ...state, accounts: state.accounts.filter(a => a.id !== action.payload) };
    case 'ADD_BUDGET':
      const exists = state.budgets.find(b => b.category === action.payload.category && b.currency === action.payload.currency);
      if (exists) return state;
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
    case 'SET_PENDING_SUBSCRIPTION':
      return { ...state, pendingSubscription: action.payload };
    default:
      return state;
  }
};

// --- Context ---

interface Actions {
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addAccount: (acc: Omit<Account, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id'>, accountId?: string) => Promise<void>;
  toggleDebt: (id: string, accountId?: string) => Promise<void>;
  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  processSubscriptionPayment: (sub: Subscription, accountId: string | null) => Promise<void>;
  addCategory: (payload: { type: 'INCOME' | 'EXPENSE'; name: string }) => Promise<void>;
  deleteCategory: (payload: { type: 'INCOME' | 'EXPENSE'; name: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isLoading: boolean;
  actions: Actions;
  session: Session | null;
}>({
  state: defaultState,
  dispatch: () => null,
  isLoading: true,
  actions: {} as Actions,
  session: null,
});

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Load Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('fintrack_theme') as Theme;
    if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  useEffect(() => {
     localStorage.setItem('fintrack_theme', state.theme);
     const root = window.document.documentElement;
     if (state.theme === 'dark') {
         root.classList.add('dark');
     } else {
         root.classList.remove('dark');
     }
  }, [state.theme]);

  // Auth & Data Fetching
  const fetchData = useCallback(async (showLoading = true) => {
    try {
        if (showLoading) setIsLoading(true);
        
        // Parallel fetching
        const [accRes, txRes, debtsRes, budgetsRes, subsRes, catRes] = await Promise.all([
            supabase.from('accounts').select('*'),
            supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
            supabase.from('debts').select('*'), 
            supabase.from('budgets').select('*'),
            supabase.from('subscriptions').select('*'),
            supabase.from('categories').select('*'),
        ]);

        if (accRes.error) console.error('Accounts fetch error:', accRes.error);
        if (txRes.error) console.error('Transactions fetch error:', txRes.error);
        if (debtsRes.error) console.error('Debts fetch error:', debtsRes.error);
        if (budgetsRes.error) console.error('Budgets fetch error:', budgetsRes.error);
        if (subsRes.error) console.error('Subscriptions fetch error:', subsRes.error);

        let incomeCategories = catRes.data?.filter((c: any) => c.type === 'INCOME').map((c: any) => c.name) || [];
        let expenseCategories = catRes.data?.filter((c: any) => c.type === 'EXPENSE').map((c: any) => c.name) || [];

        // Ensure 'Долги' exists in both lists
        if (!incomeCategories.includes('Долги')) incomeCategories.push('Долги');
        if (!expenseCategories.includes('Долги')) expenseCategories.push('Долги');

        const accounts: Account[] = accRes.data || [];
        
        const transactions: Transaction[] = (txRes.data || []).map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            currency: t.currency,
            accountId: t.account_id,
            toAccountId: t.to_account_id,
            exchangeRate: t.exchange_rate,
            category: t.category,
            date: t.date,
            note: t.note,
            tags: t.tags || []
        }));

        const debts: Debt[] = (debtsRes.data || []).map((d: any) => ({
            id: d.id,
            type: d.type,
            personName: d.person_name || d.personName || 'Неизвестный', 
            amount: d.amount,
            currency: d.currency,
            dueDate: d.due_date,
            note: d.note,
            isPaid: d.is_paid
        }));
        
        const budgets: Budget[] = (budgetsRes.data || []).map((b: any) => ({
            id: b.id,
            category: b.category,
            limit: b.limit_amount,
            currency: b.currency
        }));

        const subscriptions: Subscription[] = (subsRes.data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            amount: s.amount,
            currency: s.currency,
            period: s.period,
            category: s.category,
            paymentDay: s.payment_day || 1,
            lastPaid: s.last_paid
        }));

        // --- CHECK DUE SUBSCRIPTIONS ---
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const dueSub = subscriptions.find(s => {
            // Is it today?
            if (s.paymentDay !== currentDay) return false;
            
            // Check if already paid this month
            if (s.lastPaid) {
                const paidDate = new Date(s.lastPaid);
                // If yearly, check year. If monthly, check month & year.
                if (s.period === 'YEARLY') {
                    if (paidDate.getFullYear() === currentYear) return false;
                } else {
                    if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) return false;
                }
            }
            return true;
        });

        dispatch({
            type: 'LOAD_DATA',
            payload: {
                accounts,
                transactions,
                debts,
                budgets,
                subscriptions,
                incomeCategories: incomeCategories.length > 0 ? incomeCategories : ['Зарплата', 'Долги'],
                expenseCategories: expenseCategories.length > 0 ? expenseCategories : ['Еда', 'Долги'],
                pendingSubscription: dueSub || null
            }
        });

    } catch (error) {
        console.error('Error fetching data (Global):', error);
    } finally {
        if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          fetchData();
      } else {
          dispatch({ type: 'CLEAR_DATA' });
          setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  // Realtime
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        () => {
          console.log('Realtime update received!');
          // We don't want to re-trigger the modal constantly on every small update if user dismissed it, 
          // but for consistency we reload data. The reducer handles merging.
          fetchData(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, session]);

  // --- Async Actions ---

  const actions: Actions = {
    signOut: async () => {
        await supabase.auth.signOut();
    },

    addTransaction: async (tx) => {
        if (!session) return;
        const { data: newTx, error } = await supabase.from('transactions').insert({
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            account_id: tx.accountId,
            to_account_id: tx.toAccountId,
            exchange_rate: tx.exchangeRate,
            category: tx.category,
            date: tx.date,
            note: tx.note,
            tags: tx.tags
        }).select().single();

        if (error || !newTx) throw error;

        // Update Account Balance
        const account = state.accounts.find(a => a.id === tx.accountId);
        if (account) {
            let newBalance = account.balance;
            if (tx.type === 'INCOME') newBalance += tx.amount;
            else newBalance -= tx.amount;
            
            await supabase.from('accounts').update({ balance: newBalance }).eq('id', tx.accountId);
        }

        if (tx.type === 'TRANSFER' && tx.toAccountId) {
            const toAccount = state.accounts.find(a => a.id === tx.toAccountId);
            if (toAccount) {
                let amountToAdd = tx.amount;
                if (tx.exchangeRate) amountToAdd *= tx.exchangeRate;
                const newBalance = toAccount.balance + amountToAdd;
                await supabase.from('accounts').update({ balance: newBalance }).eq('id', tx.toAccountId);
            }
        }

        dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { ...tx, id: newTx.id, tags: newTx.tags } 
        });
    },

    addAccount: async (acc) => {
        if (!session) return;
        const { data, error } = await supabase.from('accounts').insert(acc).select().single();
        if (error) throw error;
        dispatch({ type: 'ADD_ACCOUNT', payload: { ...acc, id: data.id } });
    },

    deleteAccount: async (id) => {
        if (!session) return;
        const { error } = await supabase.from('accounts').delete().eq('id', id);
        if (error) throw error;
        dispatch({ type: 'DELETE_ACCOUNT', payload: id });
    },

    addBudget: async (budget) => {
        if (!session) return;
        const { data, error } = await supabase.from('budgets').insert({
            category: budget.category,
            limit_amount: budget.limit,
            currency: budget.currency
        }).select().single();
        if (error) throw error;
        dispatch({ type: 'ADD_BUDGET', payload: { ...budget, id: data.id } });
    },

    deleteBudget: async (id) => {
        if (!session) return;
        const { error } = await supabase.from('budgets').delete().eq('id', id);
        if (error) throw error;
        dispatch({ type: 'DELETE_BUDGET', payload: id });
    },

    addDebt: async (debt, accountId) => {
        if (!session) return;
        
        const { data, error } = await supabase.from('debts').insert({
            type: debt.type,
            person_name: debt.personName,
            amount: debt.amount,
            currency: debt.currency,
            due_date: debt.dueDate,
            note: debt.note,
            is_paid: debt.isPaid
        }).select().single();
        
        if (error) throw error;

        if (accountId) {
             const account = state.accounts.find(a => a.id === accountId);
             if (account) {
                 const isLending = debt.type === 'OWED_TO_ME';
                 
                 const transactionType = isLending ? 'EXPENSE' : 'INCOME';
                 const newBalance = isLending ? account.balance - debt.amount : account.balance + debt.amount;
                 
                 await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);

                 const txData = {
                     type: transactionType,
                     amount: debt.amount,
                     currency: debt.currency,
                     account_id: accountId,
                     category: 'Долги',
                     date: new Date().toISOString().split('T')[0],
                     note: isLending ? `Дал в долг: ${debt.personName}` : `Взял в долг: ${debt.personName}`
                 };
                 
                 const { data: txRecord } = await supabase.from('transactions').insert(txData).select().single();
                 
                 if (txRecord) {
                    dispatch({ 
                        type: 'ADD_TRANSACTION', 
                        payload: { ...txRecord, id: txRecord.id, accountId: txRecord.account_id, tags: txRecord.tags || [] } as any
                    });
                 }
             }
        }

        dispatch({ type: 'ADD_DEBT', payload: { ...debt, id: data.id } });
    },

    toggleDebt: async (id, accountId) => {
        if (!session) return;
        const debt = state.debts.find(d => d.id === id);
        if (!debt) return;
        
        const newStatus = !debt.isPaid;
        const { error } = await supabase.from('debts').update({ is_paid: newStatus }).eq('id', id);
        if (error) throw error;

        if (newStatus === true && accountId) {
            const account = state.accounts.find(a => a.id === accountId);
            if (account) {
                const isPayingMyDebt = debt.type === 'I_OWE';
                const transactionType = isPayingMyDebt ? 'EXPENSE' : 'INCOME';
                
                const newBalance = isPayingMyDebt ? account.balance - debt.amount : account.balance + debt.amount;

                await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);

                const txData = {
                    type: transactionType,
                    amount: debt.amount,
                    currency: debt.currency,
                    account_id: accountId,
                    category: 'Долги',
                    date: new Date().toISOString().split('T')[0],
                    note: isPayingMyDebt ? `Вернул долг: ${debt.personName}` : `Мне вернули долг: ${debt.personName}`
                };

                const { data: txRecord } = await supabase.from('transactions').insert(txData).select().single();
                if (txRecord) {
                     dispatch({ 
                        type: 'ADD_TRANSACTION', 
                        payload: { ...txRecord, id: txRecord.id, accountId: txRecord.account_id, tags: txRecord.tags || [] } as any
                    });
                }
            }
        }
        dispatch({ type: 'TOGGLE_DEBT', payload: id });
    },

    addSubscription: async (sub) => {
        if (!session) return;
        const { data, error } = await supabase.from('subscriptions').insert({
            name: sub.name,
            amount: sub.amount,
            currency: sub.currency,
            period: sub.period,
            category: sub.category,
            payment_day: sub.paymentDay
        }).select().single();
        if (error) throw error;
        
        dispatch({ type: 'ADD_SUBSCRIPTION', payload: { ...sub, id: data.id, paymentDay: data.payment_day } });
    },

    deleteSubscription: async (id) => {
        if (!session) return;
        const { error } = await supabase.from('subscriptions').delete().eq('id', id);
        if (error) throw error;
        dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
    },

    processSubscriptionPayment: async (sub, accountId) => {
        if (!session) return;
        
        // 1. If Account ID is provided (User said YES), create Transaction
        if (accountId) {
             const account = state.accounts.find(a => a.id === accountId);
             if (account) {
                 const newBalance = account.balance - sub.amount;
                 await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);

                 const txData = {
                     type: 'EXPENSE',
                     amount: sub.amount,
                     currency: sub.currency,
                     account_id: accountId,
                     category: sub.category,
                     date: new Date().toISOString().split('T')[0],
                     note: `Подписка: ${sub.name}`
                 };
                 const { data: txRecord } = await supabase.from('transactions').insert(txData).select().single();
                 if (txRecord) {
                    dispatch({ 
                        type: 'ADD_TRANSACTION', 
                        payload: { ...txRecord, id: txRecord.id, accountId: txRecord.account_id, tags: txRecord.tags || [] } as any
                    });
                 }
             }
        }

        // 2. Update Subscription 'last_paid' field regardless of Yes/No (to stop asking today)
        // If user said NO, we still mark it as 'handled' for now so the app isn't annoying. 
        // Or if you want to be stricter, only update if YES.
        // Based on request "if no, no transaction appears", implying we are done with it.
        // We will update last_paid to today so it doesn't trigger again until next month.
        
        const { error } = await supabase.from('subscriptions').update({ 
            last_paid: new Date().toISOString() 
        }).eq('id', sub.id);

        if (error) console.error("Error updating subscription status:", error);

        // 3. Clear Pending State
        dispatch({ type: 'SET_PENDING_SUBSCRIPTION', payload: null });
    },

    addCategory: async (payload) => {
        if (!session) return;
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
        dispatch({ type: 'ADD_CATEGORY', payload });
    },

    deleteCategory: async (payload) => {
        if (!session) return;
        const { error } = await supabase.from('categories').delete().eq('name', payload.name).eq('type', payload.type);
        if (error) throw error;
        dispatch({ type: 'DELETE_CATEGORY', payload });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, isLoading, actions, session }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
