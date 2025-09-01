"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface LogoutButtonProps {
  variant?: "default" | "icon" | "text";
  className?: string;
  showConfirmDialog?: boolean;
}

export default function LogoutButton({ 
  variant = "default", 
  className = "",
  showConfirmDialog = true 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    if (showConfirmDialog && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      await logout();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (variant === "icon") {
    return (
      <>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          title="Logout"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
        </button>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-2xl max-w-sm w-full">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Logout Confirmation</h3>
                <p className="text-gray-400 mb-6">Are you sure you want to logout? You'll need to sign in again to access your account.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-400 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (variant === "text") {
    return (
      <>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-2xl max-w-sm w-full">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Logout Confirmation</h3>
                <p className="text-gray-400 mb-6">Are you sure you want to logout? You'll need to sign in again to access your account.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-400 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Logging out...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </>
        )}
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-2xl max-w-sm w-full">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Logout Confirmation</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to logout? You'll need to sign in again to access your account.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-400 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}