import React, { useState } from "react";
import { Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { FoodSample } from "../types";

interface FoodSamplesProps {
  onSelectSample: (base64Image: string) => void;
}

const SAMPLES: FoodSample[] = [
  {
    name: "Avocado & Egg Toast",
    url: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600",
    tagline: "Healthy whole wheat toast topped with mashed avocado and a perfect poached egg.",
  },
  {
    name: "Pepperoni Pizza",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
    tagline: "Thin-crust cheese pizza loaded with zesty pepperoni slices.",
  },
  {
    name: "Caesar Salad",
    url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=600",
    tagline: "Crisp romaine lettuce, creamy caesar dressing, parmesan, and crunchy croutons.",
  },
  {
    name: "Sushi Platter",
    url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600",
    tagline: "An assortment of fresh salmon maki, nigiri, and California rolls.",
  },
];

export default function FoodSamples({ onSelectSample }: FoodSamplesProps) {
  const [loadingSampleIndex, setLoadingSampleIndex] = useState<number | null>(null);

  const handleSampleClick = async (sample: FoodSample, index: number) => {
    setLoadingSampleIndex(index);
    try {
      // 1. Fetch the image directly
      const response = await fetch(sample.url, { mode: "cors" });
      const blob = await response.blob();

      // 2. Convert blob to Base64 using a FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onSelectSample(base64data);
        setLoadingSampleIndex(null);
      };
      reader.onerror = () => {
        throw new Error("Failed to read image blob");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("CORS direct blob fetch failed, falling back to canvas technique:", err);
      // Fallback: Use image element with crossOrigin anonymous and canvas to base64
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = sample.url;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            onSelectSample(dataUrl);
          }
          setLoadingSampleIndex(null);
        };
        img.onerror = () => {
          alert("Could not load sample image. Please try uploading your own photo!");
          setLoadingSampleIndex(null);
        };
      } catch (innerErr) {
        console.error("Canvas conversion failed:", innerErr);
        setLoadingSampleIndex(null);
      }
    }
  };

  return (
    <div id="food-samples-grid" className="mt-6 border border-zinc-100 rounded-3xl p-6 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-emerald-600" />
        <h3 className="font-display font-semibold text-lg text-zinc-900">Scan Demo Dishes</h3>
      </div>
      <p className="text-sm text-zinc-500 mb-5">
        Don't have a food picture? Instantly analyze one of our ready-made, photorealistic culinary items.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SAMPLES.map((sample, idx) => (
          <button
            key={idx}
            disabled={loadingSampleIndex !== null}
            onClick={() => handleSampleClick(sample, idx)}
            className="group flex flex-col text-left border border-zinc-200/80 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-md transition duration-200 bg-zinc-50/50 hover:bg-white cursor-pointer relative disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden">
              <img
                src={sample.url}
                alt={sample.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              {loadingSampleIndex === idx && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1" />
                  <span className="text-[10px] text-zinc-300 text-center font-medium">Downloading...</span>
                </div>
              )}
            </div>
            <div className="p-3 flex-grow flex flex-col justify-between">
              <div>
                <h4 className="font-sans font-semibold text-xs text-zinc-900 group-hover:text-emerald-700 transition">
                  {sample.name}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {sample.tagline}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <ImageIcon className="w-3 h-3" />
                <span>Test Scanner</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
