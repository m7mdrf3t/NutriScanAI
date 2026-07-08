import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, X, Sparkles } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Stop current video streams
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Get available video devices
  const getCameras = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error listing cameras:", err);
    }
  };

  // Start the video stream
  const startCamera = async (deviceId: string) => {
    stopStream();
    setError("");
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check camera permissions or try another device.");
    }
  };

  // Trigger camera startup when device ID changes
  useEffect(() => {
    startCamera(selectedDeviceId);
    getCameras();
    return () => stopStream();
  }, [selectedDeviceId]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      // Flash animation trigger
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 150);

      // Match canvas size to video aspect ratio
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, width, height);

      // Convert to high-quality JPEG base64 Data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onCapture(dataUrl);
    }
  };

  return (
    <div id="camera-capture-container" className="relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden p-6 max-w-xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <h3 className="font-display font-semibold text-lg text-white">Live Food Scanner</h3>
        </div>
        <button
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          title="Close camera"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error ? (
        <div className="bg-red-950/40 border border-red-900 text-red-300 p-4 rounded-2xl text-sm mb-4">
          <p className="font-medium mb-1">Camera Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isFlashing && (
            <div className="absolute inset-0 bg-white opacity-90 transition-opacity z-10" />
          )}

          {/* Scanner Line Overlay */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500/80 shadow-[0_0_12px_#10b981] animate-bounce z-0" />
        </div>
      )}

      {/* Hidden canvas used to snap photo */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Device Selection dropdown */}
        {devices.length > 1 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 text-zinc-500 flex-shrink-0 animate-pulse" />
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-xs"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
          <button
            onClick={capturePhoto}
            disabled={!!error || !stream}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Analyze Dish
          </button>
        </div>
      </div>
    </div>
  );
}
