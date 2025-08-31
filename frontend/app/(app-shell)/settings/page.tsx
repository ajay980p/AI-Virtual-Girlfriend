"use client";

import { useState } from "react";

interface SliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}

function Slider({ label, leftLabel, rightLabel, value, onChange }: SliderProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-foreground font-medium">{label}</h3>
      <p className="text-muted-foreground text-sm">How {label.toLowerCase()} Aria is</p>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">{leftLabel}</span>
          <span className="text-sm text-muted-foreground">{rightLabel}</span>
        </div>
        <div className="relative">
          <div className="w-full h-2 bg-muted rounded-full"></div>
          <div 
            className="absolute top-0 left-0 h-2 bg-primary rounded-full" 
            style={{ width: `${value}%` }}
          ></div>
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-pointer" 
            style={{ left: `${value}%`, marginLeft: '-8px' }}
            onMouseDown={(e) => {
              const slider = e.currentTarget.parentElement;
              const handleMouseMove = (e: MouseEvent) => {
                const rect = slider!.getBoundingClientRect();
                const newValue = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                onChange(newValue);
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function Toggle({ label, description, enabled, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-lg">
          {label === "Notifications" ? "🔔" : label === "Voice Messages" ? "🎤" : "🌙"}
        </span>
        <div>
          <h3 className="text-foreground font-medium">{label}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
          enabled ? 'bg-primary' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [responseSpeed, setResponseSpeed] = useState(75);
  const [emotionalDepth, setEmotionalDepth] = useState(80);
  const [notifications, setNotifications] = useState(true);
  const [voiceMessages, setVoiceMessages] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [relationshipStyle, setRelationshipStyle] = useState("Romantic Partner");
  const [yourName, setYourName] = useState("");

  return (
    <div className="p-8 max-w-4xl space-y-8">
      {/* Personal Preferences Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-purple-500">💜</span>
          <h2 className="text-xl font-semibold text-foreground">Personal Preferences</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Your Name */}
          <div className="space-y-3">
            <h3 className="text-foreground font-medium">Your Name</h3>
            {/* <p className="text-muted-foreground text-sm">How should Aria call you?</p> */}
            <input
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Relationship Style */}
          <div className="space-y-3">
            <h3 className="text-foreground font-medium">Relationship Style</h3>
            <select
              value={relationshipStyle}
              onChange={(e) => setRelationshipStyle(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Romantic Partner">Romantic Partner</option>
              <option value="Best Friend">Best Friend</option>
              <option value="Mentor">Mentor</option>
              <option value="Companion">Companion</option>
            </select>
          </div>
        </div>
        
        {/* Response Speed Slider */}
        <Slider
          label="Response Speed"
          leftLabel="Thoughtful"
          rightLabel="Instant"
          value={responseSpeed}
          onChange={setResponseSpeed}
        />
        
        {/* Emotional Depth Slider */}
        <Slider
          label="Emotional Depth"
          leftLabel="Reserved"
          rightLabel="Expressive"
          value={emotionalDepth}
          onChange={setEmotionalDepth}
        />
      </div>
      
      {/* App Settings Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-purple-500">⚙️</span>
          <h2 className="text-xl font-semibold text-foreground">App Settings</h2>
        </div>
        
        <div className="space-y-6">
          <Toggle
            label="Notifications"
            description="Get notified when Aria sends you messages"
            enabled={notifications}
            onChange={setNotifications}
          />
          
          <Toggle
            label="Voice Messages"
            description="Enable voice responses from Aria"
            enabled={voiceMessages}
            onChange={setVoiceMessages}
          />
          
        </div>
      </div>
      
      {/* Memory & Privacy Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Memory & Privacy</h2>
        
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-secondary text-foreground rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
            Export Chat History
          </button>
          <button className="px-6 py-3 bg-secondary text-foreground rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
            Clear All Memories
          </button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-foreground font-medium">Data Retention</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your conversations are stored securely and used only to enhance your experience with Aria. You can delete your data at any time.
          </p>
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
            Delete All Data
          </button>
        </div>
      </div>
    </div>
  );
}