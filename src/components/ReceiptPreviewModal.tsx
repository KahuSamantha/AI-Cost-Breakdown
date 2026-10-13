import React, { useState } from 'react';
import { X, FileText, Download, ExternalLink, Calendar, CreditCard, DollarSign, Upload, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ExpenseRecord } from '../types';
import { formatTWD, formatDate } from '../utils/formatters';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseRecord | null;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  isOpen,
  onClose,
  expense,
  onUpdateExpense,
}) => {
  const [imageError, setImageError] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen || !expense) return null;

  const fileName = expense.receiptName || `${expense.toolName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_憑證.pdf`;

  // Check if file is PDF
  const isPdf = Boolean(
    (expense.receiptUrl && expense.receiptUrl.startsWith('data:application/pdf')) ||
    (expense.receiptName && expense.receiptName.toLowerCase().endsWith('.pdf'))
  );

  // Check if file is image
  const isImage = Boolean(
    (expense.receiptUrl && (
      expense.receiptUrl.startsWith('data:image/') ||
      expense.receiptUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)
    )) ||
    (expense.receiptName && expense.receiptName.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp|svg)$/i))
  );

  // Direct upload handler
  const handleDirectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('憑證檔案大小請小於 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const updated: ExpenseRecord = {
          ...expense,
          receiptUrl: url,
          receiptName: file.name,
          invoiceNumber: file.name,
        };
        onUpdateExpense?.(updated);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Download handler - Always download original file or a real formatted PDF, NEVER .txt!
  const handleDownload = () => {
    if (expense.receiptUrl) {
      const link = document.createElement('a');
      link.href = expense.receiptUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate a formal PDF document matching the original file name
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Header
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text('AI TOOL EXPENSE INVOICE VOUCHER', 20, 16);

        // Body Info Box
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        
        let y = 40;
        doc.text(`Voucher / File Name: ${fileName}`, 20, y);
        y += 10;
        doc.text(`AI Service: ${expense.toolName}`, 20, y);
        y += 10;
        doc.text(`Invoice / Receipt ID: ${expense.invoiceNumber || fileName}`, 20, y);
        y += 10;
        doc.text(`Payment Date: ${formatDate(expense.paymentDate)}`, 20, y);
        y += 10;
        doc.text(`Amount: NT$ ${expense.amountTWD.toLocaleString()}`, 20, y);
        y += 10;
        doc.text(`Payment Method: ${expense.paymentMethod || 'Credit Card (5401)'}`, 20, y);
        y += 10;
        doc.text(`Account / Email: ${expense.accountIdentifier || 'samantha@tier.org.tw'}`, 20, y);
        y += 10;
        doc.text(`Payer: ${expense.paidByName || 'Samantha'}`, 20, y);
        
        y += 15;
        doc.setDrawColor(203, 213, 225);
        doc.line(20, y, 190, y);

        y += 12;
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('This is an official digital expense voucher backup for audit and reimbursement.', 20, y);
        y += 7;
        doc.text(`Timestamp: ${new Date().toLocaleString('zh-TW')}`, 20, y);

        const targetDownloadName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
        doc.save(targetDownloadName);
      } catch (err) {
        console.error('Failed to generate PDF voucher:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-slate-900 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">{expense.toolName} - 憑證水單</h2>
              <p className="text-xs text-slate-500">
                扣款日期: {formatDate(expense.paymentDate)} · {expense.paymentMethod}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Upload or Replace File Button */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer shadow-xs">
              <Upload className="h-3.5 w-3.5" />
              <span>{expense.receiptUrl ? '替換原始檔案' : '上傳原始檔案 (PDF/圖片)'}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleDirectUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              title="下載 PDF / 圖片憑證檔案"
            >
              <Download className="h-3.5 w-3.5" />
              <span>下載憑證</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs px-6 py-2.5 flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>原始憑證檔案上傳成功！已同步儲存並連動單號。</span>
          </div>
        )}

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick Expense Highlights */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-slate-500 block">實付金額 (NT$)</span>
              <span className="text-xl font-black text-slate-900 font-mono tabular-nums">
                {formatTWD(expense.amountTWD)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">單號 / 上傳檔案名稱</span>
              <span className="text-sm font-bold text-indigo-700 font-mono break-all">
                {expense.invoiceNumber || expense.receiptName || fileName}
              </span>
            </div>
          </div>

          {/* Receipt Image / Document Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 min-h-[220px] flex flex-col justify-center">
            {expense.receiptUrl && !imageError ? (
              <div className="space-y-3">
                {isPdf ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <object
                      data={expense.receiptUrl}
                      type="application/pdf"
                      className="w-full h-80 rounded-xl border border-slate-200 shadow-xs"
                    >
                      <div className="text-center p-6 bg-white rounded-xl border border-slate-200 space-y-2">
                        <FileText className="h-10 w-10 text-indigo-500 mx-auto" />
                        <div className="font-bold text-slate-800">{fileName}</div>
                        <p className="text-slate-500 text-[11px]">PDF 檔案已備妥，請點擊下方按鈕直接預覽或下載</p>
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          新分頁開啟 PDF
                        </a>
                      </div>
                    </object>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={expense.receiptUrl}
                      alt="Receipt Preview"
                      onError={() => setImageError(true)}
                      className="max-h-96 w-auto object-contain rounded-xl shadow-sm border border-slate-200 bg-white"
                    />
                    <div className="mt-2 text-center text-slate-400 text-[11px] font-mono">
                      {fileName}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Formal Electronic Voucher Document Card */
              <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-sm block">電子支出憑證水單</span>
                      <span className="font-mono text-slate-400 text-[11px]">單號: {expense.invoiceNumber || fileName}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                    已核備憑證
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">服務名稱</span>
                    <span className="font-bold text-slate-800">{expense.toolName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">扣款日期</span>
                    <span className="font-bold text-slate-800 font-mono">{formatDate(expense.paymentDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">付款方式</span>
                    <span className="font-bold text-slate-800">{expense.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">扣款帳號</span>
                    <span className="font-bold text-slate-800 font-mono">{expense.accountIdentifier || 'samantha@tier.org.tw'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">支出金額</span>
                    <span className="font-black text-slate-900 text-sm font-mono">{formatTWD(expense.amountTWD)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">檔案標記</span>
                    <span className="font-bold text-indigo-600 font-mono break-all">{fileName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-400">
                    點擊右上角「下載憑證」即可直接下載正式 PDF 備查水單，亦可點選「上傳原始檔案」直接上傳原始 PDF/圖片存查。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            檔案名稱: <strong className="text-slate-700 font-mono">{fileName}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>下載憑證 (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              關閉預覽
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
