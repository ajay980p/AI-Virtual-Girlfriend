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

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Backend health</p>
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            status === "ok" ? "bg-emerald-500" : status === "down" ? "bg-red-500" : "bg-amber-500"
          }`}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {status === "checking" && "Checking…"}
        {status === "ok" && "All systems operational."}
        {status === "down" && "Service unreachable. Check backend or CORS."}
      </p>
    </div>
  );
}