import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  Loader2,
  Cpu,
  FileJson,
  Calendar,
  Flame,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Award,
  AlertCircle,
  Copy,
  ChevronRight,
  Plus
} from "lucide-react";
import { FoodAnalysisResult, MealHistoryItem } from "./types";
import CameraCapture from "./components/CameraCapture";
import FoodSamples from "./components/FoodSamples";
import NutritionDashboard from "./components/NutritionDashboard";
import HistoryList from "./components/HistoryList";

export default function App() {
  const [activeImage, setActiveImage] = useState<string>("");
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiConfidence, setApiConfidence] = useState<number | null>(null);
  const [totalRequestCount, setTotalRequestCount] = useState<number>(0);
  const [activeResult, setActiveResult] = useState<FoodAnalysisResult | null>(null);
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load persistent scan log history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nutriscan_history_v1");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
    // Set mock or real request count based on history size
    const savedCount = localStorage.getItem("nutriscan_request_count");
    if (savedCount) {
      setTotalRequestCount(parseInt(savedCount, 10));
    } else {
      const initialCount = 14 + (saved ? JSON.parse(saved).length : 0);
      setTotalRequestCount(initialCount);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = (updated: MealHistoryItem[]) => {
    setHistory(updated);
    localStorage.setItem("nutriscan_history_v1", JSON.stringify(updated));
  };

  // Helper to trigger API recognition
  const analyzeFoodImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setErrorMsg("");
    setApiLatency(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType: "image/jpeg",
        }),
      });

      const endTime = Date.now();
      const elapsed = endTime - startTime;
      setApiLatency(elapsed);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze the food photograph.");
      }

      const result: FoodAnalysisResult = await response.json();
      setActiveResult(result);
      setApiConfidence(result.confidence);

      // Add to today's scan log unless it's an unrecognized dish
      if (result.confidence > 0.1 && result.foodName !== "Unknown (No Food Detected)") {
        const newLog: MealHistoryItem = {
          id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date().toISOString(),
          image: base64Image,
          result: result,
        };
        const updatedHistory = [newLog, ...history];
        saveHistory(updatedHistory);
      }

      // Increment request counters
      const newCount = totalRequestCount + 1;
      setTotalRequestCount(newCount);
      localStorage.setItem("nutriscan_request_count", newCount.toString());

    } catch (err: any) {
      console.error("Analysis failure:", err);
      setErrorMsg(err.message || "An error occurred while connecting to the image recognition AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select sample image trigger
  const handleSelectSample = (base64Image: string) => {
    setActiveImage(base64Image);
    setIsCameraOpen(false);
    analyzeFoodImage(base64Image);
  };

  // Delete logged item
  const handleDeleteItem = (id: string) => {
    const filtered = history.filter((item) => item.id !== id);
    saveHistory(filtered);
  };

  // Clear all items
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your daily food scan logs?")) {
      saveHistory([]);
    }
  };

  // Select logged item to inspect
  const handleSelectLogItem = (item: MealHistoryItem) => {
    setActiveImage(item.image);
    setActiveResult(item.result);
    setApiConfidence(item.result.confidence);
    setApiLatency(null); // Clear previous latency since it's a loaded item
  };

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Manual file input selection
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setActiveImage(base64);
      setIsCameraOpen(false);
      analyzeFoodImage(base64);
    };
    reader.onerror = () => {
      setErrorMsg("Error reading uploaded file.");
    };
    reader.readAsDataURL(file);
  };

  // Copy JSON response to clipboard
  const handleCopyJSON = () => {
    if (!activeResult) return;
    navigator.clipboard.writeText(JSON.stringify(activeResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Header Navigation matching theme */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/10">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-800">
            NutriScan<span className="text-emerald-600">AI</span>
          </span>
          <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ml-2 border border-slate-200">
            API v2.4
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="font-medium text-xs">API Status: Operational</span>
          </div>
          <nav className="flex space-x-4">
            <a href="#food-samples-grid" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition">Demo Items</a>
            <a href="#meal-diary-history" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition">Calorie Log</a>
          </nav>
        </div>
      </header>

      {/* Main content grid split */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-x-hidden">
        
        {/* Left Column: Capture, Samples, & Analysis Details */}
        <section className="lg:col-span-8 space-y-6 flex flex-col">
          
          {/* Main Drag-Drop or Scan Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Active Image Analysis Feed</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {activeResult ? `ID: scan_${activeResult.foodName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 10)}` : "ID: waiting_input"}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {isCameraOpen ? (
                <CameraCapture
                  onCapture={(base64) => {
                    setActiveImage(base64);
                    setIsCameraOpen(false);
                    analyzeFoodImage(base64);
                  }}
                  onClose={() => setIsCameraOpen(false)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Photo Target Block */}
                  <div className="md:col-span-6 flex flex-col">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-200 ${
                        activeImage
                          ? "border-emerald-500/50 bg-slate-50"
                          : dragOver
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
                      }`}
                    >
                      {activeImage ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img
                            src={activeImage}
                            alt="Captured meal"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Scanned Source</p>
                            <h4 className="text-sm font-bold text-white truncate">
                              {activeResult ? activeResult.foodName : "Uploading photograph..."}
                            </h4>
                          </div>

                          {/* Scanner scanning effect if loading */}
                          {isAnalyzing && (
                            <div className="absolute inset-x-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-[bounce_2s_infinite] top-0" />
                          )}
                        </div>
                      ) : (
                        <div className="p-6 text-center flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 border border-emerald-100">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-slate-700">Drop food picture here</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                            Supports PNG, JPG, or WebP up to 10MB
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm">
                              Browse Files
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInputChange}
                                className="hidden"
                              />
                            </label>
                            
                            <button
                              onClick={() => setIsCameraOpen(true)}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Camera className="w-3.5 h-3.5 text-slate-500" />
                              <span>Use Camera</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Overlays when busy */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                          <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-2" />
                          <p className="font-display font-semibold text-sm">Computer Vision Engine</p>
                          <p className="text-xs text-slate-300 mt-1">Recognizing recipe & ingredients...</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Recapture Bar if already uploaded */}
                    {activeImage && !isAnalyzing && (
                      <div className="mt-3 flex gap-2">
                        <label className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition cursor-pointer border border-slate-200">
                          Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => setIsCameraOpen(true)}
                          className="px-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-950 transition cursor-pointer"
                          title="Snap new photo"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Side Info: Live Scanner Guidelines */}
                  <div className="md:col-span-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Classification Model</h4>
                      <h2 className="font-display font-bold text-xl text-slate-800 tracking-tight leading-snug">
                        Real-time Food Recognizer & Caloric Estimate
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed mt-2">
                        Our integrated computer vision engine leverages multi-modal AI to identify dishes, cross-reference volume portions, isolate ingredients, and synthesize accurate micro/macro nutrient profiles instantly.
                      </p>

                      {errorMsg && (
                        <div className="mt-4 p-3.5 bg-red-50 border border-red-100 text-red-800 rounded-2xl text-xs flex gap-2.5 items-start">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">Analysis failed</p>
                            <p className="text-red-600/90 mt-0.5">{errorMsg}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Extraction Placeholder or Mini Overview */}
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confidence Indicator</h4>
                      {activeResult ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-grow">
                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                              <span>Match score</span>
                              <span>{Math.round((apiConfidence || 0) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  (apiConfidence || 0) >= 0.8
                                    ? "bg-emerald-500"
                                    : (apiConfidence || 0) >= 0.5
                                    ? "bg-teal-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${(apiConfidence || 0) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0">
                            <Award className={`w-5 h-5 ${(apiConfidence || 0) >= 0.8 ? "text-emerald-500" : "text-slate-400"}`} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Awaiting image analysis. Upload a meal photo to populate recognition logs and breakdown.
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Three Metric Cards underneath matching design */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Request Latency</p>
              <p className="text-2xl font-bold font-display text-slate-800">
                {apiLatency !== null ? `${apiLatency}ms` : "---"}
              </p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: apiLatency !== null ? `${Math.min(100, (1200 / apiLatency) * 100)}%` : "0%" }}
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence Rating</p>
              <p className="text-2xl font-bold font-display text-slate-800">
                {apiConfidence !== null ? `${(apiConfidence * 100).toFixed(1)}%` : "---"}
              </p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: apiConfidence !== null ? `${apiConfidence * 100}%` : "0%" }}
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Requests Scanned</p>
              <p className="text-2xl font-bold font-display text-slate-800">
                {totalRequestCount} <span className="text-xs font-normal text-slate-400">/ 500</span>
              </p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalRequestCount / 500) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Click food demo items */}
          <FoodSamples onSelectSample={handleSelectSample} />

          {/* Dynamic Active Breakdown Card once complete */}
          {activeResult && (
            <NutritionDashboard result={activeResult} imageUrl={activeImage} />
          )}

        </section>

        {/* Right Column: Code Console & Today's Nutrition Tracker */}
        <section className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Today's Calories Tracker & Food Logs */}
          <HistoryList
            items={history}
            onSelectItem={handleSelectLogItem}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearHistory}
          />

          {/* API Response JSON matching the high-end dark slate box */}
          <div className="flex flex-col bg-slate-900 rounded-3xl shadow-xl border border-slate-800 overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest">
                REALTIME JSON OUT
              </span>
              <button
                onClick={handleCopyJSON}
                disabled={!activeResult}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:hover:text-emerald-400 cursor-pointer flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? "COPIED" : "COPY"}</span>
              </button>
            </div>

            <div className="p-5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-y-auto max-h-[420px]">
              {activeResult ? (
                <pre className="whitespace-pre-wrap select-all selection:bg-slate-800">
                  {JSON.stringify(activeResult, null, 2)}
                </pre>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <FileJson className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Awaiting API Call</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
                    Initiate a scanner session or pick a demo dish to inspect structured JSON schema output.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-950/50 border-t border-slate-800 text-[9px] text-slate-500 flex justify-between font-mono">
              <span>Time: {new Date().toISOString().slice(0, 19).replace("T", " ")} UTC</span>
              <span>Host: cloudrun-cluster-04</span>
            </div>
          </div>

        </section>

      </main>

      {/* Bottom Console Status Bar */}
      <footer className="h-8 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] font-mono font-medium text-slate-500 shrink-0">
        <div className="flex space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-slate-700">200 OK</span>
          </span>
          <span className="hidden sm:inline">Methods: POST</span>
          <span className="hidden sm:inline">Auth: Secure Server-Side</span>
        </div>
        <div className="flex space-x-4">
          <span>AI: Gemini 3.5 Flash</span>
          <span className="hidden md:inline">API Key: Auto-provisioned</span>
        </div>
      </footer>

    </div>
  );
}
