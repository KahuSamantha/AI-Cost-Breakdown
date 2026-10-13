import React, { useMemo } from 'react';
import { 
  CreditCard, 
  ArrowRight, 
  FileCheck2,
  MapPin,
  Navigation
} from 'lucide-react';
import { ExpenseRecord, ReimbursementOffset, UserProfile } from '../types';
import { formatTWD, formatDate } from '../utils/formatters';
import { CATEGORY_LABELS } from '../data/presets';
import { KeyVisualHero } from './KeyVisualHero';

interface DashboardViewProps {
  expenses: ExpenseRecord[];
  offsets: ReimbursementOffset[];
  userProfile: UserProfile;
  onNavigateToExpenses: () => void;
  onNavigateToOffsets: () => void;
  onOpenNewExpense?: () => void;
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

  // Key numbers: AI Expenses & Offsets (All in TWD)
  const totalExpenseTWD = expenses.reduce((sum, e) => sum + e.amountTWD, 0);
  const taxiOffsets = offsets.filter((o) => o.offsetType === 'taxi');
  const accountingOffsets = offsets.filter((o) => o.offsetType !== 'taxi');
  const taxiTotal = taxiOffsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const accountingTotal = accountingOffsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const totalOffsetTWD = taxiTotal + accountingTotal;

  // Remaining Unreimbursed Balance
  const netRemainingTWD = Math.max(0, totalExpenseTWD - totalOffsetTWD);

  return (
    <div className="space-y-6">
      {/* 頂部主視覺背景看板 (Key Visual Hero Banner) */}
      <KeyVisualHero
        userProfile={userProfile}
        totalExpensesAmount={totalExpenseTWD}
        totalOffsetsAmount={totalOffsetTWD}
        onOpenNewExpense={onOpenNewExpense}
        onOpenNewOffset={onOpenNewOffset || onNavigateToOffsets}
        onNavigateToExpenses={onNavigateToExpenses}
        onNavigateToOffsets={onNavigateToOffsets}
      />

      {/* 核心數據與最新明細卡片容器 */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-3.5 sm:p-6 lg:p-8 shadow-sm text-slate-900 space-y-5 sm:space-y-7">
        {/* 兩大清單左右對照 (由新到舊排序) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 左側子區塊: AI 支出清單 */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3.5 sm:p-5 space-y-3 sm:space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-600 shrink-0" />
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">AI 工具與 API 支出清單</h2>
            </div>
            <button
              onClick={onNavigateToExpenses}
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>查看全部</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-between">
            {sortedExpenses.slice(0, 6).map((expense) => (
              <div
                key={expense.id}
                onClick={onNavigateToExpenses}
                className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all text-xs shadow-xs flex flex-col justify-between h-[74px] sm:h-[76px] cursor-pointer group"
              >
                {/* Top line: Tool name + category tag on left, amount on right */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {expense.toolName}
                    </span>
                    {expense.toolCategory && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 bg-indigo-50 text-indigo-700 border-indigo-200 truncate">
                        {CATEGORY_LABELS[expense.toolCategory] || expense.toolCategory}
                      </span>
                    )}
                  </div>
                  <div className="font-black text-slate-900 font-mono tabular-nums text-sm sm:text-base shrink-0">
                    {formatTWD(expense.amountTWD)}
                  </div>
                </div>

                {/* Bottom line: Date · Payment method */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-100 min-w-0">
                  <span className="font-mono font-bold text-indigo-700 shrink-0">
                    {formatDate(expense.paymentDate)}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="truncate">
                    {expense.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側子區塊: 核銷紀錄清單 (與左側高度、內距與結構完全對齊，無編輯/刪除按鈕) */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3.5 sm:p-5 space-y-3 sm:space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-pink-600 shrink-0" />
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">核銷紀錄 (計程車外勤抵充)</h2>
            </div>
            <button
              onClick={onNavigateToOffsets}
              className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer py-1 px-1.5 shrink-0"
            >
              <span>查看全部</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-between">
            {sortedOffsets.slice(0, 6).map((offset) => {
              const isTaxi = offset.offsetType === 'taxi';
              return (
                <div
                  key={offset.id}
                  onClick={onNavigateToOffsets}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-pink-300 transition-all text-xs shadow-xs flex flex-col justify-between h-[74px] sm:h-[76px] cursor-pointer group"
                >
                  {/* Top line: Title + tag on left, amount on right (無編輯與刪除按鈕) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-extrabold text-slate-900 group-hover:text-pink-600 transition-colors break-words truncate">
                        {offset.title}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${
                        isTaxi 
                          ? 'bg-pink-50 text-pink-700 border-pink-200' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {isTaxi ? '車資單據' : '直接撥款'}
                      </span>
                    </div>
                    <div className="font-black text-pink-600 font-mono tabular-nums text-sm sm:text-base shrink-0">
                      - {formatTWD(offset.amountTWD)}
                    </div>
                  </div>

                  {/* Bottom line: Date · Route badge or note */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-100 min-w-0">
                    <span className="font-mono font-bold text-pink-700 shrink-0">
                      {formatDate(offset.date)}
                    </span>
                    <span className="text-slate-300">·</span>
                    {(offset.origin || offset.destination) ? (
                      <span className="truncate text-slate-700 font-medium">
                        {offset.origin || '出發地'} → {offset.destination || '目的地'}
                      </span>
                    ) : (
                      <span className="truncate text-slate-500">
                        {offset.notes || (isTaxi ? '計程車外勤單據' : '會計撥款核銷')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
