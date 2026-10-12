import React, { useMemo } from 'react';
import { 
  CreditCard, 
  ArrowRight, 
  Plus, 
  FileCheck2,
  Edit3,
  Trash2,
  MapPin,
  Navigation,
  Car
} from 'lucide-react';
import { ExpenseRecord, ReimbursementOffset, UserProfile } from '../types';
import { formatTWD, formatDate } from '../utils/formatters';
import { KeyVisualHero } from './KeyVisualHero';

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
        {/* 區塊 1: 三大核心數據卡片 (全台幣，視覺質感提升) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: AI 累計總支出 */}
        <div 
          onClick={onNavigateToExpenses}
          className="rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50/80 hover:border-indigo-300 p-4 sm:p-5 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-indigo-900 font-bold">
            <span>1. AI 累計總支出 (NT$)</span>
            <span className="text-indigo-600 group-hover:underline transition-all flex items-center gap-0.5 text-[11px] font-bold">
              明細表 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-indigo-950 tabular-nums">
            {formatTWD(totalExpenseTWD)}
          </div>
          <div className="mt-1 text-[11px] text-indigo-700 font-medium">
            共計 <strong className="text-indigo-950 font-mono">{expenses.length} 筆</strong> 費用明細
          </div>
        </div>

        {/* Card 2: 已核銷金額 */}
        <div 
          onClick={onNavigateToOffsets}
          className="rounded-2xl border border-pink-100 bg-pink-50/50 hover:bg-pink-50/80 hover:border-pink-300 p-4 sm:p-5 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-pink-900 font-bold">
            <span>2. 已核銷金額 (NT$)</span>
            <span className="text-pink-600 group-hover:underline transition-all flex items-center gap-0.5 text-[11px] font-bold">
              核銷明細 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-pink-600 tabular-nums">
            - {formatTWD(totalOffsetTWD)}
          </div>
          <div className="mt-1 text-[11px] text-pink-700 font-medium truncate">
            計程車單抵充: <strong className="text-pink-700 font-mono">{formatTWD(taxiTotal)}</strong> ({taxiOffsets.length} 筆)
          </div>
        </div>

        {/* Card 3: 尚餘未核銷金額 */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-purple-900 font-extrabold">
            <span>3. 尚餘未核銷金額 (NT$)</span>
            <span className="text-[10px] font-extrabold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-xs">
              待請款餘額
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-purple-950 tabular-nums">
            {formatTWD(netRemainingTWD)}
          </div>
          <div className="mt-1 text-[11px] text-purple-700 font-medium">
            待向財務請款或以車資抵充之淨額
          </div>
        </div>
      </div>

      {/* 區塊 3: 兩大清單左右對照 (由新到舊排序) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-1">
        {/* 左側子區塊: AI 支出清單 */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3.5 sm:p-5 space-y-3 sm:space-y-4">
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

          <div className="space-y-2.5">
            {sortedExpenses.slice(0, 6).map((expense) => (
              <div
                key={expense.id}
                className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-all flex items-center justify-between gap-2.5 text-xs shadow-xs"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="font-extrabold text-slate-900 truncate">
                    {expense.toolName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    <span className="font-mono font-bold text-indigo-700">{formatDate(expense.paymentDate)}</span> · {expense.paymentMethod}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-slate-900 font-mono tabular-nums text-sm sm:text-base">
                    {formatTWD(expense.amountTWD)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側子區塊: 核銷紀錄清單 (顯示 起始地點 → 到達地點) */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3.5 sm:p-5 space-y-3 sm:space-y-4">
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

          <div className="space-y-2.5">
            {sortedOffsets.slice(0, 6).map((offset) => {
              const isTaxi = offset.offsetType === 'taxi';
              return (
                <div
                  key={offset.id}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-pink-200 transition-all text-xs shadow-xs group space-y-2"
                >
                  {/* Top Line: Title & Tag on Left, Amount & Actions on Right */}
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      onClick={() => onEditOffset ? onEditOffset(offset) : onNavigateToOffsets()}
                      className="cursor-pointer min-w-0 flex-1"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 group-hover:text-pink-600 transition-colors break-words">
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
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="font-black text-pink-600 font-mono tabular-nums text-sm sm:text-base">
                        - {formatTWD(offset.amountTWD)}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {onEditOffset && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditOffset(offset);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
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
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="刪除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Line: Date + Clean Route Badge */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 border-t border-slate-100">
                    <span className="font-mono font-bold text-pink-700 shrink-0">{formatDate(offset.date)}</span>
                    {(offset.origin || offset.destination) && (
                      <div className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100/90 border border-slate-200/60 px-2 py-0.5 rounded-md text-[10px] font-medium max-w-full flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-pink-500 shrink-0" />
                          <span>{offset.origin || '出發地'}</span>
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="inline-flex items-center gap-1">
                          <Navigation className="h-2.5 w-2.5 text-indigo-500 shrink-0" />
                          <span>{offset.destination || '目的地'}</span>
                        </span>
                      </div>
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
