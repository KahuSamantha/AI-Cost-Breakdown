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

  // Batch delete expenses
  const handleBatchDeleteExpenses = (ids: string[]) => {
    const updated = expenses.filter((e) => !ids.includes(e.id));
    updateExpenses(updated);
  };

  // Batch delete offsets
  const handleBatchDeleteOffsets = (ids: string[]) => {
    const updated = offsets.filter((o) => !ids.includes(o.id));
    updateOffsets(updated);
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
      totalOriginalUSD: selectedItems.filter(e => e.currency === 'USD').reduce((s, e) => s + (e.originalAmount || 0), 0),
      status: 'submitted',
      submissionDate: dateObj.toISOString().slice(0, 10),
      notes: '台灣經濟研究院 品牌計畫 AI 工具費用核銷請款單。',
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
    offsets?: ReimbursementOffset[];
  }) => {
    updateExpenses(data.expenses);
    updateBatches(data.batches);
    updateProfile(data.profile);
    if (data.offsets && data.offsets.length > 0) {
      updateOffsets(data.offsets);
    }
  };

  const totalOffsetsAmount = offsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amountTWD, 0);

  return (
    <div className="min-h-screen bg-slate-50/80 bg-mesh-ambient text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* 全域主視覺科技網格與環境氛圍光 (Key Visual Ambient Grid & Glow) */}
      <div className="fixed inset-0 bg-grid-tech pointer-events-none opacity-40 z-0" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-20 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none z-0" />

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
      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-8">
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
            onBatchDeleteExpenses={handleBatchDeleteExpenses}
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
            onBatchDeleteOffsets={handleBatchDeleteOffsets}
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
        offsets={offsets}
        onImportAllData={handleImportAllData}
        onResetData={handleResetData}
      />

      {/* Clean Light Footer */}
      <footer className="relative z-10 no-print border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-4 text-center text-xs text-slate-500">
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
