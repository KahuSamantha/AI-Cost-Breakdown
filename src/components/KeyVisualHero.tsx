import React from 'react';
import { 
  Plus, 
  ArrowRight, 
  Car, 
  TrendingUp 
} from 'lucide-react';
import { UserProfile } from '../types';
import { formatTWD } from '../utils/formatters';

interface KeyVisualHeroProps {
  userProfile: UserProfile;
  totalExpensesAmount: number;
  totalOffsetsAmount: number;
  onOpenNewExpense: () => void;
  onOpenNewOffset: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToOffsets: () => void;
}

export const KeyVisualHero: React.FC<KeyVisualHeroProps> = ({
  userProfile,
  totalExpensesAmount,
  totalOffsetsAmount,
  onOpenNewExpense,
  onOpenNewOffset,
  onNavigateToExpenses,
  onNavigateToOffsets,
}) => {
  const netRemaining = Math.max(0, totalExpensesAmount - totalOffsetsAmount);
  const offsetPercentage = totalExpensesAmount > 0 
    ? Math.min(100, Math.round((totalOffsetsAmount / totalExpensesAmount) * 100))
    : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl key-visual-banner border border-indigo-500/30 text-white shadow-xl shadow-indigo-950/20 mb-8">
      {/* Decorative SVG Geometric Mesh / Tech Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(165, 180, 252, 0.4)" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1.5" fill="rgba(165, 180, 252, 0.8)" />
            </pattern>
            <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
          {/* Ambient Curved Waves */}
          <path
            d="M -100 220 C 300 120, 600 320, 1100 160 C 1400 60, 1800 240, 2100 150"
            fill="none"
            stroke="url(#glow-grad)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />
        </svg>
      </div>

      {/* Ambient Glowing Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-12 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding, Title, and Description */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Brand Tag with glowing dot */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{userProfile.companyName} · 品牌計畫</span>
              </div>
            </div>

            {/* Main Key Visual Headline */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                品牌計畫 AI 工具費用核銷系統
              </h1>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onOpenNewExpense}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-indigo-50 rounded-xl transition-all cursor-pointer shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-98"
              >
                <Plus className="h-4 w-4 text-indigo-600" />
                <span>記一筆 AI 支出</span>
              </button>

              <button
                onClick={onOpenNewOffset}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-pink-200 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 rounded-xl transition-all cursor-pointer backdrop-blur-md active:scale-98"
              >
                <Car className="h-4 w-4 text-pink-400" />
                <span>新增車資核銷紀錄</span>
              </button>
            </div>
          </div>

          {/* Right Column: Key Visual Interactive Stats Badge */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300">當前核銷動態</div>
                    <div className="text-[11px] text-slate-400">{userProfile.name} 經辦備查</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/30">
                    抵充達成率 {offsetPercentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>車資抵充進度</span>
                  <span className="font-mono">{formatTWD(totalOffsetsAmount)} / {formatTWD(totalExpensesAmount)}</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${offsetPercentage}%` }}
                  />
                </div>
              </div>

              {/* 3 Metric Cards inside the visual banner */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {/* AI 累計支出 */}
                <button
                  onClick={onNavigateToExpenses}
                  className="text-left rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 transition-colors cursor-pointer group"
                >
                  <div className="text-[11px] text-indigo-200 flex items-center justify-between">
                    <span>AI 累計支出</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                    {formatTWD(totalExpensesAmount)}
                  </div>
                </button>

                {/* 累計已抵充 */}
                <button
                  onClick={onNavigateToOffsets}
                  className="text-left rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 transition-colors cursor-pointer group"
                >
                  <div className="text-[11px] text-pink-200 flex items-center justify-between">
                    <span>累計已抵充車資</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-pink-300 font-mono mt-0.5">
                    {formatTWD(totalOffsetsAmount)}
                  </div>
                </button>
              </div>

              {/* Net Balance Callout */}
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-emerald-200">待請款淨額 (未抵充餘額)</div>
                  <div className="text-xs text-slate-300">可一鍵產出請款報表供會計核銷</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-300 font-mono">
                    {formatTWD(netRemaining)}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
