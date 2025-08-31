"use client";

import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

export default function HeroSection() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };
  return (
    <section className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Create Custom{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                  AI Girlfriend
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Craft your dream girlfriend with a few clicks. Customize her your way and bring her to life.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => openAuthModal("signup")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 cursor-pointer"
              >
                ✨ Create For Free
              </button>
              <button 
                onClick={() => openAuthModal("signin")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium border border-border text-muted-foreground rounded-xl hover:bg-secondary transition-all duration-200 cursor-pointer"
              >
                🎮 Explore Gallery
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">1M+</div>
                <div className="text-sm text-muted-foreground">Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Avatar */}
          <div className="relative">
            <div className="relative glass-strong rounded-3xl p-8 border border-primary/20 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-tr from-secondary/20 via-primary/10 to-accent/5 blur-xl" />
              
              {/* Content */}
              <div className="relative z-10 text-center space-y-6">
                {/* Avatar placeholder - you can replace with actual image */}
                <div className="w-48 h-48 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                  <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-6xl">👸</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Meet Aria</h3>
                  <p className="text-muted-foreground">Your perfect AI companion awaits</p>
                </div>
                
                {/* Preview tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  {['Smart', 'Caring', 'Creative', 'Playful'].map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary/20 animate-bounce-subtle" />
            <div className="absolute -bottom-4 -right-4 w-6 h-6 rounded-full bg-accent/20 animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 -right-8 w-4 h-4 rounded-full bg-secondary/30 animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </section>
  );
}