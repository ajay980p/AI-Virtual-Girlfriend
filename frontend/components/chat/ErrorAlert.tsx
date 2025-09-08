"use client";

type ErrorAlertProps = {
    message: string;
    onDismiss?: () => void;
};

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
    if (!message) return null;
    return (
        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start gap-2">
                <span className="text-red-500">⚠️</span>
                <div className="flex-1">
                    <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="mt-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 cursor-pointer"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
