import React, { useMemo } from 'react';
import { 
  CreditCard, 
  ArrowRight, 
  Plus, 
  FileCheck2,
  Edit3,
  Trash2
} from 'lucide-react';
import { ExpenseRecord, ReimbursementOffset, UserProfile } from '../types';
import { formatTWD, formatOriginalCurrency, formatDate } from '../utils/formatters';

interface DashboardViewProps {
  expenses: ExpenseRecord[];
  offsets: ReimbursementOffset[];
  userProfile: UserProfile;
  onNavigateToExpenses: () => void;
  onNavigateToOffsets: () => void;
  onOpenNewExpense: () => void;
  onOpenNewOffset?: () => void;
  onEditOffset?: (offset: ReimbursementOffset) => void;
  onDeleteOffset?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  offsets,
  userProfile,
  onNavigateToExpenses,
  onNavigateToOffsets,
  onOpenNewExpense,
  onOpenNewOffset,
  onEditOffset,
  onDeleteOffset,
}) => {
  // 嚴格依日期由新到舊排序 (Newest first)
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
  }, [expenses]);

  const sortedOffsets = useMemo(() => {
    return [...offsets].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [offsets]);

  // Key numbers: AI Expenses & Offsets
  const totalExpenseTWD = expenses.reduce((sum, e) => sum + e.amountTWD, 0);
  const taxiOffsets = offsets.filter((o) => o.offsetType === 'taxi');
  const accountingOffsets = offsets.filter((o) => o.offsetType !== 'taxi');
  const taxiTotal = taxiOffsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const accountingTotal = accountingOffsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const totalOffsetTWD = taxiTotal + accountingTotal;

  // Remaining Unreimbursed Balance: 9,613 - 2,613 = 7,000
  const netRemainingTWD = Math.max(0, totalExpenseTWD - totalOffsetTWD);

  return (
    // 整體設計區塊為一個大白色區塊，內部再切分精緻子區塊
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs text-slate-900 space-y-7">
      {/* 區塊 1: 頂部標題與唯一一組主要操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700">{userProfile.companyName}</span>
            <span className="mx-1.5">·</span>
            <span>{userProfile.department}</span>
            <span className="mx-1.5">·</span>
            <span>申請人: {userProfile.name}</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            品牌計畫 AI工具費用核銷總覽
          </h1>
        </div>

        {/* 頁面唯一一組核心操作按鈕 */}
        <div className="flex items-center gap-3 shrink-0">
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

      {/* 區塊 2: 三大核心數據卡片 (簡約乾淨，移除重複資訊) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: AI 累計總支出 */}
        <div 
          onClick={onNavigateToExpenses}
          className="rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50/80 hover:border-indigo-300 p-5 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-indigo-900 font-bold">
            <span>1. AI 累計總支出</span>
            <span className="text-indigo-600 group-hover:underline transition-all flex items-center gap-0.5 text-[11px] font-bold">
              明細表 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-2.5 text-3xl font-black font-mono text-indigo-950 tabular-nums">
            {formatTWD(totalExpenseTWD)}
          </div>
          <div className="mt-1 text-[11px] text-indigo-700 font-medium">
            共計 <strong className="text-indigo-950 font-mono">{expenses.length} 筆</strong> 費用明細
          </div>
        </div>

        {/* Card 2: 已核銷金額 */}
        <div 
          onClick={onNavigateToOffsets}
          className="rounded-2xl border border-pink-100 bg-pink-50/50 hover:bg-pink-50/80 hover:border-pink-300 p-5 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-pink-900 font-bold">
            <span>2. 已核銷金額</span>
            <span className="text-pink-600 group-hover:underline transition-all flex items-center gap-0.5 text-[11px] font-bold">
              核銷明細 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-2.5 text-3xl font-black font-mono text-pink-600 tabular-nums">
            - {formatTWD(totalOffsetTWD)}
          </div>
          <div className="mt-1 text-[11px] text-pink-700 font-medium">
            計程車單抵充: <strong className="text-pink-700 font-mono">{formatTWD(taxiTotal)}</strong> ({taxiOffsets.length} 筆)
          </div>
        </div>

        {/* Card 3: 尚餘未核銷金額 (乾淨俐落) */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-purple-900 font-extrabold">
            <span>3. 尚餘未核銷金額</span>
            <span className="text-[10px] font-extrabold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-xs">
              待請款餘額
            </span>
          </div>
          <div className="mt-2.5 text-3xl sm:text-4xl font-black font-mono text-purple-950 tabular-nums">
            {formatTWD(netRemainingTWD)}
          </div>
        </div>
      </div>

      {/* 區塊 3: 兩大清單左右對照 (由新到舊排序) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* 左側子區塊: AI 支出清單 */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-extrabold text-slate-900">AI 工具與 API 支出清單</h2>
            </div>
            <button
              onClick={onNavigateToExpenses}
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>查看全部明細</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {sortedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-all flex items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-extrabold text-slate-900 truncate max-w-[220px]">
                    {expense.toolName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    <span className="font-mono font-bold text-indigo-700">{formatDate(expense.paymentDate)}</span> · {expense.paymentMethod}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-slate-900 font-mono tabular-nums text-sm">
                    {formatTWD(expense.amountTWD)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium">
                    {formatOriginalCurrency(expense.originalAmount, expense.currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側子區塊: 核銷紀錄清單 (由新到舊排序) */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-pink-600" />
              <h2 className="text-sm font-extrabold text-slate-900">核銷紀錄 (計程車單據抵充)</h2>
            </div>
            <button
              onClick={onNavigateToOffsets}
              className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer py-1 px-1.5"
            >
              <span>查看全部核銷</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {sortedOffsets.map((offset) => {
              const isTaxi = offset.offsetType === 'taxi';
              return (
                <div
                  key={offset.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-pink-200 transition-all flex items-center justify-between gap-3 text-xs shadow-xs group"
                >
                  <div 
                    onClick={() => onEditOffset ? onEditOffset(offset) : onNavigateToOffsets()}
                    className="space-y-0.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 truncate max-w-[200px] group-hover:text-pink-600 transition-colors">
                        {offset.title}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                        isTaxi 
                          ? 'bg-pink-50 text-pink-700 border-pink-200' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {isTaxi ? '車資單據' : '直接撥款'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      <span className="font-mono font-bold text-pink-700">{formatDate(offset.date)}</span> {offset.receiptProof ? `· ${offset.receiptProof}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-black text-pink-600 font-mono tabular-nums text-sm">
                        - {formatTWD(offset.amountTWD)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {onEditOffset && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditOffset(offset);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="編輯"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {onDeleteOffset && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`確定要刪除核銷記錄「${offset.title}」嗎？`)) {
                              onDeleteOffset(offset.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="刪除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
