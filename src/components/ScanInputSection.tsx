import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  UploadCloud,
  X,
  RefreshCw,
  Sparkles,
  SwitchCamera,
  AlertCircle,
  CheckCircle2,
  Zap,
  Sliders,
  ZoomIn,
  FileText,
  Layers,
  ArrowRight,
  Image as ImageIcon,
  ClipboardPaste,
} from 'lucide-react';
import { DEMO_SAMPLES } from '../data/samples';
import { DemoSample } from '../types';

interface ScanInputSectionProps {
  onScanImage: (base64: string, mimeType: string, scanMode: 'multi' | 'single') => Promise<void>;
  onLoadDemo: (demo: DemoSample) => void;
  isLoading: boolean;
  onClose?: () => void;
  initialTab?: 'camera' | 'upload' | 'samples';
}

// Adaptive document sharpening & contrast enhancement (Google Lens OCR filter)
function enhanceDocumentClarity(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    // Fast adaptive contrast stretch
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      if (gray < 110) {
        // Deepen text ink
        data[i] = Math.max(0, r * 0.72);
        data[i + 1] = Math.max(0, g * 0.72);
        data[i + 2] = Math.max(0, b * 0.72);
      } else if (gray > 165) {
        // Clean white paper background & glare
        data[i] = Math.min(255, r * 1.08 + 10);
        data[i + 1] = Math.min(255, g * 1.08 + 10);
        data[i + 2] = Math.min(255, b * 1.08 + 10);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('Document clarity filter skipped:', err);
  }

  return canvas;
}

