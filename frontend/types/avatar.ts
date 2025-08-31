export interface Avatar {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  personality: string[];
  category: 'all' | 'realistic' | 'anime';
  tags: string[];
}

export interface AvatarCategory {
  id: 'all' | 'realistic' | 'anime';
  label: string;
  active: boolean;
}

// Sample avatar data - in production this would come from your backend
export const avatars: Avatar[] = [
  {
    id: 'amber-scott',
    name: 'Amber Scott',
    age: 26,
    bio: 'Creative artist with a passion for photography and travel. Always ready for new adventures and deep conversations.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face', // You'll need to add these images
    personality: ['Creative', 'Adventurous', 'Empathetic'],
    category: 'realistic',
    tags: ['Photography', 'Travel', 'Art']
  },
  {
    id: 'anastasia-ivanova',
    name: 'Anastasia Ivanova',
    age: 20,
    bio: 'Literature enthusiast and aspiring writer. Loves discussing philosophy, books, and exploring new ideas together.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
    personality: ['Intellectual', 'Romantic', 'Thoughtful'],
    category: 'realistic',
    tags: ['Literature', 'Philosophy', 'Writing']
  },
  {
    id: 'brooke-hamilton',
    name: 'Brooke Hamilton',
    age: 25,
    bio: 'Fitness enthusiast and nutritionist. Motivational and caring, always encouraging you to be your best self.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
    personality: ['Motivational', 'Caring', 'Energetic'],
    category: 'realistic',
    tags: ['Fitness', 'Health', 'Motivation']
  },
  {
    id: 'lily-evans',
    name: 'Lily Evans',
    age: 24,
    bio: 'Tech-savvy entrepreneur with a love for innovation. Enjoys discussing technology, startups, and future possibilities.',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&crop=face',
    personality: ['Intelligent', 'Ambitious', 'Tech-savvy'],
    category: 'realistic',
    tags: ['Technology', 'Business', 'Innovation']
  },
  {
    id: 'sakura-tanaka',
    name: 'Sakura Tanaka',
    age: 22,
    bio: 'Anime enthusiast and digital artist. Sweet and playful, loves gaming, anime, and creating digital art together.',
    image: 'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=400&h=600&fit=crop&crop=face',
    personality: ['Playful', 'Creative', 'Sweet'],
    category: 'anime',
    tags: ['Anime', 'Gaming', 'Digital Art']
  },
  {
    id: 'aria-moonlight',
    name: 'Aria Moonlight',
    age: 23,
    bio: 'Mystical and wise anime character. Enjoys fantasy stories, magic themes, and deep philosophical conversations.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
    personality: ['Mystical', 'Wise', 'Gentle'],
    category: 'anime',
    tags: ['Fantasy', 'Magic', 'Philosophy']
  }
];

export const categories: AvatarCategory[] = [
  { id: 'all', label: 'All Models', active: true },
  { id: 'realistic', label: 'Realistic', active: false },
  { id: 'anime', label: 'Anime', active: false }
];