import React, { useState, useEffect } from 'react';
import { X, Car, Building2, Check, Trash2, Calendar, FileText, DollarSign, Receipt, Sparkles } from 'lucide-react';
import { ReimbursementOffset, ExpenseRecord, OffsetType } from '../types';
import { formatTWD } from '../utils/formatters';

interface OffsetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  offset: ReimbursementOffset | null;
  expenses: ExpenseRecord[];
  onSave: (offset: Omit<ReimbursementOffset, 'id' | 'createdAt'>, editId?: string) => void;
  onDelete?: (id: string) => void;
}

export const OffsetEditModal: React.FC<OffsetEditModalProps> = ({
  isOpen,
  onClose,
  offset,
  expenses,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(offset);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [offsetType, setOffsetType] = useState<OffsetType>('taxi');
  const [amountTWD, setAmountTWD] = useState<number | ''>('');
  const [targetExpenseId, setTargetExpenseId] = useState<string>('');
  const [receiptProof, setReceiptProof] = useState('');
  const [notes, setNotes] = useState('');

  // Sync state when modal opens or offset changes
  useEffect(() => {
    if (isOpen) {
      if (offset) {
        setDate(offset.date || new Date().toISOString().slice(0, 10));
        setTitle(offset.title || '');
        setOffsetType(offset.offsetType || 'taxi');
        setAmountTWD(offset.amountTWD || '');
        setTargetExpenseId(offset.targetExpenseId || '');
        setReceiptProof(offset.receiptProof || '');
        setNotes(offset.notes || '');
      } else {
        // Check if there is an unsaved draft
        const draftRaw = localStorage.getItem('ai_offset_draft');
        let restored = false;
        if (draftRaw) {
          try {
            const draft = JSON.parse(draftRaw);
            if (draft && (draft.title || draft.amountTWD)) {
              setDate(draft.date || new Date().toISOString().slice(0, 10));
              setTitle(draft.title || '');
              setOffsetType(draft.offsetType || 'taxi');
              setAmountTWD(draft.amountTWD || '');
              setTargetExpenseId(draft.targetExpenseId || '');
              setReceiptProof(draft.receiptProof || '計程車單據');
              setNotes(draft.notes || '');
              restored = true;
            }
          } catch {}
        }
        if (!restored) {
          setDate(new Date().toISOString().slice(0, 10));
          setTitle('');
          setOffsetType('taxi');
          setAmountTWD('');
          setTargetExpenseId('');
          setReceiptProof('計程車單據');
          setNotes('');
        }
      }
    }
  }, [isOpen, offset]);

  // Auto-save draft when editing a new item
  useEffect(() => {
    if (isOpen && !offset) {
      if (title || amountTWD || notes) {
        localStorage.setItem(
          'ai_offset_draft',
          JSON.stringify({ date, title, offsetType, amountTWD, targetExpenseId, receiptProof, notes })
        );
      }
    }
  }, [isOpen, offset, date, title, offsetType, amountTWD, targetExpenseId, receiptProof, notes]);

  if (!isOpen) return null;

  const handleSelectType = (type: OffsetType) => {
    setOffsetType(type);
    if (!receiptProof || receiptProof === '計程車單據' || receiptProof === '會計傳票轉帳') {
      setReceiptProof(type === 'taxi' ? '計程車單據' : '會計傳票轉帳');
    }
    if (!title) {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      setTitle(type === 'taxi' ? `${month}/${day} 計程車車資沖銷` : `${month}月份 會計直接撥款沖銷`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請填寫事由名稱');
      return;
    }
    const numAmount = Number(amountTWD);
    if (!numAmount || numAmount <= 0) {
      alert('請填寫有效的沖銷金額');
      return;
    }

    const matchedExpense = expenses.find((exp) => exp.id === targetExpenseId);

    const payload: Omit<ReimbursementOffset, 'id' | 'createdAt'> = {
      date: date || new Date().toISOString().slice(0, 10),
      title: title.trim(),
      offsetType,
      amountTWD: numAmount,
      targetExpenseId: targetExpenseId || undefined,
      targetExpenseName: matchedExpense ? matchedExpense.toolName : undefined,
      receiptProof: receiptProof.trim() || (offsetType === 'taxi' ? '計程車單' : '會計轉帳'),
      status: offset?.status || 'reimbursed',
      notes: notes.trim(),
    };

    try {
      localStorage.removeItem('ai_offset_draft');
    } catch {}

    onSave(payload, offset?.id);
    onClose();
  };

  const handleDelete = () => {
    if (!offset || !onDelete) return;
    if (confirm(`確定要刪除「${offset.title}」這筆核銷紀錄嗎？`)) {
      onDelete(offset.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-6 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${
              offsetType === 'taxi' 
                ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}>
              {offsetType === 'taxi' ? <Car className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{isEditing ? '編輯核銷項目' : '新增核銷項目'}</span>
                {isEditing && (
                  <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {offset?.id}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                記錄以差旅計程車資單據抵充代墊之 AI 費用
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 類別選擇 (會計直接撥款 vs 計程車車資單) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              沖銷抵充類別 <span className="text-pink-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectType('accounting')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  offsetType === 'accounting'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  offsetType === 'accounting' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-extrabold text-xs">會計出納直接撥款</div>
                  <div className="text-[11px] text-slate-500">公司帳務直接放款撥入</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectType('taxi')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  offsetType === 'taxi'
                    ? 'border-pink-600 bg-pink-50/70 text-pink-950 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  offsetType === 'taxi' ? 'bg-pink-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Car className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-extrabold text-xs">計程車車資單據</div>
                  <div className="text-[11px] text-slate-500">以差旅乘車證明沖抵</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 沖銷日期 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>沖銷日期 <span className="text-pink-600">*</span></span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-mono font-medium"
              />
            </div>

            {/* 沖銷金額 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-pink-600" />
                <span>沖銷金額 (NTD) <span className="text-pink-600">*</span></span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  NT$
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="例如: 637 或 566"
                  value={amountTWD}
                  onChange={(e) => setAmountTWD(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3.5 py-2.5 text-sm text-slate-900 font-mono font-black focus:outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* 事由名稱 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>事由名稱 / 單據說明 <span className="text-pink-600">*</span></span>
            </label>
            <input
              type="text"
              placeholder={offsetType === 'taxi' ? '例如: 9/22 計程車單 (客戶拜訪)' : '例如: 會計出納直接撥款沖銷'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 憑證收據編號 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-slate-500" />
                <span>憑證號碼 / 收據註記</span>
              </label>
              <input
                type="text"
                placeholder={offsetType === 'taxi' ? '大都會車資證明 #TX-0922' : '會計電匯傳票 #ACC-TRANSFER'}
                value={receiptProof}
                onChange={(e) => setReceiptProof(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-medium"
              />
            </div>

            {/* 對應哪一筆 AI 支出 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>抵充哪一筆 AI 支出 (選填)</span>
              </label>
              <select
                value={targetExpenseId}
                onChange={(e) => setTargetExpenseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-medium cursor-pointer"
              >
                <option value="">-- 一般抵充 (不指定特定項目) --</option>
                {expenses.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.toolName} ({formatTWD(exp.amountTWD)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 備註說明 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              補充說明與審核紀錄
            </label>
            <textarea
              rows={2}
              placeholder="說明抵充由來、主管審批細節..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-medium resize-none"
            />
          </div>

          {/* Dialog Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-rose-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>刪除此筆核銷</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 rounded-xl transition-all cursor-pointer shadow-md shadow-pink-500/25"
              >
                <Check className="h-4 w-4" />
                <span>{isEditing ? '儲存變更' : '確認新增'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
