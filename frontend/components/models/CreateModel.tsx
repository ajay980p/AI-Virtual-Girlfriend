"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Upload, X, Plus, Camera } from "lucide-react";
import { CreateModelRequest, EmotionalProfile, AppearanceProfile, VoiceProfile, RelationshipProfile } from "@/types/avatar";

interface CreateModelProps {
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, title: "Basic Info", description: "Name, age, and category" },
  { id: 2, title: "Appearance", description: "Photos and physical traits" },
  { id: 3, title: "Personality", description: "Traits and communication style" },
  { id: 4, title: "Emotions", description: "Emotional profile and behavior" },
  { id: 5, title: "Interests", description: "Hobbies and preferences" },
  { id: 6, title: "Backstory", description: "History and relationship style" },
  { id: 7, title: "Review", description: "Finalize your creation" }
];

const PERSONALITY_TRAITS = [
  "Creative", "Adventurous", "Empathetic", "Intellectual", "Romantic", "Thoughtful",
  "Motivational", "Caring", "Energetic", "Intelligent", "Ambitious", "Tech-savvy",
  "Playful", "Sweet", "Mystical", "Wise", "Gentle", "Confident", "Humorous", "Loyal"
];

const INTERESTS_OPTIONS = [
  "Photography", "Travel", "Art", "Literature", "Philosophy", "Writing",
  "Fitness", "Health", "Motivation", "Technology", "Business", "Innovation",
  "Anime", "Gaming", "Digital Art", "Fantasy", "Magic", "Music", "Movies",
  "Cooking", "Fashion", "Sports", "Science", "History", "Nature"
];

