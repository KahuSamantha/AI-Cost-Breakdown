import React from 'react';
import { Settings, Sparkles, Car, ReceiptText, LayoutDashboard } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentTab: 'dashboard' | 'expenses' | 'offsets';
  setCurrentTab: (tab: 'dashboard' | 'expenses' | 'offsets') => void;
  onOpenSettings: () => void;
  userProfile: UserProfile;
  offsetsTotal?: number;
  totalExpensesAmount?: number;
  syncStatus?: 'connecting' | 'connected' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSettings,
  userProfile,
  offsetsTotal = 2613,
  totalExpensesAmount = 9613,
  syncStatus = 'connected',
}) => {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-indigo-100/80 bg-white/90 backdrop-blur-xl shadow-xs">
      {/* Top Main Row */}
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Brand wordmark */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-xs">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="text-left group cursor-pointer focus:outline-none min-w-0"
          >
            <div className="text-xs sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              品牌計畫 AI工具費用核銷系統
            </div>
            <div className="text-[10px] text-slate-500 font-medium hidden md:block">
              台灣經濟研究院 · 品牌計畫
            </div>
          </button>
        </div>

        {/* Desktop Navigation (>= md screens) */}
        <nav className="hidden md:flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center gap-1.5 ${
              currentTab === 'dashboard'
                ? 'text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className={`h-4 w-4 ${currentTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <span>總覽儀表板</span>
          </button>

          <button
            onClick={() => setCurrentTab('expenses')}
            className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center gap-1.5 ${
              currentTab === 'expenses'
                ? 'text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ReceiptText className={`h-4 w-4 ${currentTab === 'expenses' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <span>AI 支出明細</span>
            <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-md font-mono ${
              currentTab === 'expenses' ? 'bg-indigo-200/80 text-indigo-900' : 'bg-slate-100 text-slate-600'
            }`}>
              NT$ {totalExpensesAmount.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('offsets')}
            className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center gap-1.5 ${
              currentTab === 'offsets'
                ? 'text-pink-700 bg-pink-50 border border-pink-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className={`h-4 w-4 ${currentTab === 'offsets' ? 'text-pink-600' : 'text-slate-500'}`} />
            <span>核銷紀錄</span>
            <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-md font-mono ${
              currentTab === 'offsets' ? 'bg-pink-200/80 text-pink-900' : 'bg-slate-100 text-slate-600'
            }`}>
              NT$ {offsetsTotal.toLocaleString()}
            </span>
          </button>
        </nav>

        {/* Right Settings & Sync status */}
        <div className="flex items-center gap-2 shrink-0">
          <div 
            title={syncStatus === 'connected' ? '雲端即時資料庫：多人多裝置同步中' : syncStatus === 'connecting' ? '連線同步中...' : '離線模式'}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-[11px] font-bold shadow-2xs ${
              syncStatus === 'connected'
                ? 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
                : syncStatus === 'connecting'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {syncStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                syncStatus === 'connected' 
                  ? 'bg-emerald-500' 
                  : syncStatus === 'connecting' 
                    ? 'bg-amber-500' 
                    : 'bg-slate-400'
              }`}></span>
            </span>
            <span className="hidden sm:inline">
              {syncStatus === 'connected' ? '雲端即時同步' : syncStatus === 'connecting' ? '同步連線中' : '本機模式'}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            title="系統設定"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-xs"
          >
            <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
              S
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-800">
              {userProfile.name}
            </span>
            <Settings className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (< md screens) - Fully responsive Segmented Control */}
      <div className="md:hidden border-t border-slate-100/90 px-2.5 py-1.5 bg-slate-50/90">
        <nav className="grid grid-cols-3 gap-1 p-0.5 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`py-1.5 px-1 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">總覽</span>
          </button>

          <button
            onClick={() => setCurrentTab('expenses')}
            className={`py-1.5 px-1 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
              currentTab === 'expenses'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ReceiptText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">AI 支出</span>
            <span className="font-mono text-[10px] text-indigo-900 bg-indigo-100/90 px-1 py-0.2 rounded font-bold">
              ${totalExpensesAmount.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('offsets')}
            className={`py-1.5 px-1 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
              currentTab === 'offsets'
                ? 'bg-white text-pink-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">車資核銷</span>
            <span className="font-mono text-[10px] text-pink-900 bg-pink-100/90 px-1 py-0.2 rounded font-bold">
              ${offsetsTotal.toLocaleString()}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
