/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getStoredExpenses, 
  saveStoredExpenses, 
  getStoredBatches, 
  saveStoredBatches, 
  getStoredProfile, 
  saveStoredProfile,
  getStoredOffsets,
  saveStoredOffsets,
  resetAllDataToDefault,
  sortOffsetsByDateDesc,
  sortExpensesByDateDesc
} from './utils/storage';
import { ExpenseRecord, ReimbursementBatch, UserProfile, ReimbursementOffset } from './types';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExpenseList } from './components/ExpenseList';
import { OffsetsPageView } from './components/OffsetsPageView';
import { ExpenseModal } from './components/ExpenseModal';
import { OffsetEditModal } from './components/OffsetEditModal';
import { ClaimPrintModal } from './components/ClaimPrintModal';
import { ReceiptPreviewModal } from './components/ReceiptPreviewModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'expenses' | 'offsets'>('dashboard');
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [batches, setBatches] = useState<ReimbursementBatch[]>([]);
  const [offsets, setOffsets] = useState<ReimbursementOffset[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile());

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [isOffsetModalOpen, setIsOffsetModalOpen] = useState(false);
  const [editingOffset, setEditingOffset] = useState<ReimbursementOffset | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedReceiptExpense, setSelectedReceiptExpense] = useState<ExpenseRecord | null>(null);
  const [selectedPrintBatch, setSelectedPrintBatch] = useState<ReimbursementBatch | null>(null);

  // Initialize data on mount
  useEffect(() => {
    setExpenses(getStoredExpenses());
    setBatches(getStoredBatches());
    setOffsets(getStoredOffsets());
    setUserProfile(getStoredProfile());
  }, []);

  // Save changes
  const updateExpenses = (newExpenses: ExpenseRecord[]) => {
    const sorted = sortExpensesByDateDesc(newExpenses);
    setExpenses(sorted);
    saveStoredExpenses(sorted);
  };

  const updateBatches = (newBatches: ReimbursementBatch[]) => {
    setBatches(newBatches);
    saveStoredBatches(newBatches);
  };

  const updateOffsets = (newOffsets: ReimbursementOffset[]) => {
    const sorted = sortOffsetsByDateDesc(newOffsets);
    setOffsets(sorted);
    saveStoredOffsets(sorted);
  };

  const handleAddOffset = (offsetData: Omit<ReimbursementOffset, 'id' | 'createdAt'>) => {
    const newOffset: ReimbursementOffset = {
      ...offsetData,
      id: `OFFSET-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    updateOffsets([newOffset, ...offsets]);
  };

  const handleSaveOffset = (
    offsetData: Omit<ReimbursementOffset, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    if (editId) {
      updateOffsets(
        offsets.map((o) => (o.id === editId ? { ...o, ...offsetData } : o))
      );
    } else {
      handleAddOffset(offsetData);
    }
  };

  const handleOpenNewOffset = () => {
    setEditingOffset(null);
    setIsOffsetModalOpen(true);
  };

  const handleOpenEditOffset = (offset: ReimbursementOffset) => {
    setEditingOffset(offset);
    setIsOffsetModalOpen(true);
  };

  const handleDeleteOffset = (id: string) => {
    updateOffsets(offsets.filter((o) => o.id !== id));
  };

  const handleUpdateOffsetStatus = (id: string, status: 'claimed' | 'reimbursed') => {
    updateOffsets(offsets.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const updateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveStoredProfile(newProfile);
  };

  // Add or edit expense
  const handleSaveExpense = (
    data: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const now = new Date().toISOString();
    if (editId) {
      const updated = expenses.map((item) =>
        item.id === editId ? { ...item, ...data, updatedAt: now } : item
      );
      updateExpenses(updated);
    } else {
      const newRecord: ExpenseRecord = {
        ...data,
        id: `EXP-ITEM-${Date.now().toString().slice(-6)}`,
        createdAt: now,
        updatedAt: now,
      };
      updateExpenses([newRecord, ...expenses]);
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  // Delete expense
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    updateExpenses(updated);
  };

  // Batch create formal claim
  const handleBatchCreateClaim = (selectedIds: string[]) => {
    const selectedItems = expenses.filter((e) => selectedIds.includes(e.id));
    if (selectedItems.length === 0) return;

    const totalTWD = selectedItems.reduce((sum, e) => sum + e.amountTWD, 0);
    const dateObj = new Date();
    const batchNo = `EXP-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    
    const newBatch: ReimbursementBatch = {
      id: `BATCH-${Date.now()}`,
      batchNumber: batchNo,
      title: `台灣經濟研究院 品牌計畫 ${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月 AI 工具核銷請款單`,
      applicantName: userProfile.name,
      applicantDepartment: userProfile.department,
      companyName: userProfile.companyName,
      companyTaxId: userProfile.companyTaxId,
      expenseIds: selectedIds,
      totalAmountTWD: totalTWD,
      totalOriginalUSD: selectedItems.filter(e => e.currency === 'USD').reduce((s, e) => s + e.originalAmount, 0),
      status: 'submitted',
      submissionDate: dateObj.toISOString().slice(0, 10),
      notes: '台灣經濟研究院 品牌計畫 AI 工具與 API 額度核銷請款，附電子收據及水單。',
      createdAt: dateObj.toISOString(),
    };

    updateBatches([newBatch, ...batches]);

    const updatedExpenses = expenses.map((e) => {
      if (selectedIds.includes(e.id)) {
        return {
          ...e,
          batchId: batchNo,
          submittedDate: dateObj.toISOString().slice(0, 10),
          updatedAt: dateObj.toISOString(),
        };
      }
      return e;
    });
    updateExpenses(updatedExpenses);

    setSelectedPrintBatch(newBatch);
  };

  const handleResetData = () => {
    resetAllDataToDefault();
    setExpenses(getStoredExpenses());
    setBatches(getStoredBatches());
    setUserProfile(getStoredProfile());
    setOffsets(getStoredOffsets());
  };

  const handleImportAllData = (data: {
    expenses: ExpenseRecord[];
    batches: ReimbursementBatch[];
    profile: UserProfile;
  }) => {
    updateExpenses(data.expenses);
    updateBatches(data.batches);
    updateProfile(data.profile);
  };

  const totalOffsetsAmount = offsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amountTWD, 0);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        userProfile={userProfile}
        offsetsTotal={totalOffsetsAmount}
        totalExpensesAmount={totalExpensesAmount}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            expenses={expenses}
            offsets={offsets}
            userProfile={userProfile}
            onNavigateToExpenses={() => setCurrentTab('expenses')}
            onNavigateToOffsets={() => setCurrentTab('offsets')}
            onOpenNewExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onOpenNewOffset={handleOpenNewOffset}
            onEditOffset={handleOpenEditOffset}
            onDeleteOffset={handleDeleteOffset}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            offsets={offsets}
            onOpenNewExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onOpenNewOffset={handleOpenNewOffset}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onBatchCreateClaim={handleBatchCreateClaim}
            onViewReceipt={(exp) => setSelectedReceiptExpense(exp)}
            onNavigateToOffsets={() => setCurrentTab('offsets')}
          />
        )}

        {currentTab === 'offsets' && (
          <OffsetsPageView
            offsets={offsets}
            expenses={expenses}
            onAddOffset={handleAddOffset}
            onSaveOffset={handleSaveOffset}
            onDeleteOffset={handleDeleteOffset}
            onUpdateOffsetStatus={handleUpdateOffsetStatus}
            onNavigateToExpenses={() => setCurrentTab('expenses')}
            onOpenNewExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onOpenNewOffset={handleOpenNewOffset}
            onOpenEditOffset={handleOpenEditOffset}
          />
        )}
      </main>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        userProfile={userProfile}
      />

      <OffsetEditModal
        isOpen={isOffsetModalOpen}
        onClose={() => {
          setIsOffsetModalOpen(false);
          setEditingOffset(null);
        }}
        offset={editingOffset}
        expenses={expenses}
        onSave={handleSaveOffset}
        onDelete={handleDeleteOffset}
      />

      <ClaimPrintModal
        isOpen={!!selectedPrintBatch}
        onClose={() => setSelectedPrintBatch(null)}
        batch={selectedPrintBatch!}
        expenses={expenses}
        userProfile={userProfile}
      />

      <ReceiptPreviewModal
        isOpen={!!selectedReceiptExpense}
        onClose={() => setSelectedReceiptExpense(null)}
        expense={selectedReceiptExpense}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={updateProfile}
        expenses={expenses}
        batches={batches}
        onImportAllData={handleImportAllData}
        onResetData={handleResetData}
      />

      {/* Clean Light Footer */}
      <footer className="no-print border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700">台灣經濟研究院 · 品牌計畫</span>
            <span className="mx-2">·</span>
            <span>品牌計畫 AI工具費用核銷系統</span>
          </div>
          <div>
            申請人 / 經辦人: <strong className="text-slate-700">{userProfile.name}</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
