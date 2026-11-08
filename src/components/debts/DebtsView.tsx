/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  History,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DebtItem } from '../../types/finance';
import { calculateDebtSummary, formatBDT, getCurrentDateStr } from '../../utils/finance';
import { ConfirmModal } from '../common/ConfirmModal';

export const DebtsView: React.FC = () => {
  const { state, addDebt, updateDebt, deleteDebt, addDebtRepayment, deleteDebtRepayment } =
    useFinance();
  const summary = calculateDebtSummary(state.debts);

  // Active filter tab: 'all' | 'i_owe' | 'they_owe_me'
  const [activeDebtSection, setActiveDebtSection] = useState<'all' | 'i_owe' | 'they_owe_me'>('all');

  // Add Debt Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [debtType, setDebtType] = useState<'i_owe' | 'they_owe_me'>('i_owe');
  const [personName, setPersonName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [debtDate, setDebtDate] = useState(getCurrentDateStr());
  const [description, setDescription] = useState('');

  // Repayment Modal
  const [repayingDebt, setRepayingDebt] = useState<DebtItem | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayDate, setRepayDate] = useState(getCurrentDateStr());
  const [repayNote, setRepayNote] = useState('');

  // Expanded History for debt items
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Delete confirm state
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);

  // Edit Debt Modal
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(totalAmount);
    if (!parsed || parsed <= 0 || !personName.trim()) return;

    addDebt({
      type: debtType,
      personName: personName.trim(),
      totalAmount: parsed,
      date: debtDate,
      description: description.trim(),
    });

    setPersonName('');
    setTotalAmount('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleSaveRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayingDebt) return;
    const parsed = Number(repayAmount);
    if (!parsed || parsed <= 0) return;

    addDebtRepayment(repayingDebt.id, {
      amount: parsed,
      date: repayDate,
      note: repayNote.trim() || 'Installment payment',
    });

    setRepayAmount('');
    setRepayNote('');
    setRepayingDebt(null);
  };

  const handleUpdateDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDebt) return;
    const parsed = Number(editingDebt.totalAmount);
    if (!parsed || parsed <= 0) return;

    updateDebt(editingDebt.id, {
      type: editingDebt.type,
      personName: editingDebt.personName,
      totalAmount: parsed,
      date: editingDebt.date,
      description: editingDebt.description,
    });

    setEditingDebt(null);
  };

  const filteredDebts = state.debts.filter((d) => {
    if (activeDebtSection === 'i_owe') return d.type === 'i_owe';
    if (activeDebtSection === 'they_owe_me') return d.type === 'they_owe_me';
    return true;
  });

  const renderDebtCard = (debt: DebtItem) => {
    const isIOwe = debt.type === 'i_owe';
    const totalPaid = debt.repayments.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const remaining = Math.max(0, debt.totalAmount - totalPaid);
    const isExpanded = !!expandedIds[debt.id];

    let statusBadge = (
      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
        <AlertCircle className="w-3 h-3" /> Unpaid
      </span>
    );
    if (debt.status === 'settled') {
      statusBadge = (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="w-3 h-3" /> Settled
        </span>
      );
    } else if (debt.status === 'partial') {
      statusBadge = (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" /> Partial
        </span>
      );
    }

    return (
      <div
        key={debt.id}
        className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4 hover:border-slate-300 transition"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isIOwe ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {isIOwe ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base">{debt.personName}</h3>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    isIOwe ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isIOwe ? 'Money I Owe' : 'Owes Me'}
                </span>
                {statusBadge}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Borrowed/Lent on: {debt.date} {debt.description ? `• ${debt.description}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
            <div className="text-left sm:text-right">
              <div className="text-base sm:text-lg font-black text-slate-900">
                {formatBDT(debt.totalAmount)}
              </div>
              <div className="text-[11px] text-slate-500">
                Remaining:{' '}
                <span
                  className={`font-bold ${
                    remaining === 0 ? 'text-emerald-600' : isIOwe ? 'text-red-600' : 'text-blue-600'
                  }`}
                >
                  {formatBDT(remaining)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditingDebt(debt)}
                aria-label={`Edit ${debt.personName}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#1769D2] hover:bg-slate-50 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeletingDebtId(debt.id)}
                aria-label={`Delete ${debt.personName}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress of repayments */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              Repaid: <strong className="text-slate-800">{formatBDT(totalPaid)}</strong>
            </span>
            <span>
              Total: <strong className="text-slate-800">{formatBDT(debt.totalAmount)}</strong>
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                debt.status === 'settled'
                  ? 'bg-emerald-500'
                  : isIOwe
                  ? 'bg-red-500'
                  : 'bg-[#1769D2]'
              }`}
              style={{
                width: `${
                  debt.totalAmount > 0
                    ? Math.min(100, Math.round((totalPaid / debt.totalAmount) * 100))
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Action buttons & History toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={() => toggleExpand(debt.id)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <History className="w-3.5 h-3.5 text-[#1769D2]" />
            <span>Payment History ({debt.repayments.length})</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {remaining > 0 && (
            <button
              onClick={() => {
                setRepayingDebt(debt);
                setRepayAmount(remaining.toString());
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF3FF] hover:bg-blue-100 text-[#1769D2] text-xs font-bold transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#1769D2]" />
              <span>Record Repayment</span>
            </button>
          )}
        </div>

        {/* Expanded Repayment History Table */}
        {isExpanded && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-700">Repayment Installments</h4>
            {debt.repayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-1">No installments recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {debt.repayments.map((rep) => (
                  <div key={rep.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{formatBDT(rep.amount)}</span>
                      <span className="text-slate-500 ml-2">({rep.date})</span>
                      {rep.note && <p className="text-[11px] text-slate-600 mt-0.5">{rep.note}</p>}
                    </div>
                    <button
                      onClick={() => deleteDebtRepayment(debt.id, rep.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete repayment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Debts & Personal Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track money you owe to others and money people owe you with installment logs
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Debt Entry</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Money I Owe (Payable) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Money I Owe (Payable)</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            {formatBDT(summary.iOweRemaining)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total Borrowed: {formatBDT(summary.iOweTotal)} • Repaid: {formatBDT(summary.iOwePaid)}
          </p>
        </div>

        {/* Money People Owe Me (Receivable) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              People Owe Me (Receivable)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {formatBDT(summary.theyOweMeRemaining)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total Lent: {formatBDT(summary.theyOweMeTotal)} • Recovered:{' '}
            {formatBDT(summary.theyOweMePaid)}
          </p>
        </div>

        {/* Net Debt Position */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Net Debt Position</span>
          <div
            className={`text-2xl font-black mt-2 ${
              summary.netDebtPosition >= 0 ? 'text-[#1769D2]' : 'text-amber-600'
            }`}
          >
            {formatBDT(summary.netDebtPosition)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.netDebtPosition >= 0
              ? 'Positive: more to receive than owe'
              : 'Caution: payables exceed receivables'}
          </p>
        </div>
      </div>

      {/* Tabs Switcher for Sections */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveDebtSection('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeDebtSection === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Accounts ({state.debts.length})
        </button>
        <button
          onClick={() => setActiveDebtSection('i_owe')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeDebtSection === 'i_owe'
              ? 'bg-white text-red-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Money I Owe ({state.debts.filter((d) => d.type === 'i_owe').length})
        </button>
        <button
          onClick={() => setActiveDebtSection('they_owe_me')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeDebtSection === 'they_owe_me'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          People Owe Me ({state.debts.filter((d) => d.type === 'they_owe_me').length})
        </button>
      </div>

      {/* Debts List */}
      <div className="space-y-4">
        {filteredDebts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm shadow-2xs">
            No debt records found for this section. Tap &quot;Add Debt Entry&quot; above to log a debt.
          </div>
        ) : (
          filteredDebts.map(renderDebtCard)
        )}
      </div>

      {/* Add Debt Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Add Debt / Loan Record</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Type of Debt
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDebtType('i_owe')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      debtType === 'i_owe'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Money I Owe (Payable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType('they_owe_me')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      debtType === 'they_owe_me'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    People Owe Me (Receivable)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahim Brother / Shakil / Landlord"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Total Amount (৳) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={debtDate}
                    onChange={(e) => setDebtDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reason / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Borrowed for emergency bike repair"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-sm font-bold transition active:scale-95 shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Repayment Modal */}
      {repayingDebt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Repayment Installment</h3>
              <button
                onClick={() => setRepayingDebt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRepayment} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                Person: <strong className="text-slate-800">{repayingDebt.personName}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Repayment Amount (৳ BDT)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={repayDate}
                  onChange={(e) => setRepayDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Note</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via bKash installment 1"
                  value={repayNote}
                  onChange={(e) => setRepayNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRepayingDebt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1769D2] text-white text-xs font-bold transition active:scale-95 shadow-xs"
                >
                  Save Installment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Debt Modal */}
      {editingDebt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Debt Record</h3>
              <button
                onClick={() => setEditingDebt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDebtSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Person</label>
                <input
                  type="text"
                  required
                  value={editingDebt.personName}
                  onChange={(e) =>
                    setEditingDebt({ ...editingDebt, personName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total (৳)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingDebt.totalAmount}
                    onChange={(e) =>
                      setEditingDebt({
                        ...editingDebt,
                        totalAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingDebt.date}
                    onChange={(e) => setEditingDebt({ ...editingDebt, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingDebt.description}
                  onChange={(e) =>
                    setEditingDebt({ ...editingDebt, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDebt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1769D2] text-white text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingDebtId}
        title="Delete Debt Account"
        message="Are you sure you want to delete this debt record and its associated payment history?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingDebtId) {
            deleteDebt(deletingDebtId);
            setDeletingDebtId(null);
          }
        }}
        onCancel={() => setDeletingDebtId(null)}
      />
    </div>
  );
};
