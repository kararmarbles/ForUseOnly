import React, { useRef, useEffect } from 'react';
import { CaptureSource, RecordingState, ScreenSelectionMode, AppSettings } from '../types';
import { Camera, Monitor, Video, Maximize } from 'lucide-react';

interface PreviewViewportProps {
  source: CaptureSource;
  screenStream: MediaStream | null;
  webcamStream: MediaStream | null;
  recordingState: RecordingState;
  screenSelectionMode: ScreenSelectionMode;
  settings: AppSettings;
  countdownValue: number | null;
  onStartCapture: () => void;
  onRequestWebcam: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const PreviewViewport: React.FC<PreviewViewportProps> = ({
  source,
  screenStream,
  webcamStream,
  recordingState,
  screenSelectionMode,
  settings,
  countdownValue,
  onStartCapture,
  onRequestWebcam,
  isExpanded,
  onToggleExpand,
}) => {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Bind video stream
  useEffect(() => {
    if (!mainVideoRef.current) return;

    if (source === 'screen' && screenStream) {
      mainVideoRef.current.srcObject = screenStream;
      mainVideoRef.current.play().catch(() => {});
    } else if (source === 'webcam' && webcamStream) {
      mainVideoRef.current.srcObject = webcamStream;
      mainVideoRef.current.play().catch(() => {});
    } else {
      mainVideoRef.current.srcObject = null;
    }
  }, [source, screenStream, webcamStream]);

  // Bind PiP overlay
  useEffect(() => {
    if (pipVideoRef.current && settings.showWebcamOverlay && webcamStream) {
      pipVideoRef.current.srcObject = webcamStream;
      pipVideoRef.current.play().catch(() => {});
    }
  }, [settings.showWebcamOverlay, webcamStream]);

  const hasActiveStream =
    (source === 'screen' && !!screenStream) ||
    (source === 'webcam' && !!webcamStream);

  return (
    <div className={`relative flex flex-col bg-black overflow-hidden select-none transition-all duration-200 ${
      isExpanded ? 'flex-1' : 'flex-1 min-h-[360px]'
    }`}>
      {/* Video Display Area */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        {hasActiveStream ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Main Video Stream */}
            <video
              ref={mainVideoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain pointer-events-none"
            />

            {/* Webcam PiP Overlay */}
            {settings.showWebcamOverlay && (
              <div
                className={`absolute z-20 border-2 border-green-500 shadow-2xl rounded overflow-hidden bg-black ${
                  settings.webcamOverlaySize === 'small'
                    ? 'w-40 h-28'
                    : settings.webcamOverlaySize === 'large'
                    ? 'w-64 h-44'
                    : 'w-52 h-36'
                } ${
                  settings.webcamOverlayPosition === 'top-left'
                    ? 'top-4 left-4'
                    : settings.webcamOverlayPosition === 'top-right'
                    ? 'top-4 right-4'
                    : settings.webcamOverlayPosition === 'bottom-left'
                    ? 'bottom-8 left-4'
                    : 'bottom-8 right-4'
                }`}
              >
                {webcamStream ? (
                  <video
                    ref={pipVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-slate-300 text-[10px] p-2 text-center">
                    <Video className="w-5 h-5 text-amber-400 mb-1" />
                    <span>Webcam overlay enabled</span>
                    <button
                      onClick={onRequestWebcam}
                      className="mt-1 px-1.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[9px]"
                    >
                      Connect Camera
                    </button>
                  </div>
                )}
                <div className="absolute top-1 left-1 bg-black/70 px-1 py-0.5 rounded text-[8px] text-green-300 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>Webcam PiP</span>
                </div>
              </div>
            )}

            {/* Selection Rectangle Overlay (if custom rectangle mode is selected) */}
            {screenSelectionMode === 'rectangle' && (
              <div className="absolute inset-8 border-2 border-dashed border-cyan-400 pointer-events-none flex items-start justify-start p-1 bg-cyan-500/5">
                <span className="bg-cyan-600 text-white text-[9px] px-1 py-0.5 rounded font-mono">
                  Recording Area: Selection Rectangle [1680x920]
                </span>
              </div>
            )}

            {/* Optional Timestamp Watermark */}
            {settings.showTimestampWatermark && (
              <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 rounded text-white font-mono text-xs border border-white/10">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </div>
            )}

            {/* Optional Text Caption */}
            {settings.showTextCaption && settings.textCaption && (
              <div className="absolute top-3 right-3 bg-black/75 px-3 py-1 rounded text-yellow-300 font-semibold text-xs tracking-wider border border-yellow-500/30">
                {settings.textCaption}
              </div>
            )}
          </div>
        ) : (
          /* Empty / Please Wait Screen (Authentic to Screenshots 5 and 7) */
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="text-3xl text-slate-300 font-light tracking-wider drop-shadow">
              Please Wait
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              {source === 'screen'
                ? 'Strict full screen capture mode active. Full screen is captured directly without asking to select windows.'
                : 'Connect your webcam to start camera preview and recording.'}
            </p>

            <div className="flex items-center space-x-3 pt-2">
              {source === 'screen' ? (
                <button
                  onClick={onStartCapture}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-medium shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Capture Full Screen</span>
                </button>
              ) : (
                <button
                  onClick={onRequestWebcam}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#107c41] hover:bg-[#0e6b37] text-white rounded text-xs font-medium shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Preview</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hidden Canvas for Snapshots */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 3-Second Countdown Overlay */}
        {countdownValue !== null && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 animate-pulse">
            <div className="text-8xl font-black text-red-500 drop-shadow-2xl font-mono">
              {countdownValue}
            </div>
            <div className="text-white text-sm mt-3 tracking-widest uppercase">
              Recording starting...
            </div>
          </div>
        )}

        {/* GNOA Vlogo Watermark bottom right corner */}
        <div className="absolute right-4 bottom-2 select-none opacity-40 hover:opacity-75 transition-opacity flex flex-col items-end pointer-events-none">
          <img src="/Vlogo.png" alt="GNOA Logo" className="h-10 object-contain drop-shadow-md" />
        </div>
      </div>

      {/* Expand Bar with ^ Expand ^ (Screenshot 1, 2, 3, 5, 7) */}
      <div
        onClick={onToggleExpand}
        className="h-5 bg-[#333333] hover:bg-[#3d3d3d] border-t border-b border-[#444444] flex items-center justify-center cursor-pointer text-slate-300 hover:text-white transition-colors select-none text-[11px] font-semibold space-x-2 shadow-inner"
        title="Expand or collapse preview panel"
      >
        <span className="text-[9px] text-slate-400">▲</span>
        <span>Expand</span>
        <span className="text-[9px] text-slate-400">▲</span>
      </div>
    </div>
  );
};
