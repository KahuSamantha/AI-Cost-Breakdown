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
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSettings,
  userProfile,
  offsetsTotal = 2613,
  totalExpensesAmount = 9613,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              品牌計畫 AI工具費用核銷系統
            </div>
            <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
              台灣經濟研究院 · 品牌計畫
            </div>
          </button>
        </div>

        {/* 3 Core Clean Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
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
            <span className={`hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-md font-mono ${
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
            <span className={`hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-md font-mono ${
              currentTab === 'offsets' ? 'bg-pink-200/80 text-pink-900' : 'bg-slate-100 text-slate-600'
            }`}>
              NT$ {offsetsTotal.toLocaleString()}
            </span>
          </button>
        </nav>

        {/* Right Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            title="系統設定"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-xs"
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
    </header>
  );
};
