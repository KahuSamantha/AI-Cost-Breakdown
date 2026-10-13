import React, { useState } from 'react';
import { X, Save, Download, Upload, RefreshCw, User, Building, Landmark, Check, Trash2, ShieldCheck } from 'lucide-react';
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
  onSaveProfile,
  expenses,
  batches,
  offsets,
  onImportAllData,
  onResetData,
  onClearAllEmpty,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevEnv = hostname.includes('ais-dev');
  const isProdEnv = hostname.includes('ais-pre');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const backup = {
      version: '2.1',
      exportDate: new Date().toISOString(),
      profile,
      expenses,
      batches,
      offsets,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `品牌計畫_AI核銷系統備份_${new Date().toISOString().slice(0, 10)}.json`;
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
        if (parsed.expenses && parsed.profile) {
          onImportAllData({
            expenses: parsed.expenses,
            batches: parsed.batches || [],
            profile: parsed.profile,
            offsets: parsed.offsets || [],
          });
          alert('資料備份已成功還原！');
          onClose();
        } else {
          alert('備份檔案格式不正確，找不到 expenses 或 profile');
        }
      } catch (err) {
        alert('解析 JSON 檔案失敗，請檢查格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">品牌計畫核銷系統設定</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              台灣經濟研究院 Samantha 帳號與抬頭設定
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {/* Section 1: Applicant Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-wider text-xs">
              <User className="h-4 w-4 text-indigo-600" />
              <span>1. 申請人基本資料</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">申請人姓名</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">所屬部門</label>
                <input
                  type="text"
                  required
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">員工編號 (選填)</label>
                <input
                  type="text"
                  value={profile.employeeId}
                  onChange={(e) => setProfile({ ...profile, employeeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                預設代墊付款方式 / 卡別
              </label>
              <input
                type="text"
                placeholder="例如: 國泰 CUBE 卡 (末四碼 6821)"
                value={profile.defaultPaymentMethod}
                onChange={(e) => setProfile({ ...profile, defaultPaymentMethod: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Section 2: Company Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-wider text-xs">
              <Building className="h-4 w-4 text-indigo-600" />
              <span>2. 公司抬頭與統一編號</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">公司名稱 (抬頭)</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">公司統一編號</label>
                <input
                  type="text"
                  value={profile.companyTaxId}
                  onChange={(e) => setProfile({ ...profile, companyTaxId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Backup, Sync & Reset */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="font-black text-slate-900 uppercase tracking-wider text-xs">
              3. 資料備份、跨環境同步與清除
            </div>

            {/* 安全隔離保障提示卡 */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  目前連線環境：
                </span>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                  isDevEnv 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : isProdEnv 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  {isDevEnv ? '🧪 開發測試端 (ais-dev)' : isProdEnv ? '🚀 上線正式端 (ais-pre)' : '本機環境'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                🛡️ <strong>跨環境安全隔離保障：</strong>瀏覽器同源安全性規範嚴格隔離不同網址，您在此環境執行的任何「清空」或「重設」動作，<strong>絕對不會影響到另一個網域或上線版之數據</strong>。
              </p>
            </div>

            {/* 雲端即時同步協作提示 */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Firebase 雲端資料庫即時同步：
                </span>
                <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                  多人多裝置即時同步已啟用
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                📱💻 <strong>跨裝置協作：</strong>您與同仁無論使用手機或電腦開啟此連結，所有新增、修改的核銷與支出資料皆會<strong>秒級即時同步</strong>。
              </p>
            </div>

            <p className="text-slate-500">
              您可以將目前的全部報銷紀錄與設定匯出為 JSON 備份，或自檔案還原：
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 cursor-pointer transition-colors font-bold"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600" />
                <span>匯出完整備份 (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 cursor-pointer transition-colors font-bold">
                <Upload className="h-3.5 w-3.5 text-indigo-600" />
                <span>匯入備份檔案</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              {/* 上線端絕不顯示清空按鈕，僅開發端允許清除開發測試數據 */}
              {!isProdEnv && onClearAllEmpty && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `確定要清空目前開發端的所有支出與核銷資料嗎？\n\n注意：上線版 (ais-pre) 的資料完全獨立不受任何影響。`
                      )
                    ) {
                      onClearAllEmpty();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer transition-colors font-bold"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>清空開發端所有紀錄 (清為0筆)</span>
                </button>
              )}

              {!isProdEnv && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `確定要將目前開發端重設為系統初始範例資料嗎？\n\n注意：上線版 (ais-pre) 的資料完全獨立不受任何影響。`
                      )
                    ) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors font-bold"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                  <span>重設為初始範例資料</span>
                </button>
              )}

              {isProdEnv && (
                <div className="w-full text-[11px] text-slate-400 italic pt-1">
                  🔒 上線正式環境為確保同仁協作資料安全，已關閉清空與重設按鈕。
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer font-bold"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>已儲存</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>儲存設定</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
