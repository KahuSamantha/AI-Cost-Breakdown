import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Car, 
  Trash2, 
  Edit3, 
  Download, 
  Search, 
  Building2, 
  ArrowRight,
  MapPin,
  Navigation,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { ReimbursementOffset, ExpenseRecord, OffsetType } from '../types';
import { formatTWD, formatDate } from '../utils/formatters';

interface OffsetsPageViewProps {
  offsets: ReimbursementOffset[];
  expenses: ExpenseRecord[];
  onAddOffset?: (offset: Omit<ReimbursementOffset, 'id' | 'createdAt'>) => void;
  onSaveOffset?: (offset: Omit<ReimbursementOffset, 'id' | 'createdAt'>, editId?: string) => void;
  onDeleteOffset: (id: string) => void;
  onBatchDeleteOffsets?: (ids: string[]) => void;
  onUpdateOffsetStatus?: (id: string, status: 'claimed' | 'reimbursed') => void;
  onNavigateToExpenses: () => void;
  onOpenNewExpense?: () => void;
  onOpenNewOffset?: () => void;
  onOpenEditOffset?: (offset: ReimbursementOffset) => void;
}

export const OffsetsPageView: React.FC<OffsetsPageViewProps> = ({
  offsets,
  expenses,
  onAddOffset,
  onSaveOffset,
  onDeleteOffset,
  onBatchDeleteOffsets,
  onNavigateToExpenses,
  onOpenNewExpense,
  onOpenNewOffset,
  onOpenEditOffset,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingOffset, setEditingOffset] = useState<ReimbursementOffset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'accounting' | 'taxi'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  // Form states: 起始地點、到達地點
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [offsetType, setOffsetType] = useState<OffsetType>('taxi');
  const [amountTWD, setAmountTWD] = useState<number | ''>('');
  const [origin, setOrigin] = useState('台經院 (德惠大樓)');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');

  // Financial numbers
  const totalExpenseTWD = expenses.reduce((sum, e) => sum + e.amountTWD, 0);
  const taxiOffsets = offsets.filter((o) => o.offsetType === 'taxi');
  const accountingOffsets = offsets.filter((o) => o.offsetType !== 'taxi');
  const taxiTotal = taxiOffsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const accountingTotal = accountingOffsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const totalOffsetTWD = taxiTotal + accountingTotal;
  const netRemainingTWD = Math.max(0, totalExpenseTWD - totalOffsetTWD);

  // Filtered offsets: 依日期由新到舊排序
  const filteredOffsets = useMemo(() => {
    return offsets.filter((item) => {
      if (methodFilter === 'taxi' && item.offsetType !== 'taxi') {
        return false;
      }
      if (methodFilter === 'accounting' && item.offsetType === 'taxi') {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          (item.origin && item.origin.toLowerCase().includes(q)) ||
          (item.destination && item.destination.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [offsets, methodFilter, searchTerm]);

  // Selection helpers
  const allFilteredSelected =
    filteredOffsets.length > 0 && filteredOffsets.every((o) => selectedIds.has(o.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredOffsets.forEach((o) => next.add(o.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedOffsets = useMemo(() => {
    return offsets.filter((o) => selectedIds.has(o.id));
  }, [offsets, selectedIds]);

  const selectedTotalTWD = selectedOffsets.reduce((sum, o) => sum + o.amountTWD, 0);

  const handleStartEdit = (offset: ReimbursementOffset) => {
    if (onOpenEditOffset) {
      onOpenEditOffset(offset);
      return;
    }
    setEditingOffset(offset);
    setDate(offset.date);
    setTitle(offset.title);
    setOffsetType(offset.offsetType);
    setAmountTWD(offset.amountTWD);
    setOrigin(offset.origin || '台經院 (德惠大樓)');
    setDestination(offset.destination || '');
    setNotes(offset.notes || '');
    setIsAdding(true);
    setTimeout(() => {
      const formEl = document.getElementById('offset-form-section');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingOffset(null);
    setTitle('');
    setAmountTWD('');
    setOrigin('台經院 (德惠大樓)');
    setDestination('');
    setNotes('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請填寫事由 (例如: 9/8 計程車單抵充)');
      return;
    }
    if (!amountTWD || Number(amountTWD) <= 0) {
      alert('請填寫有效的核銷抵充金額');
      return;
    }

    const payload = {
      date,
      title: title.trim(),
      offsetType,
      amountTWD: Number(amountTWD),
      origin: origin.trim() || '台經院',
      destination: destination.trim() || '公務會議地點',
      status: editingOffset?.status || ('reimbursed' as const),
      notes: notes.trim(),
    };

    if (onSaveOffset) {
      onSaveOffset(payload, editingOffset?.id);
    } else if (onAddOffset) {
      onAddOffset(payload);
    }
    handleCancelForm();
  };

  const handleExecuteBatchDelete = () => {
    const ids = Array.from(selectedIds);
    if (onBatchDeleteOffsets) {
      onBatchDeleteOffsets(ids);
    } else {
      ids.forEach((id) => onDeleteOffset(id));
    }
    setSelectedIds(new Set());
    setShowBatchDeleteConfirm(false);
  };

  const handleExportCSV = () => {
    const toExport = selectedOffsets.length > 0 ? selectedOffsets : filteredOffsets;
    const rows = [
      ['台灣經濟研究院 品牌計畫 費用核銷抵充紀錄 (Samantha)'],
      [`製表日期: ${new Date().toLocaleDateString('zh-TW')}`],
      ['單位: 台灣經濟研究院 品牌計畫'],
      [''],
      ['核銷項目 ID', '日期', '事由名稱', '抵充類別', '起始地點', '到達地點', '核銷金額 (NT$)', '備註'],
      ...toExport.map((o) => [
        o.id,
        o.date,
        o.title,
        o.offsetType === 'taxi' ? '計程車車資單' : '直接撥款',
        o.origin || '-',
        o.destination || '-',
        o.amountTWD,
        o.notes || '',
      ]),
      [''],
      ['核銷總計', '', '', '', '', '', toExport.reduce((s, o) => s + o.amountTWD, 0), ''],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `核銷抵充紀錄_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-3.5 sm:p-6 lg:p-8 shadow-sm text-slate-900 space-y-5 sm:space-y-7">
      {/* 區塊 1: 頂部標題與主要按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700">台灣經濟研究院 · 品牌計畫</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            核銷抵充明細
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            外勤公務車資與直接撥款紀錄，記載出發起始地點與到達地點
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="匯出核銷明細 CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>匯出 CSV</span>
          </button>

          <button
            onClick={() => {
              if (onOpenNewOffset) {
                onOpenNewOffset();
              } else {
                setIsAdding(!isAdding);
                setEditingOffset(null);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>新增核銷紀錄</span>
          </button>
        </div>
      </div>

      {/* 區塊 2: 三大數據卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={onNavigateToExpenses}
          className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 cursor-pointer hover:bg-indigo-50/90 transition-colors group shadow-xs"
        >
          <div className="text-xs text-indigo-900 font-bold flex items-center justify-between">
            <span>1. AI 累計總支出 (NT$)</span>
            <span className="text-[11px] text-indigo-600 group-hover:underline font-semibold">查看支出 →</span>
          </div>
          <div className="text-3xl font-black font-mono text-indigo-950 mt-2 tabular-nums">
            {formatTWD(totalExpenseTWD)}
          </div>
          <div className="text-[11px] text-indigo-700 mt-1 font-medium">共 {expenses.length} 筆 AI 工具支出</div>
        </div>

        <div className="p-5 rounded-2xl bg-pink-50/60 border border-pink-100 shadow-xs">
          <div className="text-xs text-pink-900 font-bold">2. 已核銷金額 (NT$)</div>
          <div className="text-3xl font-black font-mono text-pink-600 mt-2 tabular-nums">
            - {formatTWD(totalOffsetTWD)}
          </div>
          <div className="text-[11px] text-pink-700 mt-1 font-medium">
            計程車車資抵充: <strong className="text-pink-700 font-mono">{formatTWD(taxiTotal)}</strong> ({taxiOffsets.length} 筆)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs">
          <div className="text-xs text-purple-900 font-extrabold flex items-center justify-between">
            <span>3. 尚餘未核銷金額 (NT$)</span>
            <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">待請款餘額</span>
          </div>
          <div className="text-3xl font-black font-mono text-purple-950 mt-2 tabular-nums">
            {formatTWD(netRemainingTWD)}
          </div>
        </div>
      </div>

      {/* 區塊 3: 內嵌新增/編輯表單 (含 起始地點、到達地點) */}
      {isAdding && (
        <form
          id="offset-form-section"
          onSubmit={handleSaveNew}
          className="rounded-2xl border-2 border-pink-200 bg-pink-50/40 p-5 sm:p-6 space-y-4 text-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-pink-200/60">
            <h3 className="text-sm font-black text-pink-900 flex items-center gap-2">
              <Car className="h-4 w-4 text-pink-600" />
              <span>{editingOffset ? '編輯核銷抵充項目' : '登記新核銷紀錄'}</span>
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                單據日期 <span className="text-pink-600">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">核銷抵充方式</label>
              <select
                value={offsetType}
                onChange={(e) => setOffsetType(e.target.value as OffsetType)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-pink-500 cursor-pointer font-medium"
              >
                <option value="taxi">計程車車資單 (Taxi)</option>
                <option value="travel">出差差旅交通費</option>
                <option value="accounting">會計出納直接撥款</option>
                <option value="other">其他代墊款項沖銷</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                抵充金額 (NT$) <span className="text-pink-600">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="例如: 637"
                value={amountTWD}
                onChange={(e) => setAmountTWD(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-pink-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              事由名稱 <span className="text-pink-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如: 9/25 計程車單 (跨單位會議車資抵充)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          {/* 新增: 起始地點 與 到達地點 欄位 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-pink-600" />
                <span>起始地點</span>
              </label>
              <input
                type="text"
                placeholder="例如: 台經院 (德惠大樓)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-indigo-600" />
                <span>到達地點</span>
              </label>
              <input
                type="text"
                placeholder="例如: 經濟部產業發展署 / 國科會"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">備註說明 (選填)</label>
            <input
              type="text"
              placeholder="補充備註細節..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl cursor-pointer font-bold transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl cursor-pointer shadow-xs"
            >
              {editingOffset ? '更新儲存' : '確認新增核銷'}
            </button>
          </div>
        </form>
      )}

      {/* 區塊 4: 搜尋與抵充方式篩選列 */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋事由、起始地、到達地、備註..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          <div className="w-full sm:w-52">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as 'all' | 'accounting' | 'taxi')}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-pink-500 cursor-pointer font-medium"
            >
              <option value="all">所有抵充方式 (全部)</option>
              <option value="taxi">計程車車資單據 ({taxiOffsets.length} 筆)</option>
              <option value="accounting">其他直接抵充 ({accountingOffsets.length} 筆)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-medium shrink-0">
          顯示中筆數: <strong className="text-pink-600 font-black">{filteredOffsets.length}</strong> / {offsets.length} 筆
        </div>
      </div>

      {/* 區塊 5: 勾選批次操作橫幅 (支援核銷項目批量刪除) */}
      {selectedIds.size > 0 && (
        <div className="rounded-2xl bg-pink-50/90 border border-pink-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <CheckSquare className="h-4.5 w-4.5 text-pink-600 shrink-0" />
            <span className="text-slate-800">
              已選取 <strong className="text-slate-900 tabular-nums font-black">{selectedIds.size} 筆</strong> 核銷，合計
              <strong className="text-pink-700 font-black tabular-nums ml-1.5 text-base">
                {formatTWD(selectedTotalTWD)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setShowBatchDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              <span>批量刪除 ({selectedIds.size} 筆)</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              取消選取
            </button>
          </div>
        </div>
      )}

      {/* 區塊 6: 核銷紀錄表格 (依日期新到舊，包含 起始地點 與 到達地點) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold select-none">
            <tr>
              <th className="py-3 px-3.5 w-10 text-center">
                <button
                  onClick={toggleSelectAll}
                  className="cursor-pointer text-slate-400 hover:text-slate-700"
                  title={allFilteredSelected ? '取消全選' : '全選'}
                >
                  {allFilteredSelected ? (
                    <CheckSquare className="h-4 w-4 text-pink-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap">單據日期</th>
              <th className="py-3.5 px-4">事由 / 憑證名稱</th>
              <th className="py-3.5 px-4 whitespace-nowrap">抵充類別</th>
              <th className="py-3.5 px-4">起始地點</th>
              <th className="py-3.5 px-4">到達地點</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">抵充金額 (NT$)</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOffsets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <p className="text-sm font-bold text-slate-800">尚無符合條件的核銷紀錄</p>
                    <p className="text-xs text-slate-500">
                      點擊右上角「新增核銷紀錄」記錄項目
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOffsets.map((item) => {
                const isTaxi = item.offsetType === 'taxi';
                const isChecked = selectedIds.has(item.id);
                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-pink-50/30' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => toggleSelectOne(item.id)}
                        className="cursor-pointer text-slate-400 hover:text-slate-700"
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-pink-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap font-medium">
                      <span className="font-bold text-pink-700">{formatDate(item.date)}</span>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {isTaxi ? (
                          <Car className="h-3.5 w-3.5 text-pink-600 shrink-0" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        )}
                        <span>{item.title}</span>
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {item.notes}
                        </div>
                      )}
                    </td>

                    {/* Type badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                        isTaxi
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {isTaxi ? '計程車車資' : '直接撥款'}
                      </span>
                    </td>

                    {/* 起始地點 */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-800">
                        <MapPin className="h-3 w-3 text-pink-500 shrink-0" />
                        <span>{item.origin || '-'}</span>
                      </div>
                    </td>

                    {/* 到達地點 */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-800">
                        <Navigation className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span>{item.destination || '-'}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-black text-pink-600 font-mono tabular-nums text-sm sm:text-base whitespace-nowrap">
                      - {formatTWD(item.amountTWD)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(item)}
                          title="編輯此核銷項目"
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`確定要刪除「${item.title}」這筆核銷紀錄嗎？`)) {
                              onDeleteOffset(item.id);
                            }
                          }}
                          title="刪除"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 批量刪除確認彈窗 (Batch Delete Confirmation Modal for Offsets) */}
      {showBatchDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">確認批量刪除核銷紀錄？</h3>
                <p className="text-xs text-slate-500">此動作將永久移除所選紀錄</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-700">
                <span>選取項目數量:</span>
                <span className="font-bold text-slate-900">{selectedIds.size} 筆</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>選取抵充總額:</span>
                <span className="font-black text-rose-600 font-mono">{formatTWD(selectedTotalTWD)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              確定要刪除這 <strong className="text-slate-800">{selectedIds.size} 筆</strong> 核銷抵充紀錄嗎？
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchDelete}
                className="px-4.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                確認批量刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
