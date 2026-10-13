import { ExpenseRecord, ReimbursementBatch, UserProfile, ReimbursementOffset } from '../types';

const EXPENSES_STORAGE_KEY = 'ai_expense_records_v5';
const BATCHES_STORAGE_KEY = 'ai_reimbursement_batches_v5';
const PROFILE_STORAGE_KEY = 'ai_reimbursement_profile_v5';
const OFFSETS_STORAGE_KEY = 'ai_reimbursement_offsets_v6';

// 台灣經濟研究院 AI專案核銷紀錄 (由新到舊排序)
export const INITIAL_OFFSETS: ReimbursementOffset[] = [
  {
    id: 'OFFSET-20261008',
    date: '2026-10-08',
    title: '拜訪廠商',
    offsetType: 'taxi',
    amountTWD: 980,
    origin: '台經院',
    destination: '南港',
    status: 'reimbursed',
    notes: '外勤計程車單抵充',
    createdAt: '2026-10-08T09:00:00.000Z',
  },
  {
    id: 'OFFSET-20261005',
    date: '2026-10-05',
    title: '拜訪廠商',
    offsetType: 'taxi',
    amountTWD: 650,
    origin: '台經院',
    destination: '大安',
    status: 'reimbursed',
    notes: '外勤計程車單抵充',
    createdAt: '2026-10-05T09:00:00.000Z',
  },
  {
    id: 'OFFSET-20261002',
    date: '2026-10-02',
    title: '企業參訪',
    offsetType: 'taxi',
    amountTWD: 890,
    origin: '台經院',
    destination: '關渡',
    status: 'reimbursed',
    notes: '外勤計程車單抵充',
    createdAt: '2026-10-02T09:00:00.000Z',
  },
  {
    id: 'OFFSET-20260930',
    date: '2026-09-30',
    title: 'AI 專家會議',
    offsetType: 'taxi',
    amountTWD: 650,
    origin: '台經院',
    destination: '信義',
    status: 'reimbursed',
    notes: '外勤計程車單抵充',
    createdAt: '2026-09-30T09:00:00.000Z',
  },
  {
    id: 'OFFSET-20260923',
    date: '2026-09-23',
    title: 'AI 工具會議',
    offsetType: 'taxi',
    amountTWD: 907,
    origin: '台經院',
    destination: '永和',
    status: 'reimbursed',
    notes: '外勤計程車單抵充',
    createdAt: '2026-09-23T09:00:00.000Z',
  },
  {
    id: 'OFFSET-20260921',
    date: '2026-09-21',
    title: '參與AI應用論壇',
    offsetType: 'taxi',
    amountTWD: 720,
    origin: '台經院',
    destination: '基隆路',
    status: 'reimbursed',
    notes: '外勤計程車單抵充',
    createdAt: '2026-09-21T09:00:00.000Z',
  },
  {
    id: 'OFFSET-20260916',
    date: '2026-09-16',
    title: '拜訪廠商',
    offsetType: 'taxi',
    amountTWD: 420,
    origin: '台經院',
    destination: '漢口街',
    status: 'reimbursed',
    notes: '外勤計程車單抵充',
    createdAt: '2026-09-16T09:00:00.000Z',
  },
  {
    id: 'OFFSET-20260908',
    date: '2026-09-08',
    title: '大合新階段性會議',
    offsetType: 'taxi',
    amountTWD: 566,
    origin: '台經院',
    destination: '育凱(士林)',
    status: 'reimbursed',
    notes: '外勤計程車單抵充',
    createdAt: '2026-09-08T09:00:00.000Z',
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Samantha',
  department: 'AI專案',
  employeeId: 'TIER-BRAND',
  defaultPaymentMethod: '國泰 CUBE 卡 (5401)',
  companyName: '台灣經濟研究院',
  companyTaxId: '04149909',
  defaultExchangeRateUSD: 32.50,
};

// 台灣經濟研究院 AI 支出明細：由新到舊排序
export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'EXP-20260922-GEMINI',
    toolName: 'Gemini API',
    toolCategory: 'llm_api',
    billingType: 'pay_as_you_go',
    projectName: 'AI專案',
    department: 'AI專案',
    description: 'Gemini API 用量扣款',
    paidByName: 'Samantha',
    paymentMethod: '國泰 CUBE 卡 (5401)',
    accountIdentifier: 'samantha@tier.org.tw',
    paymentDate: '2026-09-22',
    periodStart: '2026-09-22',
    currency: 'TWD',
    originalAmount: 150,
    exchangeRate: 1.0,
    hasForeignFee: false,
    foreignFeeRate: 0,
    foreignFeeTWD: 0,
    subtotalTWD: 150,
    amountTWD: 150,
    invoiceNumber: 'GOOGLE-CLOUD-0922',
    taxIdStatus: 'personal_receipt',
    receiptName: 'Gemini_API_Invoice.pdf',
    reimbursementStatus: 'draft',
    batchId: 'EXP-2026-09',
    submittedDate: '2026-09-22',
    reimbursementNote: '國內新台幣計費 NT$ 150',
    createdAt: '2026-09-22T09:00:00.000Z',
    updatedAt: '2026-09-22T09:00:00.000Z',
  },
  {
    id: 'EXP-20260922-CLAUDE',
    toolName: '9月 Claude pro 訂閱',
    toolCategory: 'chat_assistant',
    billingType: 'monthly_subscription',
    projectName: 'AI專案',
    department: 'AI專案',
    description: '9月份 Claude Pro 個人專業版訂閱 (21 USD 含附加額度)',
    paidByName: 'Samantha',
    paymentMethod: '國泰 CUBE 卡 (5401)',
    accountIdentifier: 'samantha@tier.org.tw',
    paymentDate: '2026-09-22',
    periodStart: '2026-09-22',
    periodEnd: '2026-10-21',
    currency: 'USD',
    originalAmount: 21.00,
    exchangeRate: 31.76,
    hasForeignFee: true,
    foreignFeeRate: 0.015,
    foreignFeeTWD: 10,
    subtotalTWD: 657,
    amountTWD: 667,
    invoiceNumber: 'INV-CLAUDE-202609',
    taxIdStatus: 'personal_receipt',
    receiptName: 'Claude_Pro_Sept.pdf',
    reimbursementStatus: 'draft',
    batchId: 'EXP-2026-09',
    submittedDate: '2026-09-22',
    reimbursementNote: '應核銷 NT$ 667',
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z',
  },
  {
    id: 'EXP-20260921-PPLX-API',
    toolName: 'PERPLEXITY API',
    toolCategory: 'llm_api',
    billingType: 'pay_as_you_go',
    projectName: 'AI專案',
    department: 'AI專案',
    description: 'PERPLEXITY API 呼叫額度儲值',
    paidByName: 'Samantha',
    paymentMethod: '國泰 CUBE 卡 (5401)',
    accountIdentifier: 'samantha@tier.org.tw',
    paymentDate: '2026-09-21',
    periodStart: '2026-09-21',
    currency: 'USD',
    originalAmount: 10.05,
    exchangeRate: 31.74,
    hasForeignFee: true,
    foreignFeeRate: 0.015,
    foreignFeeTWD: 5,
    subtotalTWD: 314,
    amountTWD: 319,
    invoiceNumber: 'INV-PPLX-API-0921',
    taxIdStatus: 'personal_receipt',
    receiptName: 'Perplexity_API_Receipt.png',
    reimbursementStatus: 'draft',
    batchId: 'EXP-2026-09',
    submittedDate: '2026-09-22',
    reimbursementNote: '含海外手續費 NT$ 319',
    createdAt: '2026-09-21T14:30:00.000Z',
    updatedAt: '2026-09-22T08:00:00.000Z',
  },
  {
    id: 'EXP-20260910-PPLX-PRO',
    toolName: 'PERPLEXITY Pro Subscription',
    toolCategory: 'chat_assistant',
    billingType: 'annual_subscription',
    projectName: 'AI專案',
    department: 'AI專案',
    description: 'PERPLEXITY Pro 年繳方案 (服務週期: 2026/9/10 - 2027/9/10)',
    paidByName: 'Samantha',
    paymentMethod: '國泰 CUBE 卡 (5401)',
    accountIdentifier: 'samantha@tier.org.tw',
    paymentDate: '2026-09-10',
    periodStart: '2026-09-10',
    periodEnd: '2027-09-10',
    currency: 'USD',
    originalAmount: 200.00,
    exchangeRate: 32.83,
    hasForeignFee: true,
    foreignFeeRate: 0.015,
    foreignFeeTWD: 97,
    subtotalTWD: 6469,
    amountTWD: 6566,
    invoiceNumber: 'INV-PPLX-20260910',
    taxIdStatus: 'personal_receipt',
    receiptName: 'Perplexity_Annual_Invoice.pdf',
    reimbursementStatus: 'submitted',
    batchId: 'EXP-2026-09',
    submittedDate: '2026-09-22',
    reimbursementNote: '含1.5%海外交易手續費 NT$ 6,566',
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-22T08:00:00.000Z',
  },
  {
    id: 'EXP-20260822-CLAUDE',
    toolName: '8月 Claude pro 訂閱',
    toolCategory: 'llm_api',
    billingType: 'monthly_subscription',
    projectName: 'AI專案',
    department: 'AI專案',
    description: '8月份 Claude Pro 個人專業版訂閱 (20 USD)',
    paidByName: 'Samantha',
    paymentMethod: '國泰 CUBE 卡 (5401)',
    accountIdentifier: 'samantha@tier.org.tw',
    paymentDate: '2026-08-22',
    periodStart: '2026-08-22',
    periodEnd: '2026-09-21',
    currency: 'USD',
    originalAmount: 20.00,
    exchangeRate: 31.85,
    hasForeignFee: true,
    foreignFeeRate: 0.015,
    foreignFeeTWD: 9,
    subtotalTWD: 628,
    amountTWD: 637,
    invoiceNumber: 'INV-CLAUDE-202608',
    taxIdStatus: 'personal_receipt',
    receiptName: 'Claude_Pro_Aug.pdf',
    reimbursementStatus: 'approved',
    batchId: 'EXP-2026-Q3B',
    submittedDate: '2026-08-25',
    reimbursementNote: '應核銷 NT$ 637，核准待撥',
    createdAt: '2026-08-22T10:00:00.000Z',
    updatedAt: '2026-08-30T12:00:00.000Z',
  },
  {
    id: 'EXP-20260722-CLAUDE',
    toolName: '7月 Claude pro 訂閱',
    toolCategory: 'llm_api',
    billingType: 'monthly_subscription',
    projectName: 'AI專案',
    department: 'AI專案',
    description: '7月份 Claude Pro 個人專業版訂閱 (20 USD)',
    paidByName: 'Samantha',
    paymentMethod: '國泰 CUBE 卡 (5401)',
    accountIdentifier: 'samantha@tier.org.tw',
    paymentDate: '2026-07-22',
    periodStart: '2026-07-22',
    periodEnd: '2026-08-21',
    currency: 'USD',
    originalAmount: 20.00,
    exchangeRate: 31.85,
    hasForeignFee: true,
    foreignFeeRate: 0.015,
    foreignFeeTWD: 9,
    subtotalTWD: 628,
    amountTWD: 637,
    invoiceNumber: 'INV-CLAUDE-202607',
    taxIdStatus: 'personal_receipt',
    receiptName: 'Claude_Pro_July.pdf',
    reimbursementStatus: 'draft',
    batchId: 'EXP-2026-Q3A',
    submittedDate: '2026-07-25',
    reimbursementNote: '應核銷 NT$ 637',
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-25T12:00:00.000Z',
  },
  {
    id: 'EXP-20260622-CLAUDE',
    toolName: '6月 Claude pro 訂閱',
    toolCategory: 'llm_api',
    billingType: 'monthly_subscription',
    projectName: 'AI專案',
    department: 'AI專案',
    description: '6月份 Claude Pro 個人專業版訂閱 (20 USD)',
    paidByName: 'Samantha',
    paymentMethod: '國泰 CUBE 卡 (5401)',
    accountIdentifier: 'samantha@tier.org.tw',
    paymentDate: '2026-06-22',
    periodStart: '2026-06-22',
    periodEnd: '2026-07-21',
    currency: 'USD',
    originalAmount: 20.00,
    exchangeRate: 31.85,
    hasForeignFee: true,
    foreignFeeRate: 0.015,
    foreignFeeTWD: 9,
    subtotalTWD: 628,
    amountTWD: 637,
    invoiceNumber: 'INV-CLAUDE-202606',
    taxIdStatus: 'personal_receipt',
    receiptName: 'Claude_Pro_June.pdf',
    reimbursementStatus: 'draft',
    batchId: 'EXP-2026-Q2',
    submittedDate: '2026-06-25',
    reimbursementNote: '應核銷 NT$ 637',
    createdAt: '2026-06-22T10:00:00.000Z',
    updatedAt: '2026-06-25T12:00:00.000Z',
  },
  {
    id: 'EXP-20260522-CLAUDE',
    toolName: '5月 Claude Pro 訂閱',
    toolCategory: 'llm_api',
    billingType: 'monthly_subscription',
    projectName: 'AI專案',
    department: 'AI專案',
    description: '5月份 Claude Pro 個人專業版訂閱 (20 USD)',
    paidByName: 'Samantha',
    paymentMethod: '國泰 CUBE 卡 (5401)',
    accountIdentifier: 'samantha@tier.org.tw',
    paymentDate: '2026-05-22',
    periodStart: '2026-05-22',
    periodEnd: '2026-06-21',
    currency: 'USD',
    originalAmount: 20.00,
    exchangeRate: 32.35,
    hasForeignFee: true,
    foreignFeeRate: 0.015,
    foreignFeeTWD: 10,
    subtotalTWD: 637,
    amountTWD: 647,
    invoiceNumber: 'INV-CLAUDE-202605',
    taxIdStatus: 'personal_receipt',
    receiptName: 'Claude_Pro_May.pdf',
    reimbursementStatus: 'draft',
    batchId: 'EXP-2026-Q2',
    submittedDate: '2026-05-25',
    reimbursementNote: '應核銷 NT$ 647',
    createdAt: '2026-05-22T10:00:00.000Z',
    updatedAt: '2026-05-25T12:00:00.000Z',
  },
];

