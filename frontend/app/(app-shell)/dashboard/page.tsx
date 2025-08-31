import HealthCard from "@/components/dashboard/HealthCard";
import RecentChats from "@/components/dashboard/RecentChats";

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const greetingEmoji = "👋";
  const userName = "darling"; // Matching the reference design

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section - matching reference exactly */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {greeting}, {userName} {greetingEmoji}
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready when you are. Start a chat or pick up where you left off.
          </p>
        </div>
        
        {/* Action Buttons - matching reference design */}
        <div className="flex gap-4">
          <a 
            href="/chat" 
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors cursor-pointer"
          >
            💬 Start new chat →
          </a>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
            📅 Daily check-in
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
            📄 Share a memory
          </button>
        </div>
      </div>

      {/* Main Content Grid - matching reference layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status - Left Column */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">AI Connection</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-500 text-sm font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Memory Sync</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-500 text-sm font-medium">Synced</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Emotion Engine</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-500 text-sm font-medium">Learning...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personality - Right Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-purple-500">✨</span>
              <h2 className="text-xl font-semibold text-foreground">Personality</h2>
            </div>
            <p className="text-muted-foreground mb-6">Warm, witty, and a bit tech-nerdy.</p>
            
            {/* Personality Sliders - matching reference */}
            <div className="space-y-6">
              {/* More playful - More practical slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">More playful</span>
                  <span className="text-sm text-muted-foreground">More practical</span>
                </div>
                <div className="relative cursor-pointer">
                  <div className="w-full h-2 bg-muted rounded-full"></div>
                  <div className="absolute top-0 left-0 h-2 bg-primary rounded-full" style={{ width: '75%' }}></div>
                  <div className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-pointer" style={{ left: '75%', marginLeft: '-8px' }}></div>
                </div>
              </div>
              
              {/* Emotional - Logical slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Emotional</span>
                  <span className="text-sm text-muted-foreground">Logical</span>
                </div>
                <div className="relative cursor-pointer">
                  <div className="w-full h-2 bg-muted rounded-full"></div>
                  <div className="absolute top-0 left-0 h-2 bg-primary rounded-full" style={{ width: '60%' }}></div>
                  <div className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-pointer" style={{ left: '60%', marginLeft: '-8px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Conversations - matching reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Recent conversations</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
            <div>
              <h3 className="font-medium text-foreground mb-1">Planning our weekend stargazing trip</h3>
              <p className="text-sm text-muted-foreground">Let's find the perfect spot away from city lights...</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              Continue
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
            <div>
              <h3 className="font-medium text-foreground mb-1">Coffee recommendations</h3>
              <p className="text-sm text-muted-foreground">You asked about the best local coffee shops...</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}