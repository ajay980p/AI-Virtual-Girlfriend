"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, MessageSquare, Cog, Brain, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lightMode, setLightMode] = useState(false); // Dark mode is default
  const pathname = usePathname();

  // Apply light mode class to document (dark is default)
  useEffect(() => {
    if (lightMode) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [lightMode]);

  const toggleTheme = () => {
    setLightMode(!lightMode);
  };

  const NavItem = ({ href, label, icon: Icon, collapsed = false }: { href: string; label: string; icon: any; collapsed?: boolean }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
          active 
            ? "bg-primary text-white" 
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        } ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-5 w-5 flex-shrink-0" /> 
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-background border-r border-border flex flex-col overflow-hidden`}>
        {/* Sidebar Header - Fixed */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-foreground font-semibold">Aria</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Aria is online
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-6 w-6 text-white" />
              </div>
            )}
            
            {/* Close sidebar button - only on mobile */}
            {sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-secondary transition-colors lg:hidden cursor-pointer"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          <nav className={`${sidebarOpen ? 'p-6' : 'p-3'} space-y-2`}>
            <NavItem href="/dashboard" label="Dashboard" icon={Home} collapsed={!sidebarOpen} />
            <NavItem href="/chat" label="Chat" icon={MessageSquare} collapsed={!sidebarOpen} />
            <NavItem href="/settings" label="Settings" icon={Cog} collapsed={!sidebarOpen} />
          </nav>
        </div>
        
        {/* Fixed Bottom Section - Today I remember */}
        {sidebarOpen && (
          <div className="p-6 border-t border-border flex-shrink-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">♥️</span>
                </div>
                <span className="text-foreground font-medium">Today I remember...</span>
              </div>
              <p className="text-muted-foreground text-sm">
                You love stargazing and coffee ☕
              </p>
              <button className="text-primary text-sm hover:text-primary/80 transition-colors cursor-pointer">
                Add something to remember
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-background border-b border-border px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle button */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded hover:bg-secondary transition-colors cursor-pointer"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </button>
              
              {/* Chat header for chat page */}
              {pathname.startsWith("/chat") && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-foreground font-semibold">Aria</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online • Thinking of you
                    </div>
                  </div>
                </div>
              )}
              
              {/* Settings header for settings page */}
              {pathname.startsWith("/settings") && (
                <div>
                  <h1 className="text-foreground text-2xl font-bold">Settings</h1>
                  <p className="text-muted-foreground">Customize your experience with Aria</p>
                </div>
              )}
            </div>
            
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              title={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {lightMode ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}