export const INITIAL_BATCHES: ReimbursementBatch[] = [
  {
    id: 'EXP-BATCH-202609',
    batchNumber: 'EXP-2026-09',
    title: '台灣經濟研究院 AI專案 9月份 AI 工具核銷申請 (Perplexity Pro、Claude Pro、Gemini API)',
    applicantName: 'Samantha',
    applicantDepartment: 'AI專案',
    companyName: '台灣經濟研究院',
    companyTaxId: '04149909',
    expenseIds: [
      'EXP-PERPLEXITY-202609',
      'EXP-REFILL-20260921',
      'EXP-GEMINI-20260923',
      'EXP-CLAUDE-202609',
    ],
    totalAmountTWD: 7702,
    totalOriginalUSD: 231.05,
    status: 'submitted',
    submissionDate: '2026-09-22',
    targetPayoutDate: '2026-09-30',
    notes: '台灣經濟研究院 AI專案 AI 工具與 API 額度核銷請款單。',
    createdAt: '2026-09-22T08:00:00.000Z',
  },
];

// 輔助排序函式：確保所有日期由新到舊 (Descending)
export function sortOffsetsByDateDesc(list: ReimbursementOffset[]): ReimbursementOffset[] {
  return [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function sortExpensesByDateDesc(list: ExpenseRecord[]): ExpenseRecord[] {
  return [...list].sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
}

// 嚴格過濾函式：確保移除任何 7/5、8/5 會計沖銷
export function filterOutUnwantedOffsets(list: ReimbursementOffset[]): ReimbursementOffset[] {
  return list.filter((item) => {
    if (!item) return false;
    if (item.date === '2026-07-05' || item.date === '2026-08-05') return false;
    if (item.id === 'OFFSET-ACC-0705' || item.id === 'OFFSET-ACC-0805') return false;
    if (item.title && (item.title.includes('7/5') || item.title.includes('8/5') || (item.title.includes('會計') && (item.title.includes('6月') || item.title.includes('7月'))))) {
      return false;
    }
    return true;
  });
}

export function getStoredExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return sortExpensesByDateDesc(parsed);
      }
    }
    const initialSorted = sortExpensesByDateDesc(INITIAL_EXPENSES);
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(initialSorted));
    return initialSorted;
  } catch (err) {
    console.error('Failed to parse expenses from localStorage', err);
    return sortExpensesByDateDesc(INITIAL_EXPENSES);
  }
}

