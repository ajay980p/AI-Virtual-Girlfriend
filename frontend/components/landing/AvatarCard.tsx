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
      className="group relative cursor-pointer"
      style={{ 
        animationDelay: `${index * 100}ms` 
      }}
      onClick={() => onSelect(avatar)}
    >
      {/* Main Card */}
      <div className="glass-strong rounded-2xl overflow-hidden border border-border/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 animate-fade-in">
        {/* Avatar Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
          {!imageError ? (
            <>
              {/* Placeholder while loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
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
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <span className="text-3xl">
                    {avatar.category === 'anime' ? '🎨' : '👤'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Image Preview</p>
              </div>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium bg-black/30 text-white rounded-full backdrop-blur-sm">
              {avatar.category === 'anime' ? '🎨 Anime' : '📸 Realistic'}
            </span>
          </div>
          
          {/* Hover Action */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button className="px-6 py-2 bg-primary text-white rounded-xl font-medium shadow-lg hover:bg-primary/90 transition-colors">
              Chat Now →
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-4">
          {/* Name and Age */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {avatar.name}
            </h3>
            <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
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
                className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md border border-primary/20"
              >
                {trait}
              </span>
            ))}
            {avatar.personality.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium text-muted-foreground">
                +{avatar.personality.length - 3} more
              </span>
            )}
          </div>
          
          {/* Interest Tags */}
          <div className="pt-2 border-t border-border/20">
            <div className="flex flex-wrap gap-1">
              {avatar.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 text-xs text-muted-foreground bg-muted/30 rounded-md"
                >
                  {tag}
                </span>
              ))}
              {avatar.tags.length > 2 && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{avatar.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
    </div>
  );
}