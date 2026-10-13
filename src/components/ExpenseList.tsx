import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  Receipt, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square,
  FileCheck,
  Car,
  AlertTriangle,
  X,
  CreditCard
} from 'lucide-react';
import { ExpenseRecord, ReimbursementOffset } from '../types';
import { formatTWD, formatDate, exportExpensesToCSV } from '../utils/formatters';
import { CATEGORY_LABELS } from '../data/presets';

interface ExpenseListProps {
  expenses: ExpenseRecord[];
  offsets?: ReimbursementOffset[];
  onOpenNewExpense: () => void;
  onOpenNewOffset?: () => void;
  onEditExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
  onBatchDeleteExpenses?: (ids: string[]) => void;
  onBatchCreateClaim: (selectedIds: string[]) => void;
  onViewReceipt: (expense: ExpenseRecord) => void;
  onNavigateToOffsets?: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  offsets = [],
  onOpenNewExpense,
  onOpenNewOffset,
  onEditExpense,
  onDeleteExpense,
  onBatchDeleteExpenses,
  onBatchCreateClaim,
  onViewReceipt,
  onNavigateToOffsets,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  // Filtered expenses: 依日期由新到舊排序
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Search: 工具名稱、發票/訂單編號、帳號、付款方式
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          e.toolName.toLowerCase().includes(query) ||
          (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(query)) ||
          (e.accountIdentifier && e.accountIdentifier.toLowerCase().includes(query)) ||
          (e.paymentMethod && e.paymentMethod.toLowerCase().includes(query));
        if (!match) return false;
      }

      // Category
      if (categoryFilter !== 'all' && e.toolCategory !== categoryFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
  }, [expenses, searchTerm, categoryFilter]);

  // Selection helpers
  const allFilteredSelected =
    filteredExpenses.length > 0 && filteredExpenses.every((e) => selectedIds.has(e.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredExpenses.forEach((e) => next.add(e.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Selected summaries
  const selectedExpenses = useMemo(() => {
    return expenses.filter((e) => selectedIds.has(e.id));
  }, [expenses, selectedIds]);

  const selectedTotalTWD = selectedExpenses.reduce((sum, e) => sum + e.amountTWD, 0);

  // Totals for user's key numbers
  const totalExpensesTWD = expenses.reduce((sum, e) => sum + e.amountTWD, 0);
  const totalOffsetsTWD = offsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const netRemainingTWD = Math.max(0, totalExpensesTWD - totalOffsetsTWD);

  const handleExportFiltered = () => {
    const toExport = selectedExpenses.length > 0 ? selectedExpenses : filteredExpenses;
    const dateStr = new Date().toISOString().slice(0, 10);
    exportExpensesToCSV(toExport, `AI工具支出明細_${dateStr}.csv`);
  };

  // Batch delete execution
  const handleExecuteBatchDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    if (onBatchDeleteExpenses) {
      onBatchDeleteExpenses(idsToDelete);
    } else {
      idsToDelete.forEach((id) => onDeleteExpense(id));
    }
    setSelectedIds(new Set());
    setShowBatchDeleteConfirm(false);
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-3.5 sm:p-6 lg:p-8 shadow-sm text-slate-900 space-y-5 sm:space-y-7">
      {/* 區塊 1: 頂部標題與主要操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-indigo-600">AI Cost Breakdown · 多人協作平台</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            AI 工具支出明細
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            各項 AI 服務訂閱與 API 儲值紀錄，皆以新台幣 (NT$) 直接計算
          </p>
        </div>

        {/* 頁面操作按鈕 */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportFiltered}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="匯出 CSV 試算表"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>匯出 CSV</span>
          </button>

          <button
            onClick={onOpenNewExpense}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>記一筆 AI 支出</span>
          </button>

          <button
            onClick={onOpenNewOffset || onNavigateToOffsets}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 text-pink-600" />
            <span>新增核銷紀錄</span>
          </button>
        </div>
      </div>

      {/* 區塊 2: 三大核心數據卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 shadow-xs">
          <div className="text-xs text-indigo-900 font-bold">1. AI 累計總支出 (NT$)</div>
          <div className="text-3xl font-black font-mono text-indigo-950 mt-2 tabular-nums">
            {formatTWD(totalExpensesTWD)}
          </div>
          <div className="text-[11px] text-indigo-700 mt-1 font-medium">共計 {expenses.length} 筆支出紀錄</div>
        </div>

        <div 
          onClick={onNavigateToOffsets}
          className="p-5 rounded-2xl bg-pink-50/60 border border-pink-100 cursor-pointer hover:bg-pink-50/90 transition-colors group shadow-xs"
        >
          <div className="text-xs text-pink-900 font-bold flex items-center justify-between">
            <span>2. 已核銷金額 (NT$)</span>
            <span className="text-[11px] text-pink-600 group-hover:underline font-semibold">查看核銷 →</span>
          </div>
          <div className="text-3xl font-black font-mono text-pink-600 mt-2 tabular-nums">
            - {formatTWD(totalOffsetsTWD)}
          </div>
          <div className="text-[11px] text-pink-700 mt-1 font-medium">共 {offsets.length} 筆 (外勤車資抵充)</div>
        </div>

        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs">
          <div className="text-xs text-purple-900 font-extrabold flex items-center justify-between">
            <span>3. 尚餘未核銷金額 (NT$)</span>
            <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">待請款餘額</span>
          </div>
          <div className="text-3xl font-black font-mono text-purple-950 mt-2 tabular-nums">
            {formatTWD(netRemainingTWD)}
          </div>
        </div>
      </div>

      {/* 區塊 3: 搜尋與類別篩選列 */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3 text-slate-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋工具名稱、發票號碼、扣款帳號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="all">所有 AI 工具類別</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips / Reset */}
        {(searchTerm || categoryFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
            <span>篩選結果: {filteredExpenses.length} 筆</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
              className="text-indigo-600 hover:underline cursor-pointer font-bold"
            >
              清除篩選條件
            </button>
          </div>
        )}
      </div>

      {/* 區塊 4: 勾選批次操作橫幅 (含批量刪除功能) */}
      {selectedIds.size > 0 && (
        <div className="rounded-2xl bg-indigo-50/90 border border-indigo-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <CheckSquare className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
            <span className="text-slate-800">
              已選取 <strong className="text-slate-900 tabular-nums font-black">{selectedIds.size} 筆</strong> 支出，合計
              <strong className="text-indigo-950 font-black tabular-nums ml-1.5 text-base">
                {formatTWD(selectedTotalTWD)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* 批量刪除按鈕 */}
            <button
              onClick={() => setShowBatchDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              <span>批量刪除 ({selectedIds.size} 筆)</span>
            </button>

            {/* 產生請款單 */}
            <button
              onClick={() => onBatchCreateClaim(Array.from(selectedIds))}
              className="flex items-center gap-1.5 px-3.5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>產生正式請款單</span>
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              取消選取
            </button>
          </div>
        </div>
      )}

      {/* 區塊 5: 主支出表格 (桌面版表格 + 手機版自適應全資訊卡片) */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs text-slate-900">
        {/* 手機版卡片清單 (md:hidden) - 資訊全展開、零遮蔽、不需橫向滾動 */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 px-4">
              <p className="text-sm font-bold text-slate-800">尚無符合條件的支出紀錄</p>
              <p className="text-xs text-slate-500 mt-1">點擊右上角「記一筆 AI 支出」開始記錄</p>
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const isChecked = selectedIds.has(expense.id);
              const matchedOffsets = offsets.filter((o) => o.targetExpenseId === expense.id);
              const offsetSum = matchedOffsets.reduce((s, o) => s + o.amountTWD, 0);
              const remaining = expense.amountTWD - offsetSum;

              return (
                <div
                  key={expense.id}
                  className={`p-3.5 space-y-2.5 transition-colors ${
                    isChecked ? 'bg-indigo-50/50' : 'bg-white'
                  }`}
                >
                  {/* Top row: Checkbox, Tool Name & Amount */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleSelectOne(expense.id)}
                        className="mt-0.5 cursor-pointer text-slate-400 hover:text-slate-700 shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4.5 w-4.5 text-indigo-600" />
                        ) : (
                          <Square className="h-4.5 w-4.5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-sm leading-snug break-words">
                          {expense.toolName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {CATEGORY_LABELS[expense.toolCategory] || expense.toolCategory}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono font-medium">
                            {formatDate(expense.paymentDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900 text-base font-mono">
                        {formatTWD(expense.amountTWD)}
                      </div>
                    </div>
                  </div>

                  {/* Payment method & invoice detail */}
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    <div className="truncate">
                      <span>{expense.paymentMethod || '信用卡支付'}</span>
                      {expense.accountIdentifier && <span> · {expense.accountIdentifier}</span>}
                    </div>
                    {(expense.invoiceNumber || expense.receiptName) && (
                      <span className="font-mono text-slate-400 shrink-0">
                        單號: {expense.invoiceNumber || expense.receiptName}
                      </span>
                    )}
                  </div>

                  {/* Offset badge if any */}
                  {matchedOffsets.length > 0 && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                      <Car className="h-3 w-3 text-pink-600 shrink-0" />
                      <span>車資抵充 -{formatTWD(offsetSum)}</span>
                      <span className="text-slate-500">(待核銷餘額 {formatTWD(remaining)})</span>
                    </div>
                  )}

                  {/* Bottom Actions Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div>
                      {expense.receiptUrl || expense.receiptName ? (
                        <button
                          onClick={() => onViewReceipt(expense)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors shadow-xs"
                        >
                          <Receipt className="h-3 w-3 text-indigo-600" />
                          <span>查看/下載憑證</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">無收據附件</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>編輯</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`確定要刪除「${expense.toolName}」這筆支出紀錄嗎？`)) {
                            onDeleteExpense(expense.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>刪除</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 桌面版完整表格 (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold select-none">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="cursor-pointer text-slate-400 hover:text-slate-700"
                    title={allFilteredSelected ? '取消全選' : '全選'}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3 font-bold whitespace-nowrap">扣款日期</th>
                <th className="py-3.5 px-3 font-bold">AI 工具與服務名稱</th>
                <th className="py-3.5 px-3 font-bold">類別</th>
                <th className="py-3.5 px-3 font-bold">付款方式 / 帳號</th>
                <th className="py-3.5 px-3 font-bold text-right whitespace-nowrap">支出金額 (NT$)</th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap">發票 / 憑證</th>
                <th className="py-3.5 px-3 font-bold text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-sm font-bold text-slate-800">尚無符合條件的支出紀錄</p>
                      <p className="text-xs text-slate-500">
                        點擊右上角「記一筆 AI 支出」開始記錄
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const isChecked = selectedIds.has(expense.id);
                  const matchedOffsets = offsets.filter((o) => o.targetExpenseId === expense.id);
                  const offsetSum = matchedOffsets.reduce((s, o) => s + o.amountTWD, 0);
                  const remaining = expense.amountTWD - offsetSum;

                  return (
                    <tr
                      key={expense.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => toggleSelectOne(expense.id)}
                          className="cursor-pointer text-slate-400 hover:text-slate-700"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Payment Date */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap tabular-nums font-mono font-medium">
                        {formatDate(expense.paymentDate)}
                      </td>

                      {/* Tool Name */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {expense.toolName}
                        </div>
                        {(expense.invoiceNumber || expense.receiptName) && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[260px]">
                            單號: {expense.invoiceNumber || expense.receiptName}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {CATEGORY_LABELS[expense.toolCategory] || expense.toolCategory}
                        </span>
                      </td>

                      {/* Card & Account */}
                      <td className="py-3 px-3 text-slate-700">
                        <div className="font-medium text-slate-900 truncate max-w-[180px]">
                          {expense.paymentMethod || '信用卡支付'}
                        </div>
                        {expense.accountIdentifier && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {expense.accountIdentifier}
                          </div>
                        )}
                      </td>

                      {/* TWD Amount */}
                      <td className="py-3 px-3 text-right whitespace-nowrap tabular-nums">
                        <div className="font-black text-slate-900 text-sm sm:text-base font-mono">
                          {formatTWD(expense.amountTWD)}
                        </div>
                        {matchedOffsets.length > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded font-mono font-bold">
                            <Car className="h-2.5 w-2.5 text-pink-600" />
                            <span>抵充 -{formatTWD(offsetSum)}</span>
                            <span className="text-slate-500">(餘 {formatTWD(remaining)})</span>
                          </div>
                        )}
                      </td>

                      {/* Receipt */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {expense.receiptUrl || expense.receiptName ? (
                          <button
                            onClick={() => onViewReceipt(expense)}
                            title={expense.receiptName || '檢視憑證'}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors shadow-xs"
                          >
                            <Receipt className="h-3 w-3 text-slate-600" />
                            <span>憑證</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">無附件</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditExpense(expense)}
                            title="編輯此筆支出"
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`確定要刪除「${expense.toolName}」這筆支出紀錄嗎？`)) {
                                onDeleteExpense(expense.id);
                              }
                            }}
                            title="刪除"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 font-medium">
          <div>
            顯示中項目: <span className="text-slate-900 font-bold tabular-nums">{filteredExpenses.length}</span> / {expenses.length} 筆
          </div>
          <div className="flex items-center gap-3">
            <span>
              總計金額 (台幣):{' '}
              <span className="text-slate-900 font-black tabular-nums text-sm font-mono ml-1">
                {formatTWD(filteredExpenses.reduce((sum, e) => sum + e.amountTWD, 0))}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 批量刪除確認彈窗 (Batch Delete Confirmation Modal) */}
      {showBatchDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">確認批量刪除支出紀錄？</h3>
                <p className="text-xs text-slate-500">此動作將永久移除所選紀錄</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-700">
                <span>選取項目數量:</span>
                <span className="font-bold text-slate-900">{selectedIds.size} 筆</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>選取總計金額:</span>
                <span className="font-black text-rose-600 font-mono">{formatTWD(selectedTotalTWD)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              確定要刪除這 <strong className="text-slate-800">{selectedIds.size} 筆</strong> 支出紀錄嗎？刪除後資料將無法直接復原。
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchDelete}
                className="px-4.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                確認批量刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