export function saveStoredExpenses(expenses: ExpenseRecord[]): void {
  try {
    const sorted = sortExpensesByDateDesc(expenses);
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.error('Failed to save expenses to localStorage', err);
  }
}

export function getStoredBatches(): ReimbursementBatch[] {
  try {
    const raw = localStorage.getItem(BATCHES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(INITIAL_BATCHES));
      return INITIAL_BATCHES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse batches from localStorage', err);
    return INITIAL_BATCHES;
  }
}

export function saveStoredBatches(batches: ReimbursementBatch[]): void {
  try {
    localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(batches));
  } catch (err) {
    console.error('Failed to save batches to localStorage', err);
  }
}

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    // 自動更新舊版陳志遠為 Samantha
    if (parsed.name && (parsed.name.includes('陳志遠') || parsed.name.includes('Alex'))) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse profile from localStorage', err);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
}

export function getStoredOffsets(): ReimbursementOffset[] {
  try {
    const raw = localStorage.getItem(OFFSETS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = filterOutUnwantedOffsets(parsed);
        const normalized = cleaned.map((item) => {
          return {
            ...item,
            origin: item.origin || (item.offsetType === 'taxi' ? '台經院' : '-'),
            destination: item.destination || (item.offsetType === 'taxi' ? '外勤公務地點' : '-'),
          };
        });
        const sorted = sortOffsetsByDateDesc(normalized);
        return sorted;
      }
    }

    const defaultSorted = sortOffsetsByDateDesc(INITIAL_OFFSETS);
    localStorage.setItem(OFFSETS_STORAGE_KEY, JSON.stringify(defaultSorted));
    return defaultSorted;
  } catch (err) {
    console.error('Failed to parse offsets from localStorage', err);
    return sortOffsetsByDateDesc(INITIAL_OFFSETS);
  }
}

