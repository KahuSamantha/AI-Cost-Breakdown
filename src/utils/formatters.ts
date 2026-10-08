import { ExpenseRecord, ReimbursementBatch, ReimbursementOffset } from '../types';

export function formatTWD(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

export function formatOriginalCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
    TWD: 'NT$',
  };
  const sym = symbols[currency] || `${currency} `;
  const decimals = currency === 'JPY' || currency === 'TWD' ? 0 : 2;
  return `${sym}${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${currency}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

export function calculateExpenseAmounts(
  originalAmount: number,
  exchangeRate: number,
  hasForeignFee: boolean,
  foreignFeeRate: number = 0.015
) {
  const subtotalTWD = Math.round(originalAmount * exchangeRate);
  const foreignFeeTWD = hasForeignFee ? Math.round(subtotalTWD * foreignFeeRate) : 0;
  const amountTWD = subtotalTWD + foreignFeeTWD;

  return {
    subtotalTWD,
    foreignFeeTWD,
    amountTWD,
  };
}

/**
 * Export expense records to CSV with UTF-8 BOM for Microsoft Excel (Traditional Chinese)
 */
export function exportExpensesToCSV(expenses: ExpenseRecord[], filename = '品牌計畫_AI工具費用核銷清單.csv') {
  const headers = [
    '項目編號',
    '付款日期',
    'AI 工具名稱',
    '工具分類',
    '計費方式',
    '歸屬專案',
    '申請部門',
    '用途說明',
    '代墊人員',
    '付款卡別',
    '服務帳號/Email',
    '原幣幣別',
    '原幣金額',
    '匯率',
    '折合台幣',
    '海外手續費 (1.5%)',
    '實付台幣總計 (TWD)',
    '發票憑證編號',
    '統編狀態',
    '報銷審核狀態',
    '請款批號',
    '送審日期',
    '撥款日期',
  ];

  const statusMap: Record<string, string> = {
    draft: '草稿待送',
    submitted: '審核中',
    approved: '已核准',
    reimbursed: '已撥款',
    rejected: '已駁回',
  };

  const taxIdMap: Record<string, string> = {
    with_tax_id: '有統編',
    personal_receipt: '個人/海外收據',
    no_tax_id: '無統編收據',
  };

  const rows = expenses.map((item) => [
    item.id,
    item.paymentDate,
    `"${(item.toolName || '').replace(/"/g, '""')}"`,
    item.toolCategory,
    item.billingType,
    `"${(item.projectName || '').replace(/"/g, '""')}"`,
    `"${(item.department || '').replace(/"/g, '""')}"`,
    `"${(item.description || '').replace(/"/g, '""')}"`,
    item.paidByName,
    `"${(item.paymentMethod || '').replace(/"/g, '""')}"`,
    item.accountIdentifier,
    item.currency,
    item.originalAmount,
    item.exchangeRate,
    item.subtotalTWD,
    item.foreignFeeTWD,
    item.amountTWD,
    `"${(item.invoiceNumber || '').replace(/"/g, '""')}"`,
    taxIdMap[item.taxIdStatus] || item.taxIdStatus,
    statusMap[item.reimbursementStatus] || item.reimbursementStatus,
    item.batchId || '-',
    item.submittedDate || '-',
    item.reimbursedDate || '-',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // Prepend UTF-8 BOM so Excel opens Traditional Chinese characters correctly without garbled symbols
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
