"use client";

import { useEffect, useState } from "react";

export default function HealthCard() {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    let mounted = true;
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => mounted && setStatus(data.ok ? "ok" : "down"))
      .catch(() => mounted && setStatus("down"));
    return () => {
      mounted = false;
    };
  }, []);

  const statusConfig = {
    checking: {
      color: "bg-amber-500",
      text: "System Check in Progress",
      description: "Verifying all systems and connections",
      icon: "🔍",
      emoji: "⏳",
      gradient: "from-amber-500/20 via-orange-500/15 to-yellow-500/10",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/20"
    },
    ok: {
      color: "bg-emerald-500",
      text: "All Systems Operational",
      description: "Backend services running smoothly with optimal performance",
      icon: "✅",
      emoji: "🚀",
      gradient: "from-emerald-500/20 via-green-500/15 to-teal-500/10",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20"
    },
    down: {
      color: "bg-red-500",
      text: "Service Unavailable",
      description: "Please check backend configuration or network connectivity",
      icon: "⚠️",
      emoji: "🔧",
      gradient: "from-red-500/20 via-red-600/15 to-pink-500/10",
      border: "border-red-500/30",
      glow: "shadow-red-500/20"
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`glass-strong rounded-3xl p-6 border transition-all duration-500 hover:shadow-xl group relative overflow-hidden ${config.border} ${config.glow}`}>
      <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br blur-2xl transition-transform duration-700 group-hover:scale-125 ${config.gradient}`} />
      <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-gradient-to-tr from-accent/10 via-primary/5 to-secondary/5 blur-xl group-hover:scale-110 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-xl animate-glow">{config.icon}</span>
              <span className="absolute -top-1 -right-1 text-xs animate-bounce-subtle">{config.emoji}</span>
            </div>
            <div>
              <h3 className="text-base font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">System Health</h3>
              <p className="text-xs text-muted-foreground font-medium">Backend Services</p>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <span className={`inline-flex h-3 w-3 rounded-full ${config.color} animate-pulse`}>
              {status === "ok" && (
                <span className="absolute -inset-1 animate-ping rounded-full bg-emerald-500/60" />
              )}
              {status === "checking" && (
                <span className="absolute -inset-1 animate-ping rounded-full bg-amber-500/60" />
              )}
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {status}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-surface-1/70 to-surface-2/50 border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">{config.text}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
          </div>
          
          {status === "checking" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-primary">78%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-1000 animate-pulse" 
                  style={{ width: '78%' }} 
                />
              </div>
            </div>
          )}
          
          {status === "ok" && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20">
                <div className="text-lg font-bold text-emerald-600">99.9%</div>
                <div className="text-muted-foreground font-medium">Uptime</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
                <div className="text-lg font-bold text-blue-600">12ms</div>
                <div className="text-muted-foreground font-medium">Response</div>
              </div>
            </div>
          )}
          
          {status === "down" && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/5 border border-red-500/20">
              <span className="text-sm">🔌</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-600">Connection Failed</p>
                <p className="text-xs text-muted-foreground">Attempting to reconnect...</p>
              </div>
              <button className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg transition-colors duration-200 border border-red-500/30">
                Retry
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              <span>Last checked: {new Date().toLocaleTimeString()}</span>
            </span>
            <button className="hover:text-primary transition-colors duration-200 font-medium">
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}