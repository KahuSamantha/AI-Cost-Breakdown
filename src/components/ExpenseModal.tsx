import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, FileText, Check, Download, Trash2, DollarSign } from 'lucide-react';
import { ExpenseRecord, BillingType, ToolCategory, TaxIdStatus, UserProfile } from '../types';
import { AI_TOOL_PRESETS, CATEGORY_LABELS } from '../data/presets';
import { formatTWD } from '../utils/formatters';

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
  const [department, setDepartment] = useState(userProfile.department);
  const [paidByName, setPaidByName] = useState(userProfile.name);
  const [paymentMethod, setPaymentMethod] = useState(userProfile.defaultPaymentMethod);
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  // 金額 (皆以台幣計算)
  const [amountTWD, setAmountTWD] = useState<number | ''>(660);

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
      setDepartment(editingExpense.department || userProfile.department);
      setPaidByName(editingExpense.paidByName);
      setPaymentMethod(editingExpense.paymentMethod);
      setAccountIdentifier(editingExpense.accountIdentifier || '');
      setPaymentDate(editingExpense.paymentDate);
      setAmountTWD(editingExpense.amountTWD);
      setInvoiceNumber(editingExpense.invoiceNumber || '');
      setTaxIdStatus(editingExpense.taxIdStatus);
      setReceiptUrl(editingExpense.receiptUrl);
      setReceiptName(editingExpense.receiptName);
    } else {
      setToolName('');
      setToolCategory('chat_assistant');
      setBillingType('monthly_subscription');
      setDepartment(userProfile.department);
      setPaidByName(userProfile.name);
      setPaymentMethod(userProfile.defaultPaymentMethod);
      setAccountIdentifier('samantha@tier.org.tw');
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setAmountTWD(660);
      setInvoiceNumber('');
      setTaxIdStatus('personal_receipt');
      setReceiptUrl(undefined);
      setReceiptName(undefined);
    }
  }, [editingExpense, isOpen, userProfile]);

  if (!isOpen) return null;

  // Preset selector handler
  const handleApplyPreset = (preset: typeof AI_TOOL_PRESETS[0]) => {
    setToolName(preset.name);
    setToolCategory(preset.category);
    setBillingType(preset.billingType);
    setAmountTWD(preset.defaultAmountTWD);
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
    const finalAmount = Number(amountTWD) || 0;
    if (finalAmount <= 0) {
      alert('支出金額 (台幣) 必須大於 0');
      return;
    }

    onSave(
      {
        toolName: toolName.trim(),
        toolCategory,
        billingType,
        department: department.trim(),
        paidByName,
        paymentMethod,
        accountIdentifier,
        paymentDate,
        amountTWD: Math.round(finalAmount),
        currency: 'TWD',
        originalAmount: Math.round(finalAmount),
        exchangeRate: 1,
        hasForeignFee: false,
        foreignFeeRate: 0,
        foreignFeeTWD: 0,
        subtotalTWD: Math.round(finalAmount),
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
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl my-8 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {editingExpense ? '編輯 AI 支出紀錄' : '新增 AI 支出紀錄'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              以新台幣 (NT$) 直接計算，免去外幣匯率換算
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto text-xs">
          {/* Quick AI Presets */}
          {!editingExpense && (
            <div className="space-y-2 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>常用 AI 工具快速套用 (台幣 NT$)</span>
                </span>
                <span className="text-slate-400 text-[11px]">點選即填入</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AI_TOOL_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {preset.name.split(' ')[0]} NT${preset.defaultAmountTWD.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Tool Basics */}
          <div className="space-y-3.5">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">工具類別</label>
                <select
                  value={toolCategory}
                  onChange={(e) => setToolCategory(e.target.value as ToolCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer font-medium"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct Amount (TWD) */}
            <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4">
              <label className="block text-indigo-950 font-black mb-1.5 text-xs flex items-center justify-between">
                <span>
                  支出金額 (新台幣 NT$) <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] text-indigo-600 font-normal">全台幣記帳，無須匯率折算</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  NT$
                </div>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="例如: 660"
                  value={amountTWD}
                  onChange={(e) => setAmountTWD(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full bg-white border border-indigo-200 rounded-xl pl-12 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 font-mono font-black text-lg tabular-nums shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">扣款日期 <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">付款卡別 / 支付方式</label>
                <input
                  type="text"
                  placeholder="例如: 國泰 CUBE 卡 (6821)"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">代墊人員</label>
                <input
                  type="text"
                  value={paidByName}
                  onChange={(e) => setPaidByName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">服務帳號 / Email</label>
                <input
                  type="text"
                  placeholder="samantha@tier.org.tw"
                  value={accountIdentifier}
                  onChange={(e) => setAccountIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Invoice & Receipt */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              發票與憑證上傳 (選填)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">發票 / 訂單收據號碼</label>
                <input
                  type="text"
                  placeholder="例如: INV-CLAUDE-0915"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">憑證格式 / 統編註記</label>
                <select
                  value={taxIdStatus}
                  onChange={(e) => setTaxIdStatus(e.target.value as TaxIdStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer font-medium"
                >
                  <option value="personal_receipt">個人電子收據 / 海外水單</option>
                  <option value="with_tax_id">具公司統一編號發票</option>
                  <option value="no_tax_id">一般免用統一發票收據</option>
                </select>
              </div>
            </div>

            {/* Receipt upload */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer shadow-xs">
                  <Upload className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{receiptName ? '重新上傳憑證' : '上傳憑證水單 (圖片/PDF)'}</span>
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
                      className="ml-1 text-slate-400 hover:text-rose-500 font-bold p-0.5 cursor-pointer"
                      title="移除檔案"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              {receiptUrl && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {receiptUrl.startsWith('data:image/') || receiptName?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                      <img
                        src={receiptUrl}
                        alt="Preview"
                        className="h-12 w-12 object-cover rounded-lg border border-slate-200 bg-white"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <FileText className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{receiptName || '憑證附件'}</div>
                      <div className="text-[11px] text-emerald-600 font-medium">✓ 已上傳就緒</div>
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
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
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
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {editingExpense ? '儲存變更' : '確認登記支出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
