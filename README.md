# ZaloDat - Chat App

Ứng dụng chat realtime được xây dựng với **Next.js App Router** + **TypeScript** + **Supabase**.

## ✨ Tính năng

- 📝 Đăng ký / Đăng nhập / Đăng xuất (Supabase Auth)
- 💬 Chat realtime trong phòng chat chung
- 📷 Gửi và nhận hình ảnh (Supabase Storage)
- 📎 Gửi và nhận file (Supabase Storage)
- 😊 Emoji picker Unicode
- 👥 Hiển thị số người online (Supabase Presence)
- 🔔 Thông báo khi user mới tham gia
- 🌓 Dark / Light mode
- 📱 Responsive design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | TailwindCSS, shadcn/ui |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (Postgres Changes + Presence) |
| Storage | Supabase Storage |
| Deploy | Vercel |

## 🚀 Cài đặt

### 1. Clone repo

```bash
git clone <your-repo-url>
cd ZaloDat
npm install
```

### 2. Tạo Supabase Project

1. Vào [database.new](https://database.new) để tạo project mới
2. Lấy **Project URL** và **Anon Key** từ **Settings > API**

### 3. Cấu hình Environment

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 4. Chạy SQL Migration

1. Vào **Supabase Dashboard > SQL Editor**
2. Copy toàn bộ nội dung file `supabase/migration.sql`
3. Chạy query

### 5. Tạo Storage Bucket

1. Vào **Supabase Dashboard > Storage**
2. Tạo bucket mới tên **`chat-attachments`**, chọn **Public**
3. Thêm policy:
   - **Allow authenticated uploads**: operation = INSERT, role = authenticated
   - **Allow public reads**: operation = SELECT, role = public

### 6. Chạy local

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc dự án

```
ZaloDat/
├── app/
│   ├── auth/              # Auth pages (login, sign-up, ...)
│   ├── chat/
│   │   └── page.tsx       # Chat dashboard (server component)
│   ├── protected/         # Protected page (từ template)
│   ├── globals.css        # Global styles + custom theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── chat/
│   │   ├── ChatRoom.tsx   # Main chat + realtime subscription
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── EmojiPicker.tsx
│   │   └── FileUpload.tsx
│   ├── ui/                # shadcn/ui components
│   ├── login-form.tsx
│   ├── sign-up-form.tsx
│   └── ...
├── lib/
│   └── supabase/
│       ├── client.ts      # Browser Supabase client
│       └── server.ts      # Server Supabase client
├── supabase/
│   └── migration.sql      # Database schema
├── .env.local             # Environment variables
└── README.md
```

## 🌐 Deploy lên Vercel

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) > Import project
3. Thêm environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy!

## 📝 License

MIT
