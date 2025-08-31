import HealthCard from "@/components/dashboard/HealthCard";
import RecentChats from "@/components/dashboard/RecentChats";

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "🌅" : hour < 18 ? "☀️" : "🌙";

  return (
    <div className="grid gap-8 md:grid-cols-3 animate-fade-in">
      <section className="md:col-span-2 space-y-8">
        {/* Welcome Section */}
        <div className="glass rounded-3xl p-8 border border-border/30 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-tr from-accent/20 to-primary/10 blur-2xl group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
                {greeting}, Ajay
              </h2>
              <span className="text-3xl animate-float">{greetingEmoji}</span>
            </div>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Ready when you are. Start a chat or pick up where you left off.
            </p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="/chat" 
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
              >
                <span>Start new chat</span>
                <div className="transition-transform duration-200 group-hover:translate-x-1">→</div>
              </a>
              <button className="rounded-2xl glass border border-border/50 px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-card/80 hover:shadow-lg active:scale-95">
                Daily check‑in
              </button>
              <button className="rounded-2xl glass border border-border/50 px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-card/80 hover:shadow-lg active:scale-95">
                Import a doc
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Chats Section */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <RecentChats />
        </div>
      </section>
      
      <aside className="space-y-6">
        {/* Health Card */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <HealthCard />
        </div>
        
        {/* Persona Card */}
        <div className="glass rounded-3xl p-6 text-sm border border-border/30 relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-2xl group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
              <p className="font-bold text-lg">Persona</p>
            </div>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Warm, witty, and a bit tech‑nerdy.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl glass border border-border/50 px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 hover:bg-card/50 hover:shadow-md active:scale-95">
                More playful
              </button>
              <button className="flex-1 rounded-xl glass border border-border/50 px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 hover:bg-card/50 hover:shadow-md active:scale-95">
                More practical
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}