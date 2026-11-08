/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { OfflineIndicator } from './components/common/OfflineIndicator';

import { DashboardView } from './components/dashboard/DashboardView';
import { AddExpenseView } from './components/expenses/AddExpenseView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetView } from './components/budget/BudgetView';
import { FamilySupportView } from './components/family/FamilySupportView';
import { DebtsView } from './components/debts/DebtsView';
import { SavingsView } from './components/savings/SavingsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  // Android hardware back button handler
  useEffect(() => {
    let handler: { remove: () => void } | undefined;
    try {
      CapApp.addListener('backButton', () => {
        if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
        } else {
          CapApp.exitApp();
        }
      }).then((res) => {
        handler = res;
      });
    } catch {
      // Running in standard web browser
    }

    return () => {
      handler?.remove();
    };
  }, [activeTab, setActiveTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'add-expense' && <AddExpenseView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'budget' && <BudgetView />}
          {activeTab === 'family' && <FamilySupportView />}
          {activeTab === 'debts' && <DebtsView />}
          {activeTab === 'savings' && <SavingsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <BottomNav />
      <ToastContainer />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
