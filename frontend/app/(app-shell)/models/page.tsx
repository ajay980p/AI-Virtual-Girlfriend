"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, MessageSquare, Search, Filter, Heart, Eye, X } from "lucide-react";
import { Avatar } from "../../../types/avatar";

// Sample data - in production this would come from your backend
const sampleModels: Avatar[] = [
  {
    id: "custom-1",
    name: "Luna",
    age: 24,
    bio: "A creative artist with a mysterious aura who loves stargazing and poetry.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
    personality: ["Creative", "Mysterious", "Romantic", "Thoughtful"],
    category: "custom",
    tags: ["Artist", "Dreamer"],
    isCustom: true,
    createdAt: "2024-01-15T10:30:00Z",
    interests: ["Art", "Poetry", "Astronomy"],
    emotions: {
      dominantEmotion: "mysterious",
      emotionalRange: 7,
      empathyLevel: 8,
      humorStyle: "gentle",
      communication: "poetic"
    }
  },
  {
    id: "custom-2", 
    name: "Aria",
    age: 22,
    bio: "An energetic tech enthusiast who loves gaming and adventure.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
    personality: ["Energetic", "Tech-savvy", "Adventurous", "Playful"],
    category: "anime",
    tags: ["Gamer", "Tech"],
    isCustom: true,
    createdAt: "2024-01-10T15:45:00Z",
    interests: ["Gaming", "Technology", "Travel"],
    emotions: {
      dominantEmotion: "playful",
      emotionalRange: 9,
      empathyLevel: 6,
      humorStyle: "witty",
      communication: "casual"
    }
  }
];

export default function ModelsPage() {
  const [models, setModels] = useState<Avatar[]>(sampleModels);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "realistic" | "anime" | "custom">("all");
  const [selectedModel, setSelectedModel] = useState<Avatar | null>(null);

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.personality.some((trait: string) => trait.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || model.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDeleteModel = (modelId: string) => {
    if (window.confirm("Are you sure you want to delete this model? This action cannot be undone.")) {
      setModels(prev => prev.filter(model => model.id !== modelId));
    }
  };

  const handleChatWithModel = (model: Avatar) => {
    // TODO: Implement chat functionality with specific model
    console.log("Starting chat with:", model.name);
    // You could redirect to chat page with model context
    // router.push(`/chat?model=${model.id}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'realistic':
        return 'bg-blue-600 text-white';
      case 'anime':
        return 'bg-pink-600 text-white';
      default:
        return 'bg-purple-600 text-white';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Models</h1>
          <p className="text-gray-400">Create and manage your AI companions</p>
        </div>
        <Link
          href="/models/create"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-600/25"
        >
          <Plus className="w-5 h-5" />
          Create New Model
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search models by name, bio, or personality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Categories</option>
            <option value="realistic">Realistic</option>
            <option value="anime">Anime</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-16">
          {models.length === 0 ? (
            <div className="space-y-4">
              <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">No models yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Create your first AI companion to get started. Design their appearance, personality, and backstory.
              </p>
              <Link
                href="/models/create"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-600/25"
              >
                <Plus className="w-5 h-5" />
                Create Your First Model
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">No models found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 group"
            >
              {/* Model Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(model.category)}`}>
                    {model.category.charAt(0).toUpperCase() + model.category.slice(1)}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{model.name}</h3>
                  <p className="text-gray-300 text-sm">{model.age} years old</p>
                </div>
              </div>

              {/* Model Info */}
              <div className="p-6 space-y-4">
                <p className="text-gray-300 text-sm line-clamp-2">{model.bio}</p>
                
                {/* Personality Traits */}
                <div className="flex flex-wrap gap-2">
                  {model.personality.slice(0, 3).map((trait: string) => (
                    <span
                      key={trait}
                      className="px-2 py-1 bg-zinc-800 text-gray-300 rounded-md text-xs"
                    >
                      {trait}
                    </span>
                  ))}
                  {model.personality.length > 3 && (
                    <span className="px-2 py-1 bg-zinc-700 text-gray-400 rounded-md text-xs">
                      +{model.personality.length - 3} more
                    </span>
                  )}
                </div>

                {/* Interests */}
                {model.interests && model.interests.length > 0 && (
                  <div className="text-xs text-gray-400">
                    <span className="font-medium">Interests:</span> {model.interests.slice(0, 3).join(", ")}
                    {model.interests.length > 3 && " +more"}
                  </div>
                )}

                {/* Creation Date */}
                {model.createdAt && (
                  <div className="text-xs text-gray-500">
                    Created {new Date(model.createdAt).toLocaleDateString()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleChatWithModel(model)}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </button>
                  
                  <button
                    onClick={() => setSelectedModel(model)}
                    className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-gray-300 p-2 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <Link
                    href={`/models/edit/${model.id}`}
                    className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-gray-300 p-2 rounded-lg transition-all duration-200"
                    title="Edit Model"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteModel(model.id)}
                    className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-200"
                    title="Delete Model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Details Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedModel(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Header Image */}
              <div className="relative h-64 overflow-hidden rounded-t-2xl">
                <img
                  src={selectedModel.image}
                  alt={selectedModel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h2 className="text-3xl font-bold text-white mb-1">{selectedModel.name}</h2>
                  <p className="text-gray-300">{selectedModel.age} years old • {selectedModel.category}</p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                  <p className="text-gray-300">{selectedModel.bio}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Personality</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.personality.map((trait: string) => (
                      <span
                        key={trait}
                        className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-600/30"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedModel.interests && selectedModel.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedModel.interests.map((interest: string) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-zinc-800 text-gray-300 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedModel.emotions && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Emotional Profile</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Dominant Emotion:</span>
                        <p className="text-white capitalize">{selectedModel.emotions.dominantEmotion}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Communication:</span>
                        <p className="text-white capitalize">{selectedModel.emotions.communication}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Humor Style:</span>
                        <p className="text-white capitalize">{selectedModel.emotions.humorStyle}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Empathy Level:</span>
                        <p className="text-white">{selectedModel.emotions.empathyLevel}/10</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedModel.backstory && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Backstory</h3>
                    <p className="text-gray-300">{selectedModel.backstory}</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleChatWithModel(selectedModel);
                      setSelectedModel(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Start Chat
                  </button>
                  
                  <Link
                    href={`/models/edit/${selectedModel.id}`}
                    className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-gray-300 px-4 py-3 rounded-xl transition-all duration-200"
                    onClick={() => setSelectedModel(null)}
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}