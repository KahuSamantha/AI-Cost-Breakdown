export type Currency = 'USD' | 'TWD' | 'EUR' | 'JPY' | 'GBP';

export type BillingType = 
  | 'monthly_subscription'  // 按月訂閱
  | 'annual_subscription'   // 年繳方案
  | 'pay_as_you_go'         // 依用量 / 隨選儲值
  | 'one_time';             // 單次購買

export type ToolCategory = 
  | 'llm_api'              // LLM / API 模型
  | 'coding_assistant'     // 程式開發輔助 (Cursor, Copilot 等)
  | 'chat_assistant'       // 對話助理 (ChatGPT, Claude, Perplexity 等)
  | 'image_gen'            // 圖像生成 (Midjourney 等)
  | 'voice_audio'          // 語音音訊 (ElevenLabs 等)
  | 'infrastructure'       // AI 算力基礎設施 (AWS Bedrock, Replicate)
  | 'other';               // 其他 AI 服務

export type ReimbursementStatus = 
  | 'draft'       // 草稿待送
  | 'submitted'   // 已送出審核中
  | 'approved'    // 主管已核准
  | 'reimbursed'  // 已放款撥款
  | 'rejected';   // 駁回修正

export type TaxIdStatus = 
  | 'with_tax_id'       // 有開立統編
  | 'personal_receipt'  // 海外收據/無統編
  | 'no_tax_id';        // 一般收據

export interface ExpenseRecord {
  id: string;
  toolName: string;                     // 工具名稱 (例如 OpenAI API)
  toolCategory: ToolCategory;           // 工具類別
  billingType: BillingType;             // 計費週期
  projectName: string;                  // 歸屬專案名稱 (例如 AI 客服系統)
  department: string;                   // 申請部門
  description: string;                  // 費用用途說明
  paidByName: string;                   // 代墊人姓名
  paymentMethod: string;                // 支付卡別 (例如 國泰 CUBE 卡 2394)
  accountIdentifier: string;            // 服務帳號/Email (例如 team-ai@corp.com)
  paymentDate: string;                  // 扣款日期 (YYYY-MM-DD)
  periodStart?: string;                 // 服務週期開始
  periodEnd?: string;                   // 服務週期結束
  
  // 金額與匯率計算
  currency: Currency;                   // 原幣幣別
  originalAmount: number;               // 原幣金額 (例如 20.00)
  exchangeRate: number;                 // 換算匯率 (例如 32.2)
  hasForeignFee: boolean;               // 是否加計海外手續費 (1.5%)
  foreignFeeRate: number;               // 海外手續費率 (預設 0.015)
  foreignFeeTWD: number;                // 手續費台幣金額
  subtotalTWD: number;                  // 台幣本金 (originalAmount * exchangeRate)
  amountTWD: number;                    // 實付台幣總額 (subtotalTWD + foreignFeeTWD)
  
  // 發票憑證
  invoiceNumber: string;                // Invoice/憑證號碼
  taxIdStatus: TaxIdStatus;             // 統編狀態
  receiptUrl?: string;                  // 憑證圖片/PDF (base64 或 URL)
  receiptName?: string;                 // 憑證檔名
  
  // 報銷狀態
  reimbursementStatus: ReimbursementStatus;
  batchId?: string;                     // 關聯請款批號 (例如 EXP-202609-01)
  submittedDate?: string;               // 提出送審日期
  reimbursedDate?: string;              // 實際入帳日期
  reimbursementNote?: string;           // 財務審核備註
  
  createdAt: string;
  updatedAt: string;
}

export interface ReimbursementBatch {
  id: string;
  batchNumber: string;                  // 請款批號 (例如 EXP-202609-01)
  title: string;                        // 請款主題
  applicantName: string;                // 申請人姓名
  applicantDepartment: string;          // 申請部門
  companyName: string;                  // 公司抬頭
  companyTaxId: string;                 // 公司統一編號
  expenseIds: string[];                 // 包含的支出項目 ID 清單
  totalAmountTWD: number;               // 請款總金額 (TWD)
  totalOriginalUSD: number;             // 美元累計
  status: 'draft' | 'submitted' | 'approved' | 'reimbursed';
  submissionDate: string;               // 送審日期
  targetPayoutDate?: string;            // 預計撥款日
  actualPayoutDate?: string;            // 實際撥款日
  managerName?: string;                 // 核准主管
  financeName?: string;                 // 審核財務
  notes?: string;                       // 請款事由及補充說明
  createdAt: string;
}

export interface UserProfile {
  name: string;
  department: string;
  employeeId?: string;
  defaultPaymentMethod: string;
  companyName: string;
  companyTaxId: string;
  defaultExchangeRateUSD: number;
}

export interface AIToolPreset {
  name: string;
  category: ToolCategory;
  billingType: BillingType;
  defaultCurrency: Currency;
  typicalAmount: number;
  description: string;
  vendorName: string;
}

export type OffsetType = 
  | 'accounting'      // 會計出納直接報銷撥款
  | 'taxi'            // 計程車車資沖銷
  | 'travel'          // 國內外出差交通沖銷
  | 'meal_entertain'  // 業務餐費沖銷
  | 'office_supplies' // 文具雜項沖銷
  | 'direct_claim'    // 一般直接請款
  | 'other';          // 其他代墊沖銷

export interface ReimbursementOffset {
  id: string;
  date: string;               // 沖銷日期 (YYYY-MM-DD)
  title: string;              // 沖銷事由 (例如 9/8 計程車單據沖銷)
  offsetType: OffsetType;     // 沖銷方式
  amountTWD: number;          // 沖銷金額 (TWD)
  targetExpenseId?: string;   // 針對哪一筆 AI 支出沖銷 (選填)
  targetExpenseName?: string; // 針對工具名稱 (例如 Perplexity Pro)
  receiptProof?: string;      // 憑證編號或附註
  status: 'claimed' | 'reimbursed'; // 沖銷狀態
  notes?: string;             // 說明
  createdAt: string;
}
