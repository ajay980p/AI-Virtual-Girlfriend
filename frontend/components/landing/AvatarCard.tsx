"use client";

import { Avatar } from "@/types/avatar";
import { useState } from "react";

interface AvatarCardProps {
  avatar: Avatar;
  index: number;
  onSelect: (avatar: Avatar) => void;
}

export default function AvatarCard({ avatar, index, onSelect }: AvatarCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className="group relative cursor-pointer w-full max-w-sm mx-auto"
      style={{ 
        animationDelay: `${index * 100}ms` 
      }}
      onClick={() => onSelect(avatar)}
    >
      {/* Main Card */}
      <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-border/50 shadow-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/40 hover:-translate-y-2 hover:bg-card/90 animate-fade-in">
        {/* Avatar Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60">
          {!imageError ? (
            <>
              {/* Placeholder while loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center animate-pulse border border-white/20">
                    <span className="text-2xl">👤</span>
                  </div>
                </div>
              )}
              
              {/* Actual Image */}
              <img
                src={avatar.image}
                alt={avatar.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            /* Fallback when image fails to load */
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/20">
                  <span className="text-3xl">
                    {avatar.category === 'anime' ? '🎨' : '👤'}
                  </span>
                </div>
                <p className="text-xs text-white/70">Image Preview</p>
              </div>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 text-xs font-semibold bg-black/50 text-white rounded-full backdrop-blur-md border border-white/20">
              {avatar.category === 'anime' ? '🎨 Anime' : '📸 Realistic'}
            </span>
          </div>
          
          {/* Hover Action */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <button className="px-8 py-3 bg-primary/90 backdrop-blur-sm text-white rounded-2xl font-semibold shadow-xl hover:bg-primary transition-colors border border-primary/30">
              Chat Now →
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-4 bg-card/20 backdrop-blur-sm">
          {/* Name and Age */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {avatar.name}
            </h3>
            <span className="text-sm font-semibold text-muted-foreground bg-muted/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/30">
              {avatar.age} years
            </span>
          </div>
          
          {/* Bio */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {avatar.bio}
          </p>
          
          {/* Personality Tags */}
          <div className="flex flex-wrap gap-2">
            {avatar.personality.slice(0, 3).map((trait) => (
              <span 
                key={trait}
                className="px-3 py-1.5 text-xs font-semibold bg-primary/20 text-primary rounded-lg border border-primary/30 backdrop-blur-sm"
              >
                {trait}
              </span>
            ))}
            {avatar.personality.length > 3 && (
              <span className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm rounded-lg border border-border/30">
                +{avatar.personality.length - 3} more
              </span>
            )}
          </div>
          
          {/* Interest Tags */}
          <div className="pt-2 border-t border-border/30">
            <div className="flex flex-wrap gap-2">
              {avatar.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 text-xs text-muted-foreground bg-muted/40 backdrop-blur-sm rounded-md border border-border/20"
                >
                  {tag}
                </span>
              ))}
              {avatar.tags.length > 2 && (
                <span className="px-2 py-1 text-xs text-muted-foreground bg-muted/30 backdrop-blur-sm rounded-md border border-border/20">
                  +{avatar.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 blur-lg group-hover:blur-xl" />
    </div>
  );
}