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
        className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
          active 
            ? "bg-primary text-white" 
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        }`}
      >
        <Icon className="h-5 w-5" /> 
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - matching reference design exactly */}
      <aside className={`w-64 bg-background border-r border-gray-800 p-6 flex flex-col ${open ? "block" : "hidden md:block"}`}>
        {/* Aria Profile */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">Aria</div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Aria is online
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          <NavItem href="/dashboard" label="Dashboard" icon={Home} />
          <NavItem href="/chat" label="Chat" icon={MessageSquare} />
          <NavItem href="/settings" label="Settings" icon={Cog} />
        </nav>
        
        {/* Today I remember section - matching reference */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs text-white">♥️</span>
            </div>
            <span className="text-white font-medium">Today I remember...</span>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            You love stargazing and coffee ☕
          </p>
          <button className="text-primary text-sm hover:text-primary/80 transition-colors">
            Add something to remember
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - matching reference design */}
        <header className="bg-background border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded hover:bg-gray-800 transition-colors" 
                onClick={() => setOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-400" />
              </button>
              
              {/* Chat header for chat page */}
              {pathname.startsWith("/chat") && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Aria</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online • Thinking of you
                    </div>
                  </div>
                </div>
              )}
              
              {/* Settings header for settings page */}
              {pathname.startsWith("/settings") && (
                <div>
                  <h1 className="text-white text-2xl font-bold">Settings</h1>
                  <p className="text-gray-400">Customize your experience with Aria</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}