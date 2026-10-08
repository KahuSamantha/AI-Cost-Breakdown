# AI-Cost-Breakdown

品牌計畫 AI工具費用核銷系統 (台灣經濟研究院)

個人專用之品牌計畫 AI 工具訂閱、API 費用與車資核銷紀錄管理系統。

## 主要功能

- **AI 工具支出明細管理**：紀錄各項 AI 工具（Perplexity Pro, Claude Pro, Gemini API, ChatGPT Plus 等）消費金額、外幣幣別、匯率換算及憑證。
- **核銷紀錄管理**：統整各項支出之車資證明、電子收據與核銷折抵紀錄，支援由新到舊自動排序。
- **統計儀表板**：即時掌握累計 AI 支出總額、已沖銷/核銷金額及尚餘未核銷金額。
- **匯出報表**：支援匯出標準 CSV 核銷明細清單。

## 技術架構

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: LocalStorage 持久化儲存

## 本地開發

```bash
npm install
npm run dev
```
