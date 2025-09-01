import HealthCard from "@/components/dashboard/HealthCard";
import RecentChats from "@/components/dashboard/RecentChats";
import Link from "next/link";

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
          <Link 
            href="/models/create"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 px-6 py-3 text-sm font-medium text-white transition-colors cursor-pointer"
          >
            ✨ Create Model →
          </Link>
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

      {/* Your Models Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="text-purple-500">👤</span>
              Your Models
            </h2>
            <p className="text-muted-foreground text-sm">Create and chat with your custom AI companions</p>
          </div>
          <Link 
            href="/models"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            View all →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create New Model Card */}
          <Link
            href="/models/create"
            className="group p-6 bg-gradient-to-br from-purple-600/10 to-purple-800/10 rounded-lg border border-purple-600/20 hover:border-purple-500/40 transition-all duration-200 cursor-pointer"
          >
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-600/30 transition-colors">
                <span className="text-2xl">➕</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Create New Model</h3>
                <p className="text-sm text-muted-foreground">Design your perfect AI companion</p>
              </div>
            </div>
          </Link>
          
          {/* Sample Model Cards */}
          <div className="p-6 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">L</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Luna</h3>
                <p className="text-xs text-muted-foreground">Mysterious Artist</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Creative and mysterious, loves poetry and stargazing...</p>
            <Link
              href="/chat?model=luna"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Chat now →
            </Link>
          </div>
          
          <div className="p-6 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Aria</h3>
                <p className="text-xs text-muted-foreground">Tech Enthusiast</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Energetic gamer who loves technology and adventures...</p>
            <Link
              href="/chat?model=aria"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Chat now →
            </Link>
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