export default function CreateModel({ onCancel }: CreateModelProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<CreateModelRequest>({
    name: "",
    age: 18,
    bio: "",
    images: [],
    personality: [],
    category: "realistic",
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
    interests: [],
    backstory: "",
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
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newImages = [...uploadedImages, ...files].slice(0, 5); // Max 5 images
    setUploadedImages(newImages);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, 5));

    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setUploadedImages(newImages);
    setPreviewUrls(newPreviews);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to create model
      console.log("Creating model:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to models page or dashboard
      router.push("/models");
    } catch (error) {
      console.error("Error creating model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0 && formData.age >= 18;
      case 2:
        return uploadedImages.length > 0;
      case 3:
        return formData.personality.length > 0;
      case 4:
        return true; // Emotions have defaults
      case 5:
        return formData.interests.length > 0;
      case 6:
        return formData.backstory.trim().length > 10;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Model Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base"
                placeholder="Enter a beautiful name..."
                required
              />
            </div>

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
                className="w-full px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["realistic", "anime"].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category as any }))}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      formData.category === category
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                    }`}
                  >
                    <div className="font-medium capitalize">{category}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Brief Description
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base"
                placeholder="A brief description of your model..."
                rows={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Upload Photos * (Max 5)
              </label>
              
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Click to upload photos</p>
                  <p className="text-gray-400 text-sm">PNG, JPG, WEBP up to 10MB each</p>
                </label>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Hair Color
                </label>
                <input
                  type="text"
                  value={formData.appearance.hairColor}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, hairColor: e.target.value }
                  }))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Blonde, Brown, Black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Eye Color
                </label>
                <input
                  type="text"
                  value={formData.appearance.eyeColor}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, eyeColor: e.target.value }
                  }))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Blue, Brown, Green"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Height
                </label>
                <input
                  type="text"
                  value={formData.appearance.height}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, height: e.target.value }
                  }))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 5'6, 165cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Style
                </label>
                <input
                  type="text"
                  value={formData.appearance.style}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, style: e.target.value }
                  }))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Elegant, Casual, Gothic"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Personality Traits * (Select multiple)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PERSONALITY_TRAITS.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleArrayItem(
                      formData.personality,
                      trait,
                      (items) => setFormData(prev => ({ ...prev, personality: items }))
                    )}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
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

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Communication Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["direct", "gentle", "poetic", "casual", "formal"].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      emotions: { ...prev.emotions, communication: style as any }
                    }))}
                    className={`p-3 rounded-lg border transition-all duration-200 capitalize ${
                      formData.emotions.communication === style
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      // Step 4: Emotions
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Dominant Emotion
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["happy", "calm", "mysterious", "playful", "romantic", "confident", "shy", "energetic"].map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      emotions: { ...prev.emotions, dominantEmotion: emotion }
                    }))}
                    className={`p-3 rounded-lg border transition-all duration-200 capitalize ${
                      formData.emotions.dominantEmotion === emotion
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Humor Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["witty", "playful", "sarcastic", "gentle", "quirky"].map((humor) => (
                  <button
                    key={humor}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      emotions: { ...prev.emotions, humorStyle: humor as any }
                    }))}
                    className={`p-3 rounded-lg border transition-all duration-200 capitalize ${
                      formData.emotions.humorStyle === humor
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                    }`}
                  >
                    {humor}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Emotional Range: {formData.emotions.emotionalRange}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.emotions.emotionalRange}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emotions: { ...prev.emotions, emotionalRange: parseInt(e.target.value) }
                  }))}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Reserved</span>
                  <span>Expressive</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Empathy Level: {formData.emotions.empathyLevel}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.emotions.empathyLevel}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emotions: { ...prev.emotions, empathyLevel: parseInt(e.target.value) }
                  }))}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Logical</span>
                  <span>Emotional</span>
                </div>
              </div>
            </div>
          </div>
        );

      // Step 5: Interests
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Interests & Hobbies * (Select multiple)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleArrayItem(
                      formData.interests,
                      interest,
                      (items) => setFormData(prev => ({ ...prev, interests: items }))
                    )}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      formData.interests.includes(interest)
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Custom Tags (Optional)
              </label>
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
                }))}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Add custom tags separated by commas..."
              />
            </div>
          </div>
        );

      // Step 6: Backstory & Relationship
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Backstory * (Minimum 10 characters)
              </label>
              <textarea
                value={formData.backstory}
                onChange={(e) => setFormData(prev => ({ ...prev, backstory: e.target.value }))}
                className="w-full px-4 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base"
                placeholder="Tell her story... Where did she come from? What are her dreams and aspirations?"
                rows={6}
                required
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.backstory.length} characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Relationship Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["friend", "romantic", "companion", "mentor"].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      relationshipStyle: { ...prev.relationshipStyle, intimacyLevel: style as any }
                    }))}
                    className={`p-3 rounded-lg border transition-all duration-200 capitalize ${
                      formData.relationshipStyle.intimacyLevel === style
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Voice Tone
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {["soft", "warm", "energetic", "mysterious", "sweet"].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        voiceStyle: { ...prev.voiceStyle, tone: tone as any }
                      }))}
                      className={`p-2 rounded-lg border transition-all duration-200 capitalize text-sm ${
                        formData.voiceStyle.tone === tone
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Speaking Pace
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {["slow", "moderate", "fast"].map((pace) => (
                    <button
                      key={pace}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        voiceStyle: { ...prev.voiceStyle, pace: pace as any }
                      }))}
                      className={`p-2 rounded-lg border transition-all duration-200 capitalize text-sm ${
                        formData.voiceStyle.pace === pace
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-zinc-800 border-zinc-700 text-gray-400 hover:border-purple-500 hover:text-white"
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // Step 7: Review
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Review Your Creation</h3>
              <p className="text-gray-400">Make sure everything looks perfect before creating your model</p>
            </div>

            <div className="bg-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                {previewUrls.length > 0 && (
                  <img
                    src={previewUrls[0]}
                    alt={formData.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                  />
                )}
                <div>
                  <h4 className="text-xl font-bold text-white">{formData.name}</h4>
                  <p className="text-gray-400">{formData.age} years old • {formData.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Personality:</span>
                  <p className="text-white">{formData.personality.join(", ")}</p>
                </div>
                <div>
                  <span className="text-gray-400">Interests:</span>
                  <p className="text-white">{formData.interests.join(", ")}</p>
                </div>
                <div>
                  <span className="text-gray-400">Dominant Emotion:</span>
                  <p className="text-white capitalize">{formData.emotions.dominantEmotion}</p>
                </div>
                <div>
                  <span className="text-gray-400">Relationship:</span>
                  <p className="text-white capitalize">{formData.relationshipStyle.intimacyLevel}</p>
                </div>
              </div>

              {formData.bio && (
                <div>
                  <span className="text-gray-400 text-sm">Bio:</span>
                  <p className="text-white mt-1">{formData.bio}</p>
                </div>
              )}

              <div>
                <span className="text-gray-400 text-sm">Backstory:</span>
                <p className="text-white mt-1">{formData.backstory}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onCancel || (() => router.back())}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Create Your Model</h1>
              <p className="text-gray-400">Bring your perfect companion to life</p>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? "bg-purple-600 border-purple-500 text-white" 
                      : isCompleted 
                        ? "bg-green-600 border-green-500 text-white" 
                        : "bg-zinc-800 border-zinc-700 text-gray-400"
                  }`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      isCompleted ? "bg-green-500" : "bg-zinc-700"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{STEPS[currentStep - 1].title}</h2>
            <p className="text-gray-400">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border border-zinc-800 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 1
                ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="text-center">
            <span className="text-gray-400 text-sm">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>

          {currentStep === STEPS.length ? (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                !isStepValid() || isLoading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/25"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Model
                  <Plus className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                !isStepValid()
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/25"
              }`}
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 2px 0 #555;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 2px 0 #555;
        }
      `}</style>
    </div>
  );
}