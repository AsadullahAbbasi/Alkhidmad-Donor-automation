import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blood Donor Matcher | Al-Khidmat Foundation",
  description: "Real-time blood donor finder for Karachi that matches hospital requests with eligible donors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="header-inner">
            <div className="header-brand">
              <div className="brand-icon">🩸</div>
              <div className="brand-text">
                <h1>Blood Donor Matcher</h1>
                <span>Al-Khidmat Foundation Karachi</span>
              </div>
            </div>
            <div className="header-badge">
              <span className="live-dot" />
              Live Blood Grid
            </div>
          </div>
        </header>

        <main className="main-container">
          {children}
        </main>

        <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5 mt-auto">
          <p>© 2026 Al-Khidmat Foundation Karachi. Build with AI Hackathon.</p>
        </footer>
      </body>
    </html>
  );
}
