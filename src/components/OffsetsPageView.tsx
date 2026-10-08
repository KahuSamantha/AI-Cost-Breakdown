import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Car, 
  Trash2, 
  Edit3, 
  Download, 
  Search, 
  Building2, 
  ArrowRight
} from 'lucide-react';
import { ReimbursementOffset, ExpenseRecord, OffsetType } from '../types';
import { formatTWD, formatDate } from '../utils/formatters';

interface OffsetsPageViewProps {
  offsets: ReimbursementOffset[];
  expenses: ExpenseRecord[];
  onAddOffset?: (offset: Omit<ReimbursementOffset, 'id' | 'createdAt'>) => void;
  onSaveOffset?: (offset: Omit<ReimbursementOffset, 'id' | 'createdAt'>, editId?: string) => void;
  onDeleteOffset: (id: string) => void;
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
  onNavigateToExpenses,
  onOpenNewExpense,
  onOpenNewOffset,
  onOpenEditOffset,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingOffset, setEditingOffset] = useState<ReimbursementOffset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'accounting' | 'taxi'>('all');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [offsetType, setOffsetType] = useState<OffsetType>('taxi');
  const [amountTWD, setAmountTWD] = useState<number | ''>('');
  const [receiptProof, setReceiptProof] = useState('計程車單據');
  const [notes, setNotes] = useState('');

  // Financial numbers
  const totalExpenseTWD = expenses.reduce((sum, e) => sum + e.amountTWD, 0);
  const taxiOffsets = offsets.filter((o) => o.offsetType === 'taxi');
  const accountingOffsets = offsets.filter((o) => o.offsetType !== 'taxi');
  const taxiTotal = taxiOffsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const accountingTotal = accountingOffsets.reduce((sum, o) => sum + o.amountTWD, 0);
  const totalOffsetTWD = taxiTotal + accountingTotal;
  const netRemainingTWD = Math.max(0, totalExpenseTWD - totalOffsetTWD);

  // Filtered offsets: 嚴格依日期由新到舊排序
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
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.receiptProof && item.receiptProof.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [offsets, methodFilter, searchTerm]);

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
    setReceiptProof(offset.receiptProof || '');
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
    setNotes('');
    setDate(new Date().toISOString().slice(0, 10));
    setReceiptProof('計程車單據');
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
      receiptProof: receiptProof.trim() || '計程車單據',
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

  const handleExportCSV = () => {
    const rows = [
      ['台灣經濟研究院 品牌計畫 AI工具費用核銷紀錄 (Samantha)'],
      [`製表日期: ${new Date().toLocaleDateString('zh-TW')}`],
      ['單位: 台灣經濟研究院 品牌計畫'],
      [''],
      ['核銷項目 ID', '日期', '事由 / 憑證名稱', '抵充類別', '憑證字號/收據', '核銷金額 (TWD)', '備註'],
      ...filteredOffsets.map((o) => [
        o.id,
        o.date,
        o.title,
        o.offsetType === 'taxi' ? '計程車車資單' : '直接撥款',
        o.receiptProof || '',
        o.amountTWD,
        o.notes || '',
      ]),
      [''],
      ['計程車單抵充小計', '', '', '', '', taxiTotal, ''],
      ['已核銷總額', '', '', '', '', totalOffsetTWD, ''],
      ['AI 累計總支出', '', '', '', '', totalExpenseTWD, ''],
      ['尚餘未核銷金額', '', '', '', '', netRemainingTWD, ''],
    ];

    const csvContent =
      '\uFEFF' +
      rows
        .map((row) =>
          row
            .map((field) => {
              const str = String(field ?? '');
              return str.includes(',') || str.includes('"') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"`
                : str;
            })
            .join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `品牌計畫_核銷紀錄_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    // 整體設計區塊為一個大白色區塊，內部再切分精緻子區塊
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs text-slate-900 space-y-7">
      {/* 區塊 1: 頂部標題與唯一一組主要操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700">台灣經濟研究院 · 品牌計畫</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            核銷紀錄
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            計程車車資單據抵充明細
          </p>
        </div>

        {/* 頁面唯一一組主要操作按鈕 */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="匯出核銷明細 CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>匯出 CSV</span>
          </button>

          <button
            onClick={onOpenNewExpense || onNavigateToExpenses}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>記一筆 AI 支出</span>
          </button>

          <button
            onClick={() => {
              if (onOpenNewOffset) {
                onOpenNewOffset();
              } else if (isAdding) {
                handleCancelForm();
              } else {
                setIsAdding(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 text-pink-600" />
            <span>{isAdding ? (editingOffset ? '取消編輯' : '收合表單') : '新增核銷紀錄'}</span>
          </button>
        </div>
      </div>

      {/* 區塊 2: 三大核心數據卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: AI 累計總支出 */}
        <div 
          onClick={onNavigateToExpenses}
          className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 hover:border-indigo-300 hover:bg-indigo-50/80 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-indigo-900 font-bold">
            <span>1. AI 累計總支出</span>
            <span className="text-indigo-600 group-hover:underline flex items-center gap-0.5 text-[11px] font-bold">
              支出清單 <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-2.5 text-3xl font-black font-mono text-indigo-950 tabular-nums">
            {formatTWD(totalExpenseTWD)}
          </div>
          <div className="mt-1 text-[11px] text-indigo-700 font-medium">
            品牌計畫共 {expenses.length} 筆 AI 支出
          </div>
        </div>

        {/* Card 2: 已核銷金額 */}
        <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-pink-900 font-bold">
            <span>2. 已核銷金額</span>
            <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full border border-pink-200 font-bold">
              已抵充 {offsets.length} 筆
            </span>
          </div>
          <div className="mt-2.5 text-3xl font-black font-mono text-pink-600 tabular-nums">
            - {formatTWD(totalOffsetTWD)}
          </div>
          <div className="mt-1 text-[11px] text-pink-700 font-medium">
            計程車單抵充: <strong className="text-pink-700 font-mono">{formatTWD(taxiTotal)}</strong> ({taxiOffsets.length} 筆)
          </div>
        </div>

        {/* Card 3: 尚餘未核銷金額 */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-purple-900 font-extrabold">
            <span>3. 尚餘未核銷金額</span>
            <span className="text-[10px] font-extrabold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-xs">
              待請款餘額
            </span>
          </div>
          <div className="mt-2.5 text-3xl sm:text-4xl font-black font-mono text-purple-950 tabular-nums">
            {formatTWD(netRemainingTWD)}
          </div>
        </div>
      </div>

      {/* 區塊 3: 嵌入式表單 (展開時顯示) */}
      {isAdding && (
        <form
          id="offset-form-section"
          onSubmit={handleSaveNew}
          className="p-5 sm:p-6 rounded-2xl border border-pink-200 bg-pink-50/40 shadow-xs space-y-4 text-xs text-slate-900 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <span className="font-black text-slate-900 text-sm">
              {editingOffset ? `編輯核銷項目 (${editingOffset.id})` : '新增一筆核銷紀錄'}
            </span>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer px-2"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                抵充類別 <span className="text-pink-600">*</span>
              </label>
              <select
                value={offsetType}
                onChange={(e) => {
                  const val = e.target.value as OffsetType;
                  setOffsetType(val);
                  if (val === 'taxi') {
                    setReceiptProof('計程車單據');
                  } else {
                    setReceiptProof('直接放款抵充');
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-pink-500 cursor-pointer font-bold"
              >
                <option value="taxi">計程車車資單據 (以差旅車資抵充)</option>
                <option value="accounting">直接放款抵充</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">單據日期</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-pink-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                抵充金額 (NTD) <span className="text-pink-600">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="例如 566 或 1000"
                value={amountTWD}
                onChange={(e) =>
                  setAmountTWD(e.target.value ? parseInt(e.target.value, 10) : '')
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-pink-600 font-mono font-bold text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                事由名稱 <span className="text-pink-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例如: 9/8 計程車單 (客戶拜訪)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                憑證字號 / 車資證明收據
              </label>
              <input
                type="text"
                placeholder="台北智慧計程車單 #TX-0925"
                value={receiptProof}
                onChange={(e) => setReceiptProof(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">備註說明 (選填)</label>
            <input
              type="text"
              placeholder="說明抵充原委..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
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

      {/* 區塊 4: 搜尋與抵充方式篩選列 (無資料復原按鈕) */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋事由、單據、備註..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          <div className="w-full sm:w-52">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as 'all' | 'accounting' | 'taxi')}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-pink-500 cursor-pointer font-medium"
            >
              <option value="all">所有抵充方式 (全部)</option>
              <option value="taxi">計程車車資單據 ({taxiOffsets.length} 筆)</option>
              <option value="accounting">其他直接抵充 ({accountingOffsets.length} 筆)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-medium shrink-0">
          顯示筆數: <strong className="text-pink-600 font-black">{filteredOffsets.length}</strong> / {offsets.length} 筆 (依日期新至舊)
        </div>
      </div>

      {/* 區塊 5: 核銷紀錄表格 (依日期由新到舊排序) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold select-none">
            <tr>
              <th className="py-3.5 px-4 whitespace-nowrap">單據日期</th>
              <th className="py-3.5 px-4">事由 / 憑證名稱</th>
              <th className="py-3.5 px-4 whitespace-nowrap">抵充類別</th>
              <th className="py-3.5 px-4">車資證明/收據編號</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">抵充金額 (NTD)</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOffsets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
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
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap font-medium">
                      <span className="font-bold text-pink-700">{formatDate(item.date)}</span>
                    </td>
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
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                        isTaxi
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {isTaxi ? '計程車車資' : '直接撥款'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="text-[11px]">
                        {item.receiptProof || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-pink-600 font-mono tabular-nums text-sm whitespace-nowrap">
                      - {formatTWD(item.amountTWD)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="修改此筆資料"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>編輯</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`確定要刪除「${item.title}」這筆核銷紀錄嗎？`)) {
                              onDeleteOffset(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="刪除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50 font-bold">
            <tr>
              <td colSpan={4} className="py-3.5 px-4 text-slate-900">
                已核銷項目合計 ({filteredOffsets.length} 筆)
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-pink-600 text-sm tabular-nums">
                - {formatTWD(totalOffsetTWD)}
              </td>
              <td className="py-3.5 px-4 text-right text-[11px] text-slate-600 font-bold whitespace-nowrap">
                尚餘未核銷: {formatTWD(netRemainingTWD)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
