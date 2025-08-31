import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Aria",
  description: "AI Companion — Dashboard & Chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-background via-background to-muted text-foreground antialiased">
        <div className="relative min-h-screen">
          {/* Background decorative elements */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/3 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}