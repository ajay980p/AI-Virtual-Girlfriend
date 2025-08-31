import ThreadList from "@/components/chat/ThreadList";
import MessageStream from "@/components/chat/MessageStream";
import Composer from "@/components/chat/Composer";

export default function ChatPage() {
  return (
    <div className="grid h-[calc(100dvh-120px)] grid-cols-1 gap-6 md:grid-cols-[320px_1fr] animate-fade-in">
      {/* Thread Sidebar */}
      <aside className="glass rounded-3xl p-4 border border-border/30 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-2xl group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10 h-full">
          <ThreadList />
        </div>
      </aside>
      
      {/* Chat Section */}
      <section className="flex flex-col glass rounded-3xl border border-border/30 backdrop-blur-xl overflow-hidden relative group">
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-secondary/10 to-primary/5 blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-tr from-primary/10 to-accent/5 blur-3xl group-hover:scale-110 transition-transform duration-700" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <MessageStream />
          </div>
          
          {/* Composer Area */}
          <div className="border-t border-border/30 p-6 bg-card/5 backdrop-blur-sm">
            <Composer />
          </div>
        </div>
      </section>
    </div>
  );
}