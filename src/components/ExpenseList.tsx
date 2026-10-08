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
  Car
} from 'lucide-react';
import { ExpenseRecord, ReimbursementOffset } from '../types';
import { formatTWD, formatOriginalCurrency, formatDate, exportExpensesToCSV } from '../utils/formatters';
import { CATEGORY_LABELS } from '../data/presets';

interface ExpenseListProps {
  expenses: ExpenseRecord[];
  offsets?: ReimbursementOffset[];
  onOpenNewExpense: () => void;
  onOpenNewOffset?: () => void;
  onEditExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
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
  onBatchCreateClaim,
  onViewReceipt,
  onNavigateToOffsets,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Distinct project names for filter
  const distinctProjects = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.projectName) set.add(e.projectName);
    });
    return Array.from(set);
  }, [expenses]);

  // Filtered expenses: 依日期由新到舊排序
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          e.toolName.toLowerCase().includes(query) ||
          e.projectName.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.invoiceNumber.toLowerCase().includes(query) ||
          e.accountIdentifier.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Category
      if (categoryFilter !== 'all' && e.toolCategory !== categoryFilter) {
        return false;
      }

      // Project
      if (projectFilter !== 'all' && e.projectName !== projectFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
  }, [expenses, searchTerm, categoryFilter, projectFilter]);

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

  return (
    // 整體設計區塊為一個大白色區塊，內部再切分精緻子區塊
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs text-slate-900 space-y-7">
      {/* 區塊 1: 頂部標題與唯一一組主要操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700">台灣經濟研究院 · 品牌計畫</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            AI 工具支出明細
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            各項 AI 服務訂閱與 API 儲值紀錄，自動換算匯率與海外交易手續費
          </p>
        </div>

        {/* 頁面唯一一組核心按鈕 */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportFiltered}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-xs"
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
          <div className="text-xs text-indigo-900 font-bold">1. AI 累計總支出</div>
          <div className="text-3xl font-black font-mono text-indigo-950 mt-2 tabular-nums">
            {formatTWD(totalExpensesTWD)}
          </div>
          <div className="text-[11px] text-indigo-700 mt-1 font-medium">共計 {expenses.length} 筆支出紀錄</div>
        </div>

        <div 
          onClick={onNavigateToOffsets}
          className="p-5 rounded-2xl bg-pink-50/60 border border-pink-100 cursor-pointer hover:bg-pink-50 transition-colors group shadow-xs"
        >
          <div className="text-xs text-pink-900 font-bold flex items-center justify-between">
            <span>2. 已核銷金額</span>
            <span className="text-[11px] text-pink-600 group-hover:underline font-semibold">查看核銷 →</span>
          </div>
          <div className="text-3xl font-black font-mono text-pink-600 mt-2 tabular-nums">
            - {formatTWD(totalOffsetsTWD)}
          </div>
          <div className="text-[11px] text-pink-700 mt-1 font-medium">共 {offsets.length} 筆 (計程車單抵充)</div>
        </div>

        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs">
          <div className="text-xs text-purple-900 font-extrabold flex items-center justify-between">
            <span>3. 尚餘未核銷金額</span>
            <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">待請款餘額</span>
          </div>
          <div className="text-3xl font-black font-mono text-purple-950 mt-2 tabular-nums">
            {formatTWD(netRemainingTWD)}
          </div>
        </div>
      </div>

      {/* 區塊 3: 搜尋與類別/專案篩選列 (無審核狀態) */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3 text-slate-900">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋工具名稱、用途說明..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="all">所有 AI 工具類別</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="all">所有歸屬專案</option>
              {distinctProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips / Reset */}
        {(searchTerm || categoryFilter !== 'all' || projectFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
            <span>篩選結果: {filteredExpenses.length} 筆</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setProjectFilter('all');
              }}
              className="text-indigo-600 hover:underline cursor-pointer font-bold"
            >
              清除所有篩選
            </button>
          </div>
        )}
      </div>

      {/* 區塊 4: 勾選批次操作橫幅 (僅產生請款單，無審核狀態) */}
      {selectedIds.size > 0 && (
        <div className="rounded-2xl bg-indigo-50/70 border border-indigo-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 text-slate-900">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <CheckSquare className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-slate-800">
              已勾選 <strong className="text-slate-900 tabular-nums font-black">{selectedIds.size} 筆</strong> 支出，合計金額
              <strong className="text-indigo-950 font-black tabular-nums ml-1 text-base">
                {formatTWD(selectedTotalTWD)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => onBatchCreateClaim(Array.from(selectedIds))}
              className="flex items-center gap-1.5 px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>產生正式請款單 (PDF/列印)</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              取消選取
            </button>
          </div>
        </div>
      )}

      {/* 區塊 5: 主支出表格 (無審核狀態欄位) */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs text-slate-900">
        <div className="overflow-x-auto">
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
                <th className="py-3.5 px-3 font-bold">AI 工具與類別</th>
                <th className="py-3.5 px-3 font-bold">歸屬專案與用途</th>
                <th className="py-3.5 px-3 font-bold">付款方式/卡別</th>
                <th className="py-3.5 px-3 font-bold text-right whitespace-nowrap">原幣金額</th>
                <th className="py-3.5 px-3 font-bold text-right whitespace-nowrap">實支總額 (台幣)</th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap">發票/憑證</th>
                <th className="py-3.5 px-3 font-bold text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-sm font-bold text-slate-800">尚無符合條件的支出紀錄</p>
                      <p className="text-xs text-slate-500">
                        點擊上方「記一筆 AI 支出」開始記錄
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const isChecked = selectedIds.has(expense.id);
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

                      {/* Tool & Category */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{expense.toolName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {CATEGORY_LABELS[expense.toolCategory] || expense.toolCategory}
                        </div>
                      </td>

                      {/* Project & Purpose */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 truncate max-w-xs" title={expense.description}>
                          {expense.projectName || '-'}
                        </div>
                      </td>

                      {/* Card & Account */}
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{expense.paymentMethod}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {expense.accountIdentifier}
                        </div>
                      </td>

                      {/* Original Currency */}
                      <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap tabular-nums">
                        <div className="font-mono">{formatOriginalCurrency(expense.originalAmount, expense.currency)}</div>
                        <div className="text-[10px] text-slate-400">
                          匯率 @ {expense.exchangeRate}
                        </div>
                      </td>

                      {/* TWD Amount */}
                      <td className="py-3 px-3 text-right whitespace-nowrap tabular-nums">
                        <div className="font-black text-slate-900 text-sm font-mono">
                          {formatTWD(expense.amountTWD)}
                        </div>
                        {expense.hasForeignFee ? (
                          <div className="text-[10px] text-indigo-600 font-medium">
                            含手續費 {formatTWD(expense.foreignFeeTWD)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">無海外手續費</div>
                        )}
                        {(() => {
                          const matchedOffsets = offsets.filter((o) => o.targetExpenseId === expense.id);
                          if (matchedOffsets.length === 0) return null;
                          const offsetSum = matchedOffsets.reduce((s, o) => s + o.amountTWD, 0);
                          const remaining = expense.amountTWD - offsetSum;
                          return (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded font-mono font-bold">
                              <Car className="h-2.5 w-2.5 text-pink-600" />
                              <span>已核銷 -{formatTWD(offsetSum)}</span>
                              <span className="text-slate-500">(餘 {formatTWD(remaining)})</span>
                            </div>
                          );
                        })()}
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
        <div className="p-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50 font-medium">
          <div>
            顯示中項目: <span className="text-slate-900 font-bold tabular-nums">{filteredExpenses.length}</span> 筆
          </div>
          <div className="flex items-center gap-3">
            <span>
              總金額小計:{' '}
              <span className="text-slate-900 font-black tabular-nums ml-1">
                {formatTWD(filteredExpenses.reduce((sum, e) => sum + e.amountTWD, 0))}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
