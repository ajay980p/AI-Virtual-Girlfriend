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
          <h1 className="text-4xl font-bold text-white mb-2">
            {greeting}, {userName} {greetingEmoji}
          </h1>
          <p className="text-gray-400 text-lg">
            Ready when you are. Start a chat or pick up where you left off.
          </p>
        </div>
        
        {/* Action Buttons - matching reference design */}
        <div className="flex gap-4">
          <a 
            href="/chat" 
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            💬 Start new chat →
          </a>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">
            📅 Daily check-in
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">
            📄 Share a memory
          </button>
        </div>
      </div>

      {/* Main Content Grid - matching reference layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status - Left Column */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">AI Connection</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-500 text-sm font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Memory Sync</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-500 text-sm font-medium">Synced</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Emotion Engine</span>
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
              <h2 className="text-xl font-semibold text-white">Personality</h2>
            </div>
            <p className="text-gray-400 mb-6">Warm, witty, and a bit tech-nerdy.</p>
            
            {/* Personality Sliders - matching reference */}
            <div className="space-y-6">
              {/* More playful - More practical slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">More playful</span>
                  <span className="text-sm text-gray-400">More practical</span>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-gray-700 rounded-full"></div>
                  <div className="absolute top-0 left-0 h-2 bg-primary rounded-full" style={{ width: '75%' }}></div>
                  <div className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white" style={{ left: '75%', marginLeft: '-8px' }}></div>
                </div>
              </div>
              
              {/* Emotional - Logical slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Emotional</span>
                  <span className="text-sm text-gray-400">Logical</span>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-gray-700 rounded-full"></div>
                  <div className="absolute top-0 left-0 h-2 bg-primary rounded-full" style={{ width: '60%' }}></div>
                  <div className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white" style={{ left: '60%', marginLeft: '-8px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Conversations - matching reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recent conversations</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-gray-800/50 transition-colors">
            <div>
              <h3 className="font-medium text-white mb-1">Planning our weekend stargazing trip</h3>
              <p className="text-sm text-gray-400">Let's find the perfect spot away from city lights...</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
              Continue
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-gray-800/50 transition-colors">
            <div>
              <h3 className="font-medium text-white mb-1">Coffee recommendations</h3>
              <p className="text-sm text-gray-400">You asked about the best local coffee shops...</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}