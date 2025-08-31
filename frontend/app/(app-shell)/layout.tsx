"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, MessageSquare, Cog, Brain } from "lucide-react";
import { useState } from "react";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
          active 
            ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/10 border border-primary/20" 
            : "hover:bg-card/50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        <Icon className={`h-5 w-5 transition-transform duration-200 ${
          active ? "scale-110" : "group-hover:scale-110"
        }`} /> 
        <span className="font-semibold">{label}</span>
        {active && (
          <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </Link>
    );
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className={`glass border-r border-border/50 p-4 backdrop-blur-xl ${open ? "block" : "hidden md:block"}`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3 font-bold text-lg">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 text-primary/30 animate-ping" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Aria
            </span>
          </div>
          <button 
            className="md:hidden p-2 rounded-xl hover:bg-card/50 transition-colors" 
            onClick={() => setOpen(false)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-6 space-y-2">
          <NavItem href="/dashboard" label="Dashboard" icon={Home} />
          <NavItem href="/chat" label="Chat" icon={MessageSquare} />
          <NavItem href="/settings" label="Settings" icon={Cog} />
        </nav>
        <div className="mt-8 glass rounded-2xl p-4 text-sm border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
            <p className="font-semibold text-foreground">Today I remember…</p>
          </div>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            You like coding late and masala oats 🥣
          </p>
          <button className="w-full rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            Add something to remember
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-border/30 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 rounded-xl hover:bg-card/50 transition-colors" 
                onClick={() => setOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {pathname.startsWith("/chat") ? "Chat" : pathname.startsWith("/settings") ? "Settings" : "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-500/20">
                <div className="relative">
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500">
                    <span className="absolute -inset-1 animate-ping rounded-full bg-emerald-500/60" />
                  </span>
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Aria is online
                </span>
              </div>
              <div className="relative group">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-primary/80 to-secondary shadow-lg ring-2 ring-primary/20 transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/20" />
                <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-md group-hover:blur-lg transition-all duration-200" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}