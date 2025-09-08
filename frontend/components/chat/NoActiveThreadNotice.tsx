"use client";

export default function NoActiveThreadNotice() {
    return (
        <div className="mx-6 mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                No active chat thread. Please create a new conversation.
            </p>
        </div>
    );
}
