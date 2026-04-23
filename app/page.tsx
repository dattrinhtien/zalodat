import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/chat");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-cyan-900/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-8 p-8 max-w-lg text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            ZaloDat
          </h1>
        </div>

        <p className="text-muted-foreground text-lg leading-relaxed">
          Ứng dụng chat realtime. Gửi tin nhắn, hình ảnh và file ngay lập tức.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/auth/login"
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-center"
          >
            Đăng nhập
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-8 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-accent transition-colors text-center"
          >
            Đăng ký
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">💬</span> Chat realtime
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">📷</span> Gửi hình ảnh
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">📎</span> Gửi file
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">😊</span> Emoji
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Powered by Supabase + Next.js</span>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
