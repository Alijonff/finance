
export type Currency = 'UZS' | 'USD' | 'RUB';

export type AccountType = 'CASH' | 'CARD';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  accountId: string;
  toAccountId?: string; // For transfers
  exchangeRate?: number; // For multi-currency transfers
  category: string;
  date: string; // ISO Date string
  note?: string;
  tags?: string[];
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  currency: Currency;
}

export interface Debt {
  id: string;
  type: 'I_OWE' | 'OWED_TO_ME';
  personName: string;
  amount: number;
  currency: Currency;
  dueDate?: string;
  note?: string;
  isPaid: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  period: 'MONTHLY' | 'YEARLY';
  category: string;
  paymentDay: number;
  lastPaid?: string;
}

export type Theme = 'light' | 'dark';
