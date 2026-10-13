import React, { useState } from 'react';
import { X, Download, Upload, RefreshCw, Check, Trash2, Cloud, Database } from 'lucide-react';
import { UserProfile, ExpenseRecord, ReimbursementBatch, ReimbursementOffset } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  expenses: ExpenseRecord[];
  batches: ReimbursementBatch[];
  offsets: ReimbursementOffset[];
  onImportAllData: (data: {
    expenses: ExpenseRecord[];
    batches: ReimbursementBatch[];
    profile: UserProfile;
    offsets?: ReimbursementOffset[];
  }) => void;
  onResetData: () => void;
  onClearAllEmpty?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  expenses,
  batches,
  offsets,
  onImportAllData,
  onResetData,
  onClearAllEmpty,
}) => {
  if (!isOpen) return null;

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevEnv = hostname.includes('ais-dev');
  const isProdEnv = hostname.includes('ais-pre') || hostname.includes('vercel.app');

  // Export JSON backup
  const handleExportJSON = () => {
    const backup = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      profile: userProfile,
      expenses,
      batches,
      offsets,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI費用紀錄備份_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.expenses) {
          onImportAllData({
            expenses: parsed.expenses,
            batches: parsed.batches || [],
            profile: parsed.profile || userProfile,
            offsets: parsed.offsets || [],
          });
          alert('資料備份已成功還原並同步！');
          onClose();
        } else {
          alert('備份檔案格式不正確，找不到 expenses 資料');
        }
      } catch (err) {
        alert('解析 JSON 檔案失敗，請檢查格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Cloud className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">雲端同步與資料備份</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI 工具費用紀錄 · 多人即時協作狀態
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* 雲端即時同步協作說明卡 */}
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                雲端資料庫已連線 (多人即時協作)：
              </span>
              <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                即時同步中
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              所有人開啟 <strong>https://ai-cost-breakdown.vercel.app/</strong> 都能看到完全相同的即時數據。無論使用手機或電腦，新增、修改或刪除費用紀錄皆會即時同步給所有同仁。
            </p>
          </div>

          {/* 目前資料統計 */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 text-[11px] block">目前 AI 支出筆數</span>
              <span className="text-base font-black text-indigo-700 font-mono">{expenses.length} 筆</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">外勤車資抵充筆數</span>
              <span className="text-base font-black text-pink-700 font-mono">{offsets.length} 筆</span>
            </div>
          </div>

          {/* 資料備份與還原 */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-indigo-600" />
              <span>資料備份與手動還原</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              您可以隨時將所有費用明細匯出為 JSON 備份檔留存，或匯入先前建立的備份檔：
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold transition-all cursor-pointer shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>匯出完整備份 (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold transition-all cursor-pointer shadow-xs">
                <Upload className="h-3.5 w-3.5" />
                <span>匯入備份還原</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 清除與重設按鈕：嚴格僅限開發測試端 (ais-dev) */}
          {isDevEnv ? (
            <div className="pt-3 border-t border-red-100 space-y-2">
              <span className="text-xs font-bold text-red-600 block">
                開發端測試除錯選項 (僅 ais-dev 可見)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('確定重設為初始示範資料？')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>重設示範資料</span>
                </button>
                {onClearAllEmpty && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('【測試端清空】確定要清空測試資料嗎？')) {
                        onClearAllEmpty();
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>清空開發端資料</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>🔒 上線協作安全保護：正式端已關閉清空功能，保護團隊資料安全。</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer text-xs"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
