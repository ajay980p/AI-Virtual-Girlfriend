"use client";

export default function LoadingHistoryBanner() {
    return (
        <div className="mx-6 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <p className="text-sm text-blue-700 dark:text-blue-300">Loading your chat history...</p>
            </div>
        </div>
    );
}
