"use client";

import { useState } from "react";
import { Avatar, AvatarCategory, avatars, categories } from "@/types/avatar";
import { useRouter } from "next/navigation";
import AvatarCard from "@/components/landing/AvatarCard";
import CategoryFilter from "@/components/landing/CategoryFilter";
import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";

export default function AvatarLanding() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'realistic' | 'anime'>('all');
  const router = useRouter();

  // Filter avatars based on selected category
  const filteredAvatars = selectedCategory === 'all' 
    ? avatars 
    : avatars.filter(avatar => avatar.category === selectedCategory);

  const handleAvatarSelect = (avatar: Avatar) => {
    // Store selected avatar and navigate to signup
    localStorage.setItem('selectedAvatar', JSON.stringify({
      id: avatar.id,
      name: avatar.name
    }));
    router.push('/auth/signup');
  };

  const handleCategoryChange = (category: 'all' | 'realistic' | 'anime') => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <Navbar />
      
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/3 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Category Filter */}
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* Avatar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12 place-items-center">
            {filteredAvatars.map((avatar, index) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                index={index}
                onSelect={handleAvatarSelect}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredAvatars.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No avatars found</h3>
              <p className="text-muted-foreground">Try selecting a different category</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-border/20 bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Project Aria</h3>
              <p className="text-muted-foreground text-sm">
                Experience the future of AI companionship. Create meaningful connections with advanced AI personalities.
              </p>
              <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Support</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}