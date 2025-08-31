"use client";

import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <nav className="relative z-50 border-b border-border/20 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">🧠</span>
            </div>
            <span className="text-xl font-bold text-foreground">Project Aria</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#explore" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              🔍 Explore
            </a>
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              💬 Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              ⭐ Premium
            </a>
            <a href="#support" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              🆘 Support
            </a>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-6">
              <button 
                onClick={() => openAuthModal("signin")}
                className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => openAuthModal("signup")}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/20 py-4 space-y-4">
            <a href="#explore" className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              🔍 Explore
            </a>
            <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              💬 Features
            </a>
            <a href="#pricing" className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              ⭐ Premium
            </a>
            <a href="#support" className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              🆘 Support
            </a>
            <div className="pt-4 border-t border-border/20 space-y-3">
              <button 
                onClick={() => openAuthModal("signin")}
                className="w-full px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => openAuthModal("signup")}
                className="w-full px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </nav>
  );
}