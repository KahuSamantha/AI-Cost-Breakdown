import React, { useState, useEffect } from 'react';
import { X, Car, Building2, Check, Trash2, Calendar, FileText, DollarSign, MapPin, Navigation, Sparkles } from 'lucide-react';
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
  const [origin, setOrigin] = useState('台經院 (德惠大樓)');
  const [destination, setDestination] = useState('');
  const [targetExpenseId, setTargetExpenseId] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Sync state when modal opens or offset changes
  useEffect(() => {
    if (isOpen) {
      if (offset) {
        setDate(offset.date || new Date().toISOString().slice(0, 10));
        setTitle(offset.title || '');
        setOffsetType(offset.offsetType || 'taxi');
        setAmountTWD(offset.amountTWD || '');
        setOrigin(offset.origin || '台經院 (德惠大樓)');
        setDestination(offset.destination || '');
        setTargetExpenseId(offset.targetExpenseId || '');
        setNotes(offset.notes || '');
      } else {
        setDate(new Date().toISOString().slice(0, 10));
        setTitle('');
        setOffsetType('taxi');
        setAmountTWD('');
        setOrigin('台經院 (德惠大樓)');
        setDestination('');
        setTargetExpenseId('');
        setNotes('');
      }
    }
  }, [isOpen, offset]);

  if (!isOpen) return null;

  const handleSelectType = (type: OffsetType) => {
    setOffsetType(type);
    if (!title) {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      setTitle(type === 'taxi' ? `${month}/${day} 計程車車資抵充` : `${month}月份 會計直接撥款沖銷`);
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
      alert('請填寫有效的核銷金額');
      return;
    }

    const matchedExpense = expenses.find((exp) => exp.id === targetExpenseId);

    const payload: Omit<ReimbursementOffset, 'id' | 'createdAt'> = {
      date: date || new Date().toISOString().slice(0, 10),
      title: title.trim(),
      offsetType,
      amountTWD: numAmount,
      origin: origin.trim() || '台經院',
      destination: destination.trim() || '公務會議地點',
      targetExpenseId: targetExpenseId || undefined,
      targetExpenseName: matchedExpense ? matchedExpense.toolName : undefined,
      status: offset?.status || 'reimbursed',
      notes: notes.trim(),
    };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-slate-900 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100/70 text-pink-700">
              {offsetType === 'taxi' ? <Car className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isEditing ? '編輯核銷抵充紀錄' : '登記核銷抵充紀錄'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                記載外勤車資、出發起始地點與到達地點
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {/* 抵充方式選擇器 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              核銷抵充方式
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectType('taxi')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  offsetType === 'taxi'
                    ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Car className="h-4 w-4" />
                <span>計程車車資單據</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectType('accounting')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  offsetType !== 'taxi'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>其他直接撥款抵充</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 單據日期 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>單據日期 <span className="text-pink-600">*</span></span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500 focus:bg-white font-medium"
              />
            </div>

            {/* 核銷金額 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-pink-600" />
                <span>核銷金額 (NT$) <span className="text-pink-600">*</span></span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="例如: 637"
                value={amountTWD}
                onChange={(e) => setAmountTWD(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500 focus:bg-white font-mono font-bold"
              />
            </div>
          </div>

          {/* 事由名稱 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>事由名稱 <span className="text-pink-600">*</span></span>
            </label>
            <input
              type="text"
              placeholder={offsetType === 'taxi' ? '例如: 9/25 計程車單 (跨單位會議車資抵充)' : '例如: 會計出納直接撥款沖銷'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500 focus:bg-white font-medium"
            />
          </div>

          {/* 新增: 起始地點 與 到達地點 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-pink-600" />
                <span>起始地點</span>
              </label>
              <input
                type="text"
                placeholder="例如: 台經院 (德惠大樓)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-indigo-600" />
                <span>到達地點</span>
              </label>
              <input
                type="text"
                placeholder="例如: 經濟部產業發展署 / 國科會"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* 針對哪一筆 AI 支出抵充 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>針對哪一筆 AI 支出抵充 (選填)</span>
            </label>
            <select
              value={targetExpenseId}
              onChange={(e) => setTargetExpenseId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium cursor-pointer"
            >
              <option value="">-- 一般抵充 (不指定特定項目) --</option>
              {expenses.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.toolName} ({formatTWD(exp.amountTWD)})
                </option>
              ))}
            </select>
          </div>

          {/* 備註說明 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              備註說明 (選填)
            </label>
            <textarea
              rows={2}
              placeholder="說明抵充由來、主管審批細節..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-pink-500 focus:bg-white font-medium resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-rose-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>刪除</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-all cursor-pointer shadow-xs"
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
