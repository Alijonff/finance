
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AddOperation } from './pages/AddOperation';
import { Budgets } from './pages/Budgets';
import { Debts } from './pages/Debts';
import { Subscriptions } from './pages/Subscriptions';
import { Analytics } from './pages/Analytics';
import { Menu } from './pages/Menu';
import { History } from './pages/History';
import { Categories } from './pages/Categories';
import { ManageAccounts } from './pages/ManageAccounts';
import { Auth } from './pages/Auth';

const ProtectedRoute = () => {
  const { session, isLoading } = useApp();

  if (isLoading) return null; // Or a loading spinner handled inside Layout/Context usually, but here checking early return
  if (!session) return <Auth />;

  return <Layout />;
};

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Home />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="add" element={<AddOperation />} />
            <Route path="debts" element={<Debts />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="history" element={<History />} />
            <Route path="categories" element={<Categories />} />
            <Route path="accounts" element={<ManageAccounts />} />
            <Route path="menu" element={<Menu />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
