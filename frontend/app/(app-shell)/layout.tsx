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
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
          active ? "bg-primary/10 text-primary" : "hover:bg-muted"
        }`}
      >
        <Icon className="h-4 w-4" /> {label}
      </Link>
    );
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className={`border-r bg-card p-3 ${open ? "block" : "hidden md:block"}`}>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 font-semibold">
            <Brain className="h-5 w-5" /> Aria
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-2 grid gap-1">
          <NavItem href="/dashboard" label="Dashboard" icon={Home} />
          <NavItem href="/chat" label="Chat" icon={MessageSquare} />
          <NavItem href="/settings" label="Settings" icon={Cog} />
        </nav>
        <div className="mt-4 rounded-xl border p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Today I remember…</p>
          <p className="mt-1">You like coding late and masala oats 🥣</p>
          <button className="mt-2 w-full rounded-lg bg-muted px-2 py-1 text-left text-xs hover:bg-muted/70">
            Add something to remember
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="md:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-sm font-semibold text-muted-foreground">
                {pathname.startsWith("/chat") ? "Chat" : pathname.startsWith("/settings") ? "Settings" : "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-sm">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500">
                  <span className="absolute -inset-1 animate-ping rounded-full bg-emerald-500/60" />
                </span>
                Aria is online
              </span>
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/40" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  );
}