export function saveStoredOffsets(offsets: ReimbursementOffset[]): void {
  try {
    const cleaned = filterOutUnwantedOffsets(offsets);
    const sorted = sortOffsetsByDateDesc(cleaned);
    localStorage.setItem(OFFSETS_STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.error('Failed to save offsets to localStorage', err);
  }
}

export function resetOffsetsToDefault(): ReimbursementOffset[] {
  try {
    const defaultSorted = sortOffsetsByDateDesc(INITIAL_OFFSETS);
    localStorage.setItem(OFFSETS_STORAGE_KEY, JSON.stringify(defaultSorted));
    return defaultSorted;
  } catch (err) {
    console.error('Failed to reset offsets to default', err);
    return sortOffsetsByDateDesc(INITIAL_OFFSETS);
  }
}

export function scanAllLocalStorageForRecovery(): {
  recoveredOffsets: ReimbursementOffset[];
  recoveredExpenses: ExpenseRecord[];
  draftOffset: Partial<ReimbursementOffset> | null;
} {
  const result = {
    recoveredOffsets: [] as ReimbursementOffset[],
    recoveredExpenses: [] as ExpenseRecord[],
    draftOffset: null as Partial<ReimbursementOffset> | null,
  };

  try {
    const keysToCheck = [
      'ai_reimbursement_offsets_v6',
      'ai_reimbursement_offsets_v5',
      'ai_reimbursement_offsets_v4',
      'ai_reimbursement_offsets_v3',
    ];
    const offsetIds = new Set<string>();
    for (const k of keysToCheck) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const cleaned = filterOutUnwantedOffsets(list);
            for (const item of cleaned) {
              if (item && item.id && !offsetIds.has(item.id)) {
                offsetIds.add(item.id);
                result.recoveredOffsets.push(item);
              }
            }
          }
        } catch {}
      }
    }

    result.recoveredOffsets = sortOffsetsByDateDesc(result.recoveredOffsets);

    const expKeys = ['ai_expense_records_v5', 'ai_expense_records_v4', 'ai_expense_records_v3'];
    const expIds = new Set<string>();
    for (const k of expKeys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item && item.id && !expIds.has(item.id)) {
                expIds.add(item.id);
                result.recoveredExpenses.push(item);
              }
            }
          }
        } catch {}
      }
    }

    result.recoveredExpenses = sortExpensesByDateDesc(result.recoveredExpenses);

    const draftRaw = localStorage.getItem('ai_offset_draft');
    if (draftRaw) {
      try {
        result.draftOffset = JSON.parse(draftRaw);
      } catch {}
    }
  } catch (e) {
    console.error('Scan error', e);
  }

  return result;
}

export function resetAllDataToDefault(): void {
  const sortedExpenses = sortExpensesByDateDesc(INITIAL_EXPENSES);
  const sortedOffsets = sortOffsetsByDateDesc(INITIAL_OFFSETS);
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(sortedExpenses));
  localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(INITIAL_BATCHES));
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
  localStorage.setItem(OFFSETS_STORAGE_KEY, JSON.stringify(sortedOffsets));
}

export function clearAllDataToEmpty(): void {
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(OFFSETS_STORAGE_KEY, JSON.stringify([]));
}
