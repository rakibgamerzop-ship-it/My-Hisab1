/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Settings,
  Globe,
  Palette,
  DollarSign,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle,
  Smartphone,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { exportToCSV, formatBDT } from '../../utils/finance';
import { ConfirmModal } from '../common/ConfirmModal';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    state,
    updateBudget,
    backupJSON,
    restoreJSON,
    resetAllData,
    showToast,
  } = useFinance();

  // Salary Setting state
  const [salaryInput, setSalaryInput] = useState(state.budget.monthlySalary.toString());
  const [rentInput, setRentInput] = useState(state.budget.houseRent.toString());
  const [foodInput, setFoodInput] = useState(state.budget.dailyFoodBudget.toString());
  const [familyInput, setFamilyInput] = useState(state.budget.monthlyFamilySupport.toString());
  const [savingsInput, setSavingsInput] = useState(state.budget.monthlySavingsTarget.toString());
  const [otherInput, setOtherInput] = useState(state.budget.otherExpensesBudget.toString());

  // Reset Confirm state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Hidden file input for restore
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveBudgetSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudget({
      monthlySalary: Math.max(0, Number(salaryInput) || 0),
      houseRent: Math.max(0, Number(rentInput) || 0),
      dailyFoodBudget: Math.max(0, Number(foodInput) || 0),
      monthlyFamilySupport: Math.max(0, Number(familyInput) || 0),
      monthlySavingsTarget: Math.max(0, Number(savingsInput) || 0),
      otherExpensesBudget: Math.max(0, Number(otherInput) || 0),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        restoreJSON(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportAllCSV = () => {
    const allExpenses = state.expenses.map((e) => ({
      Type: 'EXPENSE',
      Date: e.date,
      Category: e.category,
      Amount: e.amount,
      Location: e.shopOrLocation,
      Description: e.description,
      Method: e.paymentMethod,
    }));
    exportToCSV(allExpenses, `my-hisab-full-export-${new Date().toISOString().slice(0, 10)}`);
    showToast('Exported full dataset to CSV');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure default budget limits, currency, backups, and app installation
          </p>
        </div>
      </div>

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* App Language */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <Globe className="w-4 h-4 text-[#1769D2]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Language
            </h3>
          </div>
          <div className="text-base font-bold text-slate-900">English</div>
          <p className="text-xs text-slate-500">Default interface language for Bangladesh finance</p>
        </div>

        {/* Theme */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <Palette className="w-4 h-4 text-[#1769D2]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Theme</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#1769D2] ring-2 ring-blue-200" />
            <span className="text-base font-bold text-slate-900">Blue & White</span>
          </div>
          <p className="text-xs text-slate-500">#1769D2 Primary Blue & #EAF3FF Light Blue</p>
        </div>

        {/* Currency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <DollarSign className="w-4 h-4 text-[#1769D2]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Currency
            </h3>
          </div>
          <div className="text-base font-bold text-slate-900">Bangladeshi Taka (৳ BDT)</div>
          <p className="text-xs text-slate-500">Standard formatting: ৳20,000</p>
        </div>
      </div>

      {/* Salary & Budget Defaults Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Salary & Budget Settings</h2>
          <p className="text-xs text-slate-500">
            Adjust your monthly benchmarks and baseline targets
          </p>
        </div>

        <form onSubmit={handleSaveBudgetSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Monthly Salary Setting (৳)
              </label>
              <input
                type="number"
                min="0"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                House Rent Budget (৳)
              </label>
              <input
                type="number"
                min="0"
                value={rentInput}
                onChange={(e) => setRentInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Daily Food Budget (৳)
              </label>
              <input
                type="number"
                min="0"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Monthly Family Support (৳)
              </label>
              <input
                type="number"
                min="0"
                value={familyInput}
                onChange={(e) => setFamilyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Monthly Savings Target (৳)
              </label>
              <input
                type="number"
                min="0"
                value={savingsInput}
                onChange={(e) => setSavingsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Other Expenses Budget (৳)
              </label>
              <input
                type="number"
                min="0"
                value={otherInput}
                onChange={(e) => setOtherInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
            >
              Save Budget Settings
            </button>
          </div>
        </form>
      </div>

      {/* Data Backup & Restore Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Data Safety, Backup & Restore</h2>
            <p className="text-xs text-slate-500">
              Download complete database backups to keep your financial logs permanently safe
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Backup JSON */}
          <button
            onClick={backupJSON}
            className="flex flex-col items-start p-4 rounded-xl bg-slate-50 hover:bg-[#EAF3FF] hover:border-blue-200 border border-slate-200 text-left transition"
          >
            <Download className="w-5 h-5 text-[#1769D2] mb-2" />
            <span className="text-sm font-bold text-slate-900">Download Backup</span>
            <span className="text-xs text-slate-500 mt-1">Export full JSON database snapshot</span>
          </button>

          {/* Restore JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-start p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition"
          >
            <Upload className="w-5 h-5 text-indigo-600 mb-2" />
            <span className="text-sm font-bold text-slate-900">Restore Backup</span>
            <span className="text-xs text-slate-500 mt-1">Upload previously saved JSON file</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Export CSV */}
          <button
            onClick={handleExportAllCSV}
            className="flex flex-col items-start p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-2" />
            <span className="text-sm font-bold text-slate-900">Export All CSV</span>
            <span className="text-xs text-slate-500 mt-1">Spreadsheet for Excel & Google Sheets</span>
          </button>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-red-600">Danger Zone: Reset All Data</h3>
            <p className="text-xs text-slate-500">
              Clear all transactions, debts, savings, and custom entries permanently.
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* PWA Android & Mobile Installation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#EAF3FF] text-[#1769D2]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Android & Mobile PWA Installation</h2>
            <p className="text-xs text-slate-500">
              Install My Hisab to your home screen for full offline support and fast native experience
            </p>
          </div>
        </div>
        <div className="pt-2 max-w-sm">
          <PWAInstallButton variant="button" />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset All Financial Records?"
        message="This will permanently delete all your expenses, incomes, debts, family support payments, and savings history. This action cannot be undone unless you have a JSON backup."
        confirmLabel="Yes, Reset Everything"
        isDestructive={true}
        onConfirm={resetAllData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
