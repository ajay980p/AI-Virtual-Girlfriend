"use client";

import { useUIStore } from "@/store/ui.store";

export default function SettingsPage() {
  const vibe = useUIStore((s) => s.vibe);
  const setVibe = useUIStore((s) => s.setVibe);
  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      <section className="rounded-2xl border bg-card p-4">
        <p className="text-sm font-medium">Tone</p>
        <div className="mt-3 flex gap-2">
          {["Curious", "Supportive", "Direct"].map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v as any)}
              className={`rounded-full border px-3 py-1 text-xs ${vibe === v ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-4">
        <p className="text-sm font-medium">Accessibility</p>
        <p className="mt-1 text-sm text-muted-foreground">Gentle mode coming soon.</p>
      </section>
    </div>
  );
}