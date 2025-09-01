"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Camera } from "lucide-react";
import { CreateModelRequest } from "@/types/avatar";

interface CreateModelProps {
  onCancel?: () => void;
}

const PERSONALITY_TRAITS = [
  "Creative", "Adventurous", "Empathetic", "Intellectual", "Romantic", "Thoughtful",
  "Motivational", "Caring", "Energetic", "Intelligent", "Ambitious", "Tech-savvy",
  "Playful", "Sweet", "Mystical", "Wise", "Gentle", "Confident", "Humorous", "Loyal"
];

export default function CreateModel({ onCancel }: CreateModelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    age: 18,
    bio: "",
    personality: [] as string[],
    category: "realistic" as "realistic" | "anime"
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newImages = [...uploadedImages, ...files].slice(0, 3); // Max 3 images for simplicity
    setUploadedImages(newImages);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, 3));
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setUploadedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const togglePersonalityTrait = (trait: string) => {
    if (formData.personality.includes(trait)) {
      setFormData(prev => ({
        ...prev,
        personality: prev.personality.filter(t => t !== trait)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        personality: [...prev.personality, trait]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.age < 18 || uploadedImages.length === 0 || formData.personality.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Create the complete model data with defaults
      const modelData: CreateModelRequest = {
        name: formData.name,
        age: formData.age,
        bio: formData.bio,
        images: uploadedImages,
        personality: formData.personality,
        category: formData.category,
        tags: [],
        emotions: {
          dominantEmotion: "happy",
          emotionalRange: 5,
          empathyLevel: 5,
          humorStyle: "gentle",
          communication: "casual"
        },
        appearance: {
          hairColor: "",
          hairStyle: "",
          eyeColor: "",
          skinTone: "",
          height: "",
          bodyType: "",
          style: "",
          accessories: []
        },
        interests: formData.personality, // Use personality as interests for simplicity
        backstory: formData.bio || `Meet ${formData.name}, a ${formData.age}-year-old with a ${formData.personality.join(", ")} personality.`,
        voiceStyle: {
          tone: "warm",
          pace: "moderate",
          expressiveness: 5
        },
        relationshipStyle: {
          intimacyLevel: "companion",
          loyaltyLevel: 5,
          jealousyLevel: 3,
          supportiveness: 8,
          playfulness: 5
        }
      };

      console.log("Creating model:", modelData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to models page
      router.push("/models");
    } catch (error) {
      console.error("Error creating model:", error);
      alert("Error creating model. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Your AI Model</h1>
        <p className="text-gray-400">Fill in the essential details to create your perfect companion</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Model Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Model Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter a beautiful name..."
            required
          />
        </div>

        {/* Age and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Age *
            </label>
            <input
              type="number"
              min="18"
              max="100"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
              className="w-full px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as "realistic" | "anime" }))}
              className="w-full px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="realistic">Realistic</option>
              <option value="anime">Anime</option>
            </select>
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Upload Photos * (Max 3)
          </label>
          
          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Click to upload photos</p>
              <p className="text-gray-400 text-sm">PNG, JPG, WEBP up to 10MB each</p>
            </label>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personality Traits */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Personality Traits * (Select at least one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PERSONALITY_TRAITS.map((trait) => (
              <button
                key={trait}
                type="button"
                onClick={() => togglePersonalityTrait(trait)}
                className={`p-2 rounded-lg border transition-all duration-200 text-sm ${
                  formData.personality.includes(trait)
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                }`}
              >
                {trait}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Brief Description (Optional)
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Tell us about your model's personality and interests..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => onCancel ? onCancel() : router.back()}
            className="flex-1 px-6 py-3 rounded-xl border border-zinc-700 text-gray-300 hover:border-zinc-600 hover:text-white transition-all duration-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Model"}
          </button>
        </div>
      </form>
    </div>
  );
}