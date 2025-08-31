import ThreadList from "@/components/chat/ThreadList";
import MessageStream from "@/components/chat/MessageStream";
import Composer from "@/components/chat/Composer";

export default function ChatPage() {
  return (
    <div className="grid h-[calc(100dvh-80px)] grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border bg-card p-3">
        <ThreadList />
      </aside>
      <section className="flex flex-col rounded-2xl border bg-card">
        <div className="flex-1 overflow-y-auto p-4">
          <MessageStream />
        </div>
        <div className="border-t p-3">
          <Composer />
        </div>
      </section>
    </div>
  );
}