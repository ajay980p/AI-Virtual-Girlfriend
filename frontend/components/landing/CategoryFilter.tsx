"use client";

import { AvatarCategory } from "@/types/avatar";

interface CategoryFilterProps {
  categories: AvatarCategory[];
  selectedCategory: 'all' | 'realistic' | 'anime';
  onCategoryChange: (category: 'all' | 'realistic' | 'anime') => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange("all")}
          className={`
            px-6 py-3 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 cursor-pointer
            ${selectedCategory === category.id 
              ? 'bg-primary text-white shadow-lg shadow-primary/25' 
              : 'bg-card/60 text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
            }
          `}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}