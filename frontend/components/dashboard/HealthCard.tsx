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
      text: "Checking…",
      description: "Verifying system status",
      icon: "🔍",
      gradient: "from-amber-500/20 to-orange-500/10",
      border: "border-amber-500/30"
    },
    ok: {
      color: "bg-emerald-500",
      text: "All systems operational",
      description: "Backend services running smoothly",
      icon: "✓",
      gradient: "from-emerald-500/20 to-green-500/10",
      border: "border-emerald-500/30"
    },
    down: {
      color: "bg-red-500",
      text: "Service unreachable",
      description: "Check backend or CORS configuration",
      icon: "⚠️",
      gradient: "from-red-500/20 to-red-600/10",
      border: "border-red-500/30"
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`glass rounded-3xl p-6 border transition-all duration-300 hover:shadow-lg group ${config.border}`}>
      <div className={`absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl transition-transform duration-500 group-hover:scale-110 ${config.gradient}`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">{config.icon}</span>
            <p className="text-sm font-bold">Backend Health</p>
          </div>
          <div className="relative">
            <span className={`inline-flex h-3 w-3 rounded-full ${config.color} animate-pulse`}>
              {status === "ok" && (
                <span className="absolute -inset-1 animate-ping rounded-full bg-emerald-500/60" />
              )}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{config.text}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
        </div>
        
        {status === "checking" && (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}