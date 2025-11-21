# Dev & QA CoPilot

AI trợ lý nội bộ giúp **Developer & QA**:

- Giải thích **code / SQL / log** và gợi ý hướng fix
- Tự sinh **Test Case** từ requirement
- Viết lại **email** cho PM / Client / nội bộ một cách lịch sự, rõ ràng

Project được tối ưu cho **setup nhanh, build nhanh, dễ hiểu** – rất hợp cho hackathon.

---

## ✨ Features

### 1. Explain & Fix

- Paste **code / SQL / log**
- Chọn loại nội dung + ngôn ngữ (VI / EN)
- AI:
    - Giải thích nội dung
    - Gợi ý cách sửa / tối ưu (tùy prompt bạn chỉnh)

### 2. Test Cases Generator

- Dán **requirement / ticket description**
- Chọn ngôn ngữ + tùy chọn **include boundary & negative cases**
- AI sinh ra danh sách test case:
    - ID, Title, Steps, Expected, Priority
- Nút **Copy as Markdown** để paste vào Jira / Confluence / Wiki

### 3. Email Helper

- Nhập **rough notes** (tiếng Việt + tiếng Anh thoải mái)
- Chọn **tone**:
    - Client (formal)
    - Manager (formal)
    - Internal (friendly)
- AI tạo:
    - **Subject**
    - **Body** email hoàn chỉnh
- Nút **Copy Body** để dùng ngay trong Outlook / Gmail

---

## 🧱 Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **React 19**
- **Mantine 8** (UI library)
- **SQLite** + **Drizzle ORM** + `better-sqlite3`
- **Mistral AI** (qua SDK `@mistralai/mistralai`)
- **Biome** cho lint & format

---

## 📁 Project Structure

```text
src/
├─ app/
│  ├─ api/
│  │  ├─ explain-fix/
│  │  │  └─ route.ts        # API: giải thích code/SQL/log
│  │  ├─ testcases/
│  │  │  └─ route.ts        # API: generate test cases
│  │  └─ email-helper/
│  │     └─ route.ts        # API: generate email
│  ├─ layout.tsx            # Root layout + Mantine styles
│  ├─ page.tsx              # Main page với 3 tabs
│  └─ providers.tsx         # MantineProvider + Notifications
├─ components/
│  ├─ layout/
│  │  └─ AppShell.tsx       # Header chung
│  ├─ explain/
│  │  └─ ExplainTab.tsx     # UI tab Explain & Fix
│  ├─ testcases/
│  │  └─ TestCasesTab.tsx   # UI tab Test Cases
│  └─ email/
│     └─ EmailHelperTab.tsx # UI tab Email Helper
├─ db/
│  ├─ client.ts             # Kết nối SQLite (better-sqlite3 + Drizzle)
│  └─ schema.ts             # Bảng ai_requests lưu history
├─ lib/
│  └─ ai.ts                 # Logic gọi Mistral + xử lý JSON
└─ types/
   └─ ai.ts                 # Type chung cho AI payload/response
```

---

## ⚙️ Requirements

- **Node.js** 20+ (khuyến nghị)
- **npm** (hoặc pnpm / yarn nếu bạn thích)

---

## 🚀 Setup & Run (Local)

### 1. Clone & install

```bash
git clone <your-repo-url> dev-qa-copilot
cd dev-qa-copilot

# Cài dependency
npm install
```

### 2. Tạo SQLite DB

Trong thư mục project, tạo thư mục `sqlite`:

**PowerShell (Windows):**

```powershell
New-Item -ItemType Directory -Path .\sqlite -Force | Out-Null
```

**macOS / Linux:**

```bash
mkdir -p sqlite
```

> File `sqlite/dev-qa-copilot.db` sẽ được tạo tự động khi migrate chạy.

### 3. Drizzle config

Đảm bảo file **\`drizzle.config.ts\`** (ở root) tồn tại và giống:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite/dev-qa-copilot.db",
  },
});
```

### 4. Chạy migrate

```bash
npm run db:push
```

Nếu thành công, Drizzle sẽ tạo bảng \`ai_requests\` trong SQLite.

### 5. Cấu hình AI (Mistral)

Tạo file **\`.env.local\`** ở root:

```env
MISTRAL_API_KEY=your_real_api_key_here
MISTRAL_MODEL=mistral-small-latest
```

> Nếu bạn **không** set \`MISTRAL_API_KEY\`, project vẫn chạy được với **mock response** (không gọi AI thật), dùng được cho demo/hackathon offline.

### 6. Chạy dev server

```bash
npm run dev
```

Mở trình duyệt:

```text
http://localhost:3000
```

Bạn sẽ thấy giao diện **Dev & QA CoPilot** với 3 tab: Explain & Fix, Test Cases, Email Helper.

---

## 🧪 Development scripts

```bash
# start dev server
npm run dev

# build production
npm run build

# start production build
npm run start

# lint với Biome
npm run lint

# format code với Biome
npm run format

# apply DB schema to SQLite
npm run db:push
```

---

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

- Next.js sẽ build app thành production bundle.
- SQLite DB (\`sqlite/dev-qa-copilot.db\`) nên được mount / copy cùng app trên server.
- API routes đang chạy với \`runtime = "nodejs"\` để hỗ trợ \`better-sqlite3\` và Mistral SDK.

---

## 📝 Notes

- Nếu **không có** \`MISTRAL_API_KEY\`:
    - Các API vẫn trả về dữ liệu **mock**:
        - Explain & Fix: text mock
        - Test Cases: 3 test case mẫu
        - Email Helper: email mock
- Khi thêm / đổi bảng:
    - Cập nhật \`src/db/schema.ts\`
    - Chạy lại \`npm run db:push\`

---

## 📌 Ideas / Future Improvements

- Lưu & hiển thị lịch sử các request theo user/session
- Thêm tab **Log Analyzer** (đặc biệt cho batch job / cron)
- Cho phép export test cases sang **Excel** trực tiếp
- Thêm authentication (nếu dùng trong nội bộ công ty)

---

## 💡 TL;DR (Setup siêu nhanh)

```bash
# 1. Clone & install
git clone <repo> dev-qa-copilot
cd dev-qa-copilot
npm install

# 2. Tạo thư mục DB
mkdir sqlite        # (hoặc PowerShell: New-Item -ItemType Directory -Path .\sqlite -Force)

# 3. Migrate schema
npm run db:push

# 4. (Optional) Cấu hình Mistral
echo "MISTRAL_API_KEY=your_key_here" > .env.local

# 5. Chạy dev
npm run dev
# open http://localhost:3000
```

Enjoy building with **Dev & QA CoPilot** 🎯
