"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  selectedAvatar?: { id: string; name: string } | null;
  onSuccess?: () => void;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = "signin",
  selectedAvatar,
  onSuccess
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
        // Redirect to dashboard after successful auth
        router.push("/dashboard");
      }
    }, 1500);
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl p-8 border border-border/60 shadow-2xl shadow-black/40">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-sm border border-border/20"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white font-bold text-2xl">🧠</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {mode === "signin" ? "Welcome Back" : "Join Project Aria"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode === "signin" 
                ? "Sign in to continue your AI journey" 
                : "Create your account and meet your AI companion"
              }
            </p>
          </div>

          {/* Selected Avatar Info */}
          {selectedAvatar && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/30 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                  <span className="text-2xl">💍</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground mb-1">
                    Ready to chat with <span className="text-primary">{selectedAvatar.name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete authentication to start your conversation
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-input/80 backdrop-blur-sm border border-border/60 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200 text-base"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-input/80 backdrop-blur-sm border border-border/60 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200 text-base"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Confirm Password for Signup */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-input/80 backdrop-blur-sm border border-border/60 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200 text-base"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold text-lg hover:from-primary/90 hover:to-accent/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-primary/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </div>
              ) : (
                mode === "signin" ? "Sign In" : "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-6 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button - Placeholder for future implementation */}
            <button
              type="button"
              disabled
              className="w-full py-4 px-6 border border-border/60 rounded-2xl font-semibold text-muted-foreground hover:bg-secondary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 backdrop-blur-sm"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
              <span className="text-xs text-muted-foreground ml-2">(Coming Soon)</span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-base text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={switchMode}
                className="text-primary hover:text-primary/80 font-semibold cursor-pointer transition-colors"
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="text-primary cursor-pointer hover:text-primary/80 transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-primary cursor-pointer hover:text-primary/80 transition-colors">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}