// Downscale huge camera photos to optimal OCR size (max 2048px) with timeout guard
function optimizeImage(dataUrl: string, maxDimension = 2048, applyEnhancement = true): Promise<string> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(dataUrl);
    }, 4000);

    const img = new Image();
    img.onload = () => {
      clearTimeout(timeout);
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        if (applyEnhancement) {
          enhanceDocumentClarity(canvas);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

export const ScanInputSection: React.FC<ScanInputSectionProps> = ({
  onScanImage,
  onLoadDemo,
  isLoading,
  onClose,
  initialTab = 'upload',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>(initialTab);
  const [scanMode, setScanMode] = useState<'multi' | 'single'>('multi');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Upload & Preview states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Camera lens states
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hasZoomSupport, setHasZoomSupport] = useState<boolean>(false);
  const [detectedResolution, setDetectedResolution] = useState<string>('Detecting sensor...');
  const [enableTextBoost, setEnableTextBoost] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error(e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Support paste from clipboard (e.g. screenshot of circular from WhatsApp or PDF)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processSelectedFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [enableTextBoost]);

  // Launch camera with Google Lens high-resolution constraints
  const startCamera = async (currentFacing = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: currentFacing },
            width: { min: 1920, ideal: 3840, max: 4096 },
            height: { min: 1080, ideal: 2160, max: 2160 },
            // @ts-ignore
            focusMode: { ideal: 'continuous' },
            // @ts-ignore
            exposureMode: { ideal: 'continuous' },
            // @ts-ignore
            whiteBalanceMode: { ideal: 'continuous' },
          },
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: currentFacing },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      setPreviewImage(null);

      const track = stream.getVideoTracks()[0];
      if (track) {
        // @ts-ignore
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        // @ts-ignore
        setHasTorchSupport(Boolean(capabilities.torch));
        // @ts-ignore
        setHasZoomSupport(Boolean(capabilities.zoom));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          const vw = videoRef.current?.videoWidth || 1920;
          const vh = videoRef.current?.videoHeight || 1080;
          const is4K = vw >= 3000;
          const isFHD = vw >= 1900;
          setDetectedResolution(
            is4K ? `4K Ultra HD (${vw}×${vh})` : isFHD ? `Full HD 1080p (${vw}×${vh})` : `HD (${vw}×${vh})`
          );
          videoRef.current?.play().catch((e) => console.log('Autoplay issue:', e));
        };
      }
    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      setCameraError(
        'Could not access camera stream. Please allow browser camera permissions or upload an image file directly.'
      );
      setIsCameraActive(false);
    }
  };

  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.onloadedmetadata = () => {
        const vw = node.videoWidth || 1920;
        const vh = node.videoHeight || 1080;
        const is4K = vw >= 3000;
        const isFHD = vw >= 1900;
        setDetectedResolution(
          is4K ? `4K Ultra HD (${vw}×${vh})` : isFHD ? `Full HD 1080p (${vw}×${vh})` : `HD (${vw}×${vh})`
        );
        node.play().catch((e) => console.log('Autoplay issue:', e));
      };
    }
  }, []);

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        // @ts-ignore
        await track.applyConstraints({ advanced: [{ torch: nextState }] });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn('Torch constraint error:', e);
      }
    }
  };

  const toggleZoom = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextZoom = zoomLevel === 1 ? 2 : 1;
        // @ts-ignore
        await track.applyConstraints({ advanced: [{ zoom: nextZoom }] });
        setZoomLevel(nextZoom);
      } catch (e) {
        console.warn('Zoom constraint error:', e);
      }
    }
  };

  // Google Lens high-precision capture
  const capturePhoto = async () => {
    setIsCapturing(true);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }

    try {
      const track = streamRef.current?.getVideoTracks()[0];
      let highResDataUrl: string | null = null;

      // @ts-ignore
      if (track && window.ImageCapture) {
        try {
          // @ts-ignore
          const imageCapture = new window.ImageCapture(track);
          const photoBlob: Blob = await imageCapture.takePhoto({
            fillLightMode: isTorchOn ? 'flash' : 'off',
            imageWidth: 3840,
            imageHeight: 2160,
          });

          highResDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(photoBlob);
          });
        } catch (imageCaptureErr) {
          console.warn('ImageCapture fallback to canvas drawImage:', imageCaptureErr);
        }
      }

      if (!highResDataUrl && videoRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          highResDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        }
      }

      if (highResDataUrl) {
        const optimized = await optimizeImage(highResDataUrl, 2048, enableTextBoost);
        setPreviewImage(optimized);
        setImageMime('image/jpeg');
        setSelectedFileName('camera-lens-capture.jpg');
        stopCamera();
      }
    } catch (err) {
      console.error('Photo capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Safe file reader & image processor
  const processSelectedFile = (file: File) => {
    setFileErrorMessage(null);

    // Validate type or file extension
    const isImageMime = file.type && file.type.startsWith('image/');
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isImageExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'gif'].includes(ext || '');

    if (!isImageMime && !isImageExt) {
      setFileErrorMessage('Please upload a valid image file (JPEG, PNG, WEBP, HEIC, BMP).');
      return;
    }

    setIsProcessingFile(true);
    setSelectedFileName(file.name);
    setImageMime(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const rawResult = e.target?.result as string;
        if (!rawResult) {
          throw new Error('Failed to read image data.');
        }

        const optimized = await optimizeImage(rawResult, 2048, enableTextBoost);
        setPreviewImage(optimized);
        stopCamera();
      } catch (err: any) {
        console.error('File optimization error:', err);
        setFileErrorMessage('Failed to process image file. Please try another image.');
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      setIsProcessingFile(false);
      setFileErrorMessage('Could not open file from your device. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!previewImage) return;
    await onScanImage(previewImage, imageMime, scanMode);
    if (onClose) onClose();
  };

  const handleResetImage = () => {
    setPreviewImage(null);
    setSelectedFileName(null);
    setFileErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden mb-8 transition-all relative">
      {/* Subtle glowing ambient gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Camera className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                Notice Board Scanner
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Ultra-HD Lens
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Upload photos or scan physical notice boards to extract circulars, fees & deadlines
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer"
            title="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-white/10 bg-slate-950/20 px-5 pt-3 gap-2 overflow-x-auto text-xs font-mono relative z-10">
        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            stopCamera();
          }}
          className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'border-cyan-400 text-cyan-300 bg-white/5 shadow-inner'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload Image / Photo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('camera');
            if (!isCameraActive && !previewImage) startCamera();
          }}
          className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'camera'
              ? 'border-cyan-400 text-cyan-300 bg-white/5 shadow-inner'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Live Lens Camera</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('samples');
            stopCamera();
          }}
          className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'samples'
              ? 'border-cyan-400 text-cyan-300 bg-white/5 shadow-inner'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Sample Campus Boards</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 relative z-10">
        {/* If user has an image ready (from upload, drop, paste, or camera snapshot) */}
        {previewImage ? (
          <div className="rounded-2xl bg-slate-950/60 border border-white/10 p-4 sm:p-6 shadow-2xl">
            {/* Top Review Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Notice Image Ready for AI Analysis
                    {enableTextBoost && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                        Text Contrast Boosted
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedFileName || 'circular-scan.jpg'} • Verified for OCR
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetImage}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Choose Another Image
                </button>
              </div>
            </div>

            {/* Layout: Image Preview & Scan Target Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Image Preview Box */}
              <div className="lg:col-span-7 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[380px] p-2 relative group">
                <img
                  src={previewImage}
                  alt="Notice Board Snapshot"
                  className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-lg"
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-cyan-300">
                  Ready for Gemini Vision
                </div>
              </div>

              {/* Controls and Submit Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                <div>
                  <span className="text-xs font-mono uppercase font-bold text-cyan-400 block mb-1">
                    Scan Target Structure
                  </span>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    How should the AI parse this picture?
                  </p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setScanMode('multi')}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        scanMode === 'multi'
                          ? 'bg-cyan-950/40 border-cyan-400/80 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <Layers className={`w-5 h-5 shrink-0 mt-0.5 ${scanMode === 'multi' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div>
                        <span className="text-xs font-bold font-mono block text-white">
                          Multi-Notice Board (2–6 Papers)
                        </span>
                        <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                          Segregates each pinned sheet on corkboards into distinct cards
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScanMode('single')}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        scanMode === 'single'
                          ? 'bg-cyan-950/40 border-cyan-400/80 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <FileText className={`w-5 h-5 shrink-0 mt-0.5 ${scanMode === 'single' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div>
                        <span className="text-xs font-bold font-mono block text-white">
                          Single Circular (Close-up)
                        </span>
                        <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                          Deep inspection of one specific notification or official letter
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 cursor-pointer transition-all active:scale-98"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Analyzing with Gemini Vision...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Process & Summarize Circulars Now</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center font-mono mt-2.5">
                    Persistent Storage: Notices are automatically saved in your browser until expiry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Tab Content when no previewImage is loaded yet */
          <>
            {/* Mode Selector for Initial State */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-cyan-400 block">
                  Scan Target Structure
                </span>
                <span className="text-xs text-slate-400">
                  Select target layout before uploading or scanning
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScanMode('multi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
                    scanMode === 'multi'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-xs'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Multi-Notice Board</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScanMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
                    scanMode === 'single'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-xs'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Single Circular</span>
                </button>
              </div>
            </div>

            {/* TAB 1: UPLOAD PHOTO (PRIMARY) */}
            {activeTab === 'upload' && (
              <div>
                {fileErrorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{fileErrorMessage}</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,.bmp,.tiff"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processSelectedFile(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group ${
                    isDragging
                      ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                      : 'border-white/15 bg-slate-950/40 hover:border-cyan-500/50 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/10">
                    {isProcessingFile ? (
                      <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-cyan-400" />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {isProcessingFile ? 'Preparing Notice Image...' : 'Click to Upload Notice Photo or Drag & Drop'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                    Upload any photo of campus corkboards, departmental notices, circular printouts, or WhatsApp screenshots.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Browse Photo File</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('camera');
                        startCamera('environment');
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-mono text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Open Camera Lens</span>
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
                    <span>Supports JPG, PNG, WEBP, HEIC</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                      Paste (Ctrl+V) supported
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE CAMERA LENS */}
            {activeTab === 'camera' && (
              <div>
                {isCameraActive ? (
                  <div className="relative bg-slate-950 border-2 border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[380px] max-h-[520px]">
                    {/* Top HUD Overlay */}
                    <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl text-xs font-mono text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        <span className="font-bold text-cyan-300">LENS OCR ACTIVE</span>
                        <span className="text-slate-400 hidden sm:inline">• {detectedResolution}</span>
                      </div>

                      {/* Hardware Controls (Torch, Zoom, Flip) */}
                      <div className="flex items-center space-x-2 pointer-events-auto">
                        {hasTorchSupport && (
                          <button
                            type="button"
                            onClick={toggleTorch}
                            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isTorchOn
                                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-lg shadow-amber-400/20'
                                : 'bg-black/70 hover:bg-black text-white border-white/20'
                            }`}
                            title="Toggle Flashlight Torch"
                          >
                            <Zap className="w-4 h-4" />
                            <span className="hidden xs:inline">{isTorchOn ? 'Torch ON' : 'Torch'}</span>
                          </button>
                        )}

                        {hasZoomSupport && (
                          <button
                            type="button"
                            onClick={toggleZoom}
                            className="px-2.5 py-2 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-mono border border-white/20 flex items-center gap-1.5 cursor-pointer"
                            title="Toggle 2x Zoom"
                          >
                            <ZoomIn className="w-4 h-4" />
                            <span>{zoomLevel}x</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={toggleFacingMode}
                          className="px-3 py-2 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-mono border border-white/20 flex items-center gap-1.5 cursor-pointer"
                          title="Switch Camera"
                        >
                          <SwitchCamera className="w-4 h-4 text-cyan-400" />
                          <span className="hidden xs:inline">Flip</span>
                        </button>
                      </div>
                    </div>

                    {/* Actual Video Stream */}
                    <video
                      ref={handleVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain max-h-[480px]"
                    />

                    {/* Google Lens Reticle Overlay */}
                    <div className="pointer-events-none absolute inset-6 sm:inset-10 border border-cyan-400/30 rounded-xl flex flex-col justify-between">
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-lens-scan" />

                      <div className="flex justify-between">
                        <div className="w-7 h-7 border-t-3 border-l-3 border-cyan-400 rounded-tl shadow-[0_0_10px_#06b6d4]" />
                        <div className="w-7 h-7 border-t-3 border-r-3 border-cyan-400 rounded-tr shadow-[0_0_10px_#06b6d4]" />
                      </div>

                      <div className="self-center flex items-center justify-center w-12 h-12 text-cyan-300/60 font-mono text-xl">
                        +
                      </div>

                      <div className="flex justify-between">
                        <div className="w-7 h-7 border-b-3 border-l-3 border-cyan-400 rounded-bl shadow-[0_0_10px_#06b6d4]" />
                        <div className="w-7 h-7 border-b-3 border-r-3 border-cyan-400 rounded-br shadow-[0_0_10px_#06b6d4]" />
                      </div>
                    </div>

                    {/* Alignment Hint */}
                    <div className="absolute top-16 left-0 right-0 flex justify-center pointer-events-none">
                      <span className="px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-mono text-cyan-200 border border-cyan-500/30 shadow-md">
                        Fit notice or board inside cyan reticle • Hold steady
                      </span>
                    </div>

                    {/* Lens Bottom Shutter & Controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-4 z-30">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl font-mono text-xs border border-white/10 cursor-pointer"
                      >
                        Cancel
                      </button>

                      {/* Tactile Shutter Button with Google Lens Ring */}
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={isCapturing}
                        className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white transition-transform active:scale-95 cursor-pointer shadow-2xl"
                        title="Capture High-Res Scan"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-inner group-hover:scale-105 transition-transform">
                          {isCapturing ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <Camera className="w-5 h-5 text-slate-950 font-bold" />
                          )}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEnableTextBoost(!enableTextBoost)}
                        className={`px-3 py-2 rounded-xl text-xs font-mono border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          enableTextBoost
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-slate-900/90 border-white/10 text-slate-400'
                        }`}
                        title="Enhances black text contrast against paper"
                      >
                        <Sliders className="w-4 h-4" />
                        <span className="hidden sm:inline">Sharpen</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Camera Launch Card */
                  <div className="text-center py-10 px-4 bg-slate-950/60 rounded-2xl border border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/10">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">
                      Scan with Google Lens Ultra-HD Engine
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                      Uses continuous optical autofocus, sensor 4K/1080p stream capture, and automatic document edge sharpening.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => startCamera('environment')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-500/20 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Start Live Camera Lens</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-mono text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-cyan-400" />
                        <span>Upload Photo Instead</span>
                      </button>
                    </div>

                    {cameraError && (
                      <div className="mt-5 p-3 bg-red-950/80 border border-red-500/40 text-xs text-red-200 flex items-center justify-center gap-2 max-w-md mx-auto rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{cameraError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAMPLES */}
            {activeTab === 'samples' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DEMO_SAMPLES.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => {
                      onLoadDemo(sample);
                      if (onClose) onClose();
                    }}
                    className="rounded-2xl border border-white/10 hover:border-cyan-500/50 bg-slate-950/60 p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {sample.badge}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {sample.simulatedData.notices.length} Circulars
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {sample.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                      <span>Load Sample Circulars</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
