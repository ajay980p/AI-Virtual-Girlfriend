import HealthCard from "@/components/dashboard/HealthCard";
import RecentChats from "@/components/dashboard/RecentChats";

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <section className="md:col-span-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">{greeting}, Ajay 👋</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ready when you are. Start a chat or pick up where you left off.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/chat" className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground">Start new chat</a>
            <button className="rounded-xl border px-3 py-2 text-sm hover:bg-muted">Daily check‑in</button>
            <button className="rounded-xl border px-3 py-2 text-sm hover:bg-muted">Import a doc</button>
          </div>
        </div>
        <div className="mt-6">
          <RecentChats />
        </div>
      </section>
      <aside className="space-y-6">
        <HealthCard />
        <div className="rounded-2xl border bg-card p-4 text-sm">
          <p className="font-medium">Persona</p>
          <p className="mt-1 text-muted-foreground">Warm, witty, and a bit tech‑nerdy.</p>
          <div className="mt-3 flex gap-2">
            <button className="rounded-lg border px-2 py-1 text-xs hover:bg-muted">More playful</button>
            <button className="rounded-lg border px-2 py-1 text-xs hover:bg-muted">More practical</button>
          </div>
        </div>
      </aside>
    </div>
  );
}