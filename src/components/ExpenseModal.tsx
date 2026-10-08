import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, FileText, Check, DollarSign, Calculator, Download, Eye, Image as ImageIcon } from 'lucide-react';
import { ExpenseRecord, Currency, BillingType, ToolCategory, TaxIdStatus, UserProfile } from '../types';
import { AI_TOOL_PRESETS, CATEGORY_LABELS, BILLING_TYPE_LABELS } from '../data/presets';
import { calculateExpenseAmounts, formatTWD } from '../utils/formatters';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editingExpense?: ExpenseRecord | null;
  userProfile: UserProfile;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  userProfile,
}) => {
  const [toolName, setToolName] = useState('');
  const [toolCategory, setToolCategory] = useState<ToolCategory>('chat_assistant');
  const [billingType, setBillingType] = useState<BillingType>('monthly_subscription');
  const [projectName, setProjectName] = useState('');
  const [department, setDepartment] = useState(userProfile.department);
  const [paidByName, setPaidByName] = useState(userProfile.name);
  const [paymentMethod, setPaymentMethod] = useState(userProfile.defaultPaymentMethod);
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  // Currency & calculation
  const [currency, setCurrency] = useState<Currency>('USD');
  const [originalAmount, setOriginalAmount] = useState<number>(20);
  const [exchangeRate, setExchangeRate] = useState<number>(userProfile.defaultExchangeRateUSD || 32.2);
  const [hasForeignFee, setHasForeignFee] = useState<boolean>(true);
  const [foreignFeeRate, setForeignFeeRate] = useState<number>(0.015);
  const [isCustomAmountTWD, setIsCustomAmountTWD] = useState<boolean>(false);
  const [customAmountTWD, setCustomAmountTWD] = useState<number>(0);

  // Invoice & Receipt
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [taxIdStatus, setTaxIdStatus] = useState<TaxIdStatus>('personal_receipt');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [receiptName, setReceiptName] = useState<string | undefined>(undefined);

  // Reset or populate form
  useEffect(() => {
    if (editingExpense) {
      setToolName(editingExpense.toolName);
      setToolCategory(editingExpense.toolCategory);
      setBillingType(editingExpense.billingType);
      setProjectName(editingExpense.projectName || '');
      setDepartment(editingExpense.department || userProfile.department);
      setPaidByName(editingExpense.paidByName);
      setPaymentMethod(editingExpense.paymentMethod);
      setAccountIdentifier(editingExpense.accountIdentifier || '');
      setPaymentDate(editingExpense.paymentDate);
      setCurrency(editingExpense.currency);
      setOriginalAmount(editingExpense.originalAmount);
      setExchangeRate(editingExpense.exchangeRate);
      setHasForeignFee(editingExpense.hasForeignFee);
      setForeignFeeRate(editingExpense.foreignFeeRate);
      setInvoiceNumber(editingExpense.invoiceNumber || '');
      setTaxIdStatus(editingExpense.taxIdStatus);
      setReceiptUrl(editingExpense.receiptUrl);
      setReceiptName(editingExpense.receiptName);
      setCustomAmountTWD(editingExpense.amountTWD);
      setIsCustomAmountTWD(true);
    } else {
      setToolName('');
      setToolCategory('chat_assistant');
      setBillingType('monthly_subscription');
      setProjectName('品牌計畫');
      setDepartment(userProfile.department);
      setPaidByName(userProfile.name);
      setPaymentMethod(userProfile.defaultPaymentMethod);
      setAccountIdentifier('samantha@tier.org.tw');
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setCurrency('USD');
      setOriginalAmount(20);
      setExchangeRate(userProfile.defaultExchangeRateUSD || 32.2);
      setHasForeignFee(true);
      setForeignFeeRate(0.015);
      setIsCustomAmountTWD(false);
      setCustomAmountTWD(0);
      setInvoiceNumber('');
      setTaxIdStatus('personal_receipt');
      setReceiptUrl(undefined);
      setReceiptName(undefined);
    }
  }, [editingExpense, isOpen, userProfile]);

  if (!isOpen) return null;

  // Real-time calculation
  const calculated = calculateExpenseAmounts(
    Number(originalAmount) || 0,
    Number(exchangeRate) || 1,
    hasForeignFee,
    Number(foreignFeeRate) || 0.015
  );
  const subtotalTWD = calculated.subtotalTWD;
  const foreignFeeTWD = calculated.foreignFeeTWD;
  const autoTotalTWD = calculated.amountTWD;
  const finalAmountTWD = isCustomAmountTWD ? Number(customAmountTWD) || 0 : autoTotalTWD;

  // Preset selector handler
  const handleApplyPreset = (preset: typeof AI_TOOL_PRESETS[0]) => {
    setToolName(preset.name);
    setToolCategory(preset.category);
    setBillingType(preset.billingType);
    setCurrency(preset.defaultCurrency);
    setOriginalAmount(preset.typicalAmount);
    if (preset.defaultCurrency === 'TWD') {
      setHasForeignFee(false);
      setExchangeRate(1.0);
    } else {
      setHasForeignFee(true);
      setExchangeRate(userProfile.defaultExchangeRateUSD || 32.2);
    }
    setIsCustomAmountTWD(false);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('檔案大小不能超過 5MB');
        return;
      }
      setReceiptName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim()) {
      alert('請輸入 AI 工具名稱');
      return;
    }
    if (finalAmountTWD <= 0) {
      alert('實支台幣金額必須大於 0');
      return;
    }

    onSave(
      {
        toolName: toolName.trim(),
        toolCategory,
        billingType,
        projectName: projectName.trim(),
        department: department.trim(),
        description: editingExpense?.description || '',
        paidByName,
        paymentMethod,
        accountIdentifier,
        paymentDate,
        currency,
        originalAmount: Number(originalAmount),
        exchangeRate: Number(exchangeRate),
        hasForeignFee,
        foreignFeeRate: Number(foreignFeeRate),
        subtotalTWD,
        foreignFeeTWD,
        amountTWD: finalAmountTWD,
        invoiceNumber,
        taxIdStatus,
        receiptUrl,
        receiptName,
        reimbursementStatus: editingExpense?.reimbursementStatus || 'draft',
      },
      editingExpense?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl my-8 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {editingExpense ? '編輯 AI 支出紀錄' : '新增 AI 支出紀錄'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              登記訂閱或 API 扣款，自動換算匯率與海外交易手續費
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Quick AI Presets */}
          {!editingExpense && (
            <div className="space-y-2 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>常用 AI 工具快速套用</span>
                </span>
                <span className="text-slate-400">點擊即自動填入預設金額</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AI_TOOL_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {preset.name.split(' ')[0]} ${preset.typicalAmount}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Tool Basics */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  AI 工具/服務名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: OpenAI API, Cursor Pro, Claude Pro..."
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">工具類別</label>
                <select
                  value={toolCategory}
                  onChange={(e) => setToolCategory(e.target.value as ToolCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer font-medium"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">扣款日期</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">付款卡別 / 支付方式</label>
                <input
                  type="text"
                  placeholder="例如 國泰 CUBE 卡 (6821)"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">歸屬專案名稱</label>
                <input
                  type="text"
                  placeholder="例如: 企業級 AI 知識庫與研發專案"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">代墊人員</label>
                <input
                  type="text"
                  value={paidByName}
                  onChange={(e) => setPaidByName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Amounts & Calculation */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              幣別、匯率與金額計算
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">原幣幣別</label>
                <select
                  value={currency}
                  onChange={(e) => {
                    const c = e.target.value as Currency;
                    setCurrency(c);
                    if (c === 'TWD') {
                      setExchangeRate(1.0);
                      setHasForeignFee(false);
                    } else if (c === 'USD') {
                      setExchangeRate(userProfile.defaultExchangeRateUSD || 32.2);
                      setHasForeignFee(true);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium cursor-pointer"
                >
                  <option value="USD">USD (美元)</option>
                  <option value="TWD">TWD (新台幣)</option>
                  <option value="EUR">EUR (歐元)</option>
                  <option value="JPY">JPY (日圓)</option>
                  <option value="GBP">GBP (英鎊)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  原幣扣款金額 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={originalAmount}
                  onChange={(e) => {
                    setOriginalAmount(parseFloat(e.target.value) || 0);
                    setIsCustomAmountTWD(false);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">折算匯率</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={currency === 'TWD'}
                  value={exchangeRate}
                  onChange={(e) => {
                    setExchangeRate(parseFloat(e.target.value) || 1);
                    setIsCustomAmountTWD(false);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono disabled:opacity-50"
                />
              </div>
            </div>

            {/* Foreign transaction fee checkbox */}
            {currency !== 'TWD' && (
              <div className="flex items-center gap-2 pt-1 text-slate-700">
                <input
                  type="checkbox"
                  id="foreignFee"
                  checked={hasForeignFee}
                  onChange={(e) => {
                    setHasForeignFee(e.target.checked);
                    setIsCustomAmountTWD(false);
                  }}
                  className="h-4 w-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="foreignFee" className="cursor-pointer font-medium">
                  加計信用卡海外交易手續費 1.5% (+ NT$ {foreignFeeTWD})
                </label>
              </div>
            )}

            {/* Calculation summary block */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-slate-600 block">實付台幣試算總額</span>
                <span className="text-xs text-slate-500 font-mono">
                  本金 {originalAmount} {currency} × {exchangeRate}
                  {hasForeignFee && ` + 手續費 ${foreignFeeTWD} 元`}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-indigo-950 tabular-nums">
                  {formatTWD(finalAmountTWD)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Receipt upload */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              發票與憑證檔案 (選填)
            </h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                  <Upload className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{receiptName ? '重新上傳憑證檔案' : '上傳水單/收據檔案'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {receiptName && (
                  <span className="text-xs text-slate-700 flex items-center gap-1.5 truncate max-w-xs font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <FileText className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{receiptName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptUrl(undefined);
                        setReceiptName(undefined);
                      }}
                      className="ml-1 text-slate-400 hover:text-rose-500 font-bold p-0.5"
                      title="移除檔案"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              {/* Instant in-modal preview thumbnail if file selected */}
              {receiptUrl && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {receiptUrl.startsWith('data:image/') || receiptName?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                      <img
                        src={receiptUrl}
                        alt="Preview"
                        className="h-14 w-14 object-cover rounded-lg border border-slate-200 bg-white"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <FileText className="h-7 w-7" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{receiptName || '憑證附件'}</div>
                      <div className="text-[11px] text-emerald-600 font-medium">✓ 已上傳就緒，送出後即可在明細中預覽與下載</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = receiptUrl;
                        link.download = receiptName || '憑證檔案';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      下載
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 rounded-xl transition-all cursor-pointer shadow-md"
            >
              {editingExpense ? '儲存變更' : '確認登記支出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
