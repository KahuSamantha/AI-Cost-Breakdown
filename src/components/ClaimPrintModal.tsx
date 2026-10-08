import React from 'react';
import { X, Printer, Download, CheckCircle2, Building, UserCheck } from 'lucide-react';
import { ReimbursementBatch, ExpenseRecord, UserProfile } from '../types';
import { formatTWD, formatOriginalCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_LABELS } from '../data/presets';

interface ClaimPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: ReimbursementBatch;
  expenses: ExpenseRecord[];
  userProfile: UserProfile;
}

export const ClaimPrintModal: React.FC<ClaimPrintModalProps> = ({
  isOpen,
  onClose,
  batch,
  expenses,
  userProfile,
}) => {
  if (!isOpen) return null;

  const batchExpenses = expenses.filter((e) => batch.expenseIds.includes(e.id));
  const totalAmount = batchExpenses.reduce((sum, e) => sum + e.amountTWD, 0);
  const totalForeignFees = batchExpenses.reduce((sum, e) => sum + (e.foreignFeeTWD || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden my-6 text-slate-900">
        {/* Top Control Bar (Screen only) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900">正式請款單列印預覽</span>
            <span className="text-xs text-slate-500 font-mono">({batch.batchNumber})</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>列印 / 存為 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Form Container */}
        <div className="p-6 sm:p-10 max-h-[85vh] overflow-y-auto bg-white text-slate-900 print:p-0">
          <div className="border border-slate-200 print:border-neutral-900 p-6 sm:p-8 bg-white rounded-xl shadow-xs print:shadow-none">
            {/* Header Lockup */}
            <div className="text-center pb-6 border-b-2 border-slate-200 print:border-neutral-900">
              <div className="text-xs text-slate-500 tracking-wider uppercase font-semibold">
                {batch.companyName || userProfile.companyName}
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1">
                費用支出證明單 (品牌計畫 AI 工具費用核銷)
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                <span>統一編號: {batch.companyTaxId || userProfile.companyTaxId}</span>
                <span>·</span>
                <span className="font-mono">請款批號: {batch.batchNumber}</span>
                <span>·</span>
                <span>申請日期: {formatDate(batch.submissionDate)}</span>
              </div>
            </div>

            {/* Applicant Details Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
              <div>
                <span className="text-slate-500 block">請款申請人</span>
                <span className="font-bold text-slate-900 text-sm">
                  {batch.applicantName || userProfile.name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">所屬部門 / 計畫</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {batch.applicantDepartment || userProfile.department}
                </span>
              </div>
            </div>

            {/* Expense Items Table */}
            <div className="py-4">
              <div className="text-xs font-bold text-slate-800 mb-2">
                請款明細項目 (共 {batchExpenses.length} 項)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">付款日期</th>
                      <th className="py-2.5 px-3">AI 服務項目</th>
                      <th className="py-2.5 px-3">專案用途說明</th>
                      <th className="py-2.5 px-3 text-right">原幣金額</th>
                      <th className="py-2.5 px-3 text-right">匯率</th>
                      <th className="py-2.5 px-3 text-right">手續費</th>
                      <th className="py-2.5 px-3 text-right">折合台幣 (TWD)</th>
                      <th className="py-2.5 px-3 text-center">憑證號碼</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchExpenses.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                          {formatDate(item.paymentDate)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">
                            {item.toolName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {CATEGORY_LABELS[item.toolCategory] || item.toolCategory}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">
                            {item.projectName}
                          </div>
                          <div className="text-[11px] text-slate-500 max-w-xs">
                            {item.description}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums">
                          {formatOriginalCurrency(item.originalAmount, item.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {item.exchangeRate}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {item.hasForeignFee ? formatTWD(item.foreignFeeTWD) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono tabular-nums">
                          {formatTWD(item.amountTWD)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                          {item.invoiceNumber || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <tr>
                      <td colSpan={6} className="py-3 px-3 text-right text-xs text-slate-600">
                        海外刷卡手續費小計 (1.5%): 
                        <span className="font-mono ml-1 font-bold">{formatTWD(totalForeignFees)}</span>
                      </td>
                      <td colSpan={2} className="py-3 px-3 text-right text-sm text-slate-900 font-black font-mono">
                        實支請款總計: {formatTWD(totalAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Note & Justification */}
            <div className="py-3 text-xs border-b border-slate-200">
              <span className="font-bold text-slate-800">
                請款事由與備註說明:
              </span>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {batch.notes ||
                  '台灣經濟研究院 品牌計畫 AI 工具費用核銷請款單，已檢附國外電子收據與水單備查，請惠予核銷撥款。'}
              </p>
            </div>

            {/* Approval Signatures */}
            <div className="pt-6">
              <div className="text-xs font-bold text-slate-800 mb-3">
                核決與簽核欄位:
              </div>
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="border border-slate-300 rounded-xl p-3 h-24 flex flex-col justify-between">
                  <span className="text-slate-500">申請人簽章</span>
                  <div className="font-bold text-slate-900">
                    {batch.applicantName || userProfile.name}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatDate(batch.submissionDate)}
                  </span>
                </div>

                <div className="border border-slate-300 rounded-xl p-3 h-24 flex flex-col justify-between">
                  <span className="text-slate-500">計畫主持人核准</span>
                  <div className="font-bold text-slate-900">
                    {batch.managerName || '計畫主持人'}
                  </div>
                  <span className="text-[10px] text-slate-400">簽署 / 蓋章</span>
                </div>

                <div className="border border-slate-300 rounded-xl p-3 h-24 flex flex-col justify-between">
                  <span className="text-slate-500">財會審核</span>
                  <div className="font-bold text-slate-900">
                    {batch.financeName || '會計人員'}
                  </div>
                  <span className="text-[10px] text-slate-400">憑證核符</span>
                </div>

                <div className="border border-slate-300 rounded-xl p-3 h-24 flex flex-col justify-between">
                  <span className="text-slate-500">出納放款</span>
                  <div className="font-semibold text-slate-400">
                    (核章待撥)
                  </div>
                  <span className="text-[10px] text-slate-400">放款轉帳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
