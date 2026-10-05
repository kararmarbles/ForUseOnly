import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab, CaptureSource, ScreenSelectionMode } from '../types';

interface ToolbarsProps {
  activeTab: ActiveTab;
  currentSource: CaptureSource;
  onSelectSource: (source: CaptureSource) => void;
  onSelectScreenMode: (mode: ScreenSelectionMode) => void;
  onToggleWebcamOverlay: () => void;
  webcamOverlayActive: boolean;
  onOpenRecordings: () => void;
  onOpenOptions: (tab?: string) => void;
  onOpenShare: () => void;
}

export const Toolbars: React.FC<ToolbarsProps> = ({
  activeTab,
  currentSource,
  onSelectSource,
  onSelectScreenMode,
  onToggleWebcamOverlay,
  webcamOverlayActive,
  onOpenRecordings,
  onOpenOptions,
  onOpenShare,
}) => {
  const [screenMenuOpen, setScreenMenuOpen] = useState(false);
  const screenMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (screenMenuRef.current && !screenMenuRef.current.contains(e.target as Node)) {
        setScreenMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-[#2b2b2b] border-b border-[#3b3b3b] px-3 py-1 flex items-center select-none shadow-sm min-h-[58px]">
      {/* Home Tab Toolbar */}
      {activeTab === 'home' && (
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Screen Button (Split button with dropdown menu) */}
          <div className="relative" ref={screenMenuRef}>
            <div
              className={`flex rounded border transition-all ${
                currentSource === 'screen'
                  ? 'bg-[#3b3b3b] border-cyan-500/70 text-cyan-300'
                  : 'bg-transparent border-transparent hover:bg-[#353535] hover:border-[#444] text-slate-200'
              }`}
            >
              <button
                onClick={() => {
                  onSelectSource('screen');
                }}
                className="flex flex-col items-center justify-center px-2 py-1 min-w-[50px] group"
                title="Capture Screen"
              >
                {/* Screen Monitor Icon */}
                <div className="w-7 h-6 relative flex items-center justify-center">
                  <svg className="w-6 h-6 text-sky-400 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 2H3C1.9 2 1 2.9 1 4V16C1 17.1 1.9 18 3 18H10V20H8V22H16V20H14V18H21C22.1 18 23 17.1 23 16V4C23 2.9 22.1 2 21 2ZM21 16H3V4H21V16Z" />
                    <rect x="4" y="5" width="16" height="10" fill="#0284c7" opacity="0.6" />
                  </svg>
                </div>
                <span className="text-[10px] font-medium mt-0.5">Screen</span>
              </button>
              <button
                onClick={() => setScreenMenuOpen(!screenMenuOpen)}
                className="px-1 flex items-center justify-center hover:bg-[#444] border-l border-[#404040]"
                title="Screen capture selection options"
              >
                <span className="text-[8px] text-slate-400">▼</span>
              </button>
            </div>

            {/* Screen Dropdown Menu (Screenshot 2) */}
            {screenMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-[#202020] border border-[#555] rounded shadow-2xl py-1 text-slate-200 z-50 text-[12px]">
                <button
                  onClick={() => {
                    onSelectSource('screen');
                    onSelectScreenMode('entire');
                    setScreenMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#2563eb] hover:text-white transition-colors flex items-center space-x-2"
                >
                  <span className="text-slate-400">🖥️</span>
                  <span>Select the entire virtual desktop</span>
                </button>
                <button
                  onClick={() => {
                    onSelectSource('screen');
                    onSelectScreenMode('window');
                    setScreenMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#2563eb] hover:text-white transition-colors flex items-center space-x-2"
                >
                  <span className="text-slate-400">🪟</span>
                  <span>Select the window under the mouse cursor</span>
                </button>
                <button
                  onClick={() => {
                    onSelectSource('screen');
                    onSelectScreenMode('rectangle');
                    setScreenMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#2563eb] hover:text-white transition-colors flex items-center space-x-2"
                >
                  <span className="text-slate-400">📐</span>
                  <span>Draw a selection rectangle using mouse</span>
                </button>

                <div className="my-1 border-t border-[#3a3a3a]" />

                <button
                  onClick={() => {
                    onToggleWebcamOverlay();
                    setScreenMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#2563eb] hover:text-white transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">👤</span>
                    <span>Add webcam overlay</span>
                  </div>
                  {webcamOverlayActive && <span className="text-green-400 font-bold text-xs">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Webcam Button */}
          <button
            onClick={() => onSelectSource('webcam')}
            className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] rounded border transition-all ${
              currentSource === 'webcam'
                ? 'bg-[#3b3b3b] border-cyan-500/70 text-cyan-300'
                : 'border-transparent hover:bg-[#353535] hover:border-[#444] text-slate-200'
            }`}
            title="Capture Webcam"
          >
            <div className="w-7 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="11" r="7" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="12" cy="11" r="3.5" fill="#0284c7" />
                <circle cx="11" cy="10" r="1" fill="#fff" />
                <path d="M7 21h10v-2H7v2z" fill="#64748b" />
                <path d="M11 18h2v2h-2z" fill="#64748b" />
              </svg>
            </div>
            <span className="text-[10px] font-medium mt-0.5">Webcam</span>
          </button>

          {/* Device Button */}
          <button
            onClick={() => onSelectSource('device')}
            className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] rounded border transition-all ${
              currentSource === 'device'
                ? 'bg-[#3b3b3b] border-cyan-500/70 text-cyan-300'
                : 'border-transparent hover:bg-[#353535] hover:border-[#444] text-slate-200'
            }`}
            title="Capture Device (HDMI / USB capture)"
          >
            <div className="w-7 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 3v6c0 2.2 1.8 4 4 4v5H8v2h8v-2h-2v-5c2.2 0 4-1.8 4-4V3H6zm2 2h2v4H8V5zm4 0h2v4h-2V5zm4 0h2v4h-2V5z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium mt-0.5">Device</span>
          </button>

          {/* Network Button */}
          <button
            onClick={() => onSelectSource('network')}
            className={`flex flex-col items-center justify-center px-2 py-1 min-w-[50px] rounded border transition-all ${
              currentSource === 'network'
                ? 'bg-[#3b3b3b] border-cyan-500/70 text-cyan-300'
                : 'border-transparent hover:bg-[#353535] hover:border-[#444] text-slate-200'
            }`}
            title="Network IP Camera"
          >
            <div className="w-7 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 4h-15C3.1 4 2 5.1 2 6.5v8C2 15.9 3.1 17 4.5 17h6v3H8v2h8v-2h-2.5v-3h6c1.4 0 2.5-1.1 2.5-2.5v-8C22 5.1 20.9 4 19.5 4zm-7.5 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
                <circle cx="12" cy="10" r="2" fill="#ef4444" />
              </svg>
            </div>
            <span className="text-[10px] font-medium mt-0.5">Network</span>
          </button>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-[#444] mx-1" />

          {/* Recordings Button */}
          <button
            onClick={onOpenRecordings}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[54px] rounded border border-transparent hover:bg-[#353535] hover:border-[#444] text-slate-200 group"
            title="Open Recordings Library"
          >
            <div className="w-7 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 8v3h-4v-3H7l5-5 5 5h-3z" fill="#ca8a04" />
                <circle cx="12" cy="14" r="3" fill="#1e293b" />
              </svg>
            </div>
            <span className="text-[10px] font-medium mt-0.5">Recordings</span>
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShare}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[50px] rounded border border-transparent hover:bg-[#353535] hover:border-[#444] text-slate-200 group"
            title="Share Recording"
          >
            <div className="w-7 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium mt-0.5">Share</span>
          </button>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-[#444] mx-1" />

          {/* Options Button */}
          <button
            onClick={() => onOpenOptions()}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[50px] rounded border border-transparent hover:bg-[#353535] hover:border-[#444] text-slate-200 group"
            title="Configure GNOA Options"
          >
            <div className="w-7 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium mt-0.5">Options</span>
          </button>

          {/* Suite Button */}
          <button
            onClick={() => onOpenOptions('suite')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[54px] rounded border border-transparent hover:bg-[#353535] hover:border-[#444] text-slate-200 group"
            title="GNOA Suite Tools"
          >
            <div className="w-7 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium mt-0.5">GNOA Suite</span>
          </button>
        </div>
      )}

      {/* Options Tab Toolbar (Screenshot 3) */}
      {activeTab === 'options' && (
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          <button
            onClick={() => onOpenOptions('video')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[50px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">🛠️</span>
            <span className="text-[10px] font-medium">Options</span>
          </button>

          <button
            onClick={() => onOpenOptions('video')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">🎬</span>
            <span className="text-[10px] font-medium">Video Options</span>
          </button>

          <button
            onClick={() => onOpenOptions('audio')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[50px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">🎙️</span>
            <span className="text-[10px] font-medium">Audio</span>
          </button>

          <button
            onClick={() => onOpenOptions('hotkeys')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[65px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">⌨️</span>
            <span className="text-[10px] font-medium">Hot-Keys</span>
          </button>

          <button
            onClick={() => onOpenOptions('cursor')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[50px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">🖱️</span>
            <span className="text-[10px] font-medium">Mouse</span>
          </button>

          <button
            onClick={() => onOpenOptions('snapshots')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[65px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">📸</span>
            <span className="text-[10px] font-medium">Snapshot</span>
          </button>

          <button
            onClick={() => onOpenOptions('record')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[55px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">📅</span>
            <span className="text-[10px] font-medium">Schedule</span>
          </button>

          <button
            onClick={() => onOpenOptions('other')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">⚙️</span>
            <span className="text-[10px] font-medium">Other</span>
          </button>

          <button
            onClick={() => onOpenOptions('advanced')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">📡</span>
            <span className="text-[10px] font-medium">Motion Detect</span>
          </button>

          <button
            onClick={() => onOpenOptions('suite')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">💼</span>
            <span className="text-[10px] font-medium">GNOA Suite</span>
          </button>
        </div>
      )}

      {/* Effects Tab Toolbar */}
      {activeTab === 'effects' && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenOptions('effects')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">🔤</span>
            <span className="text-[10px] font-medium">Text Caption</span>
          </button>

          <button
            onClick={() => onOpenOptions('effects')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">💧</span>
            <span className="text-[10px] font-medium">Watermark</span>
          </button>

          <button
            onClick={() => onOpenOptions('video')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">🎨</span>
            <span className="text-[10px] font-medium">Color Adjust</span>
          </button>

          <button
            onClick={() => onOpenOptions('cursor')}
            className="flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded hover:bg-[#353535] text-slate-200"
          >
            <span className="text-xl">🎯</span>
            <span className="text-[10px] font-medium">Cursor Ring</span>
          </button>

          <button
            onClick={onToggleWebcamOverlay}
            className={`flex flex-col items-center justify-center px-2 py-1 min-w-[60px] rounded border ${
              webcamOverlayActive
                ? 'bg-[#3b3b3b] border-green-500 text-green-300'
                : 'border-transparent hover:bg-[#353535] text-slate-200'
            }`}
          >
            <span className="text-xl">🎦</span>
            <span className="text-[10px] font-medium">Webcam Overlay</span>
          </button>
        </div>
      )}

      {/* Help Tab Toolbar */}
      {activeTab === 'help' && (
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <div className="bg-[#242424] px-3 py-1.5 rounded border border-[#383838]">
            <span className="font-semibold text-white">GNOA Recording Suit Professional</span>
            <p className="text-[10px] text-slate-400">High-performance lightweight recording for Laptop & macOS background capture</p>
          </div>
          <div className="text-[11px] text-slate-400">
            F9: Record/Stop &nbsp;|&nbsp; F10: Pause &nbsp;|&nbsp; F12: Snapshot
          </div>
        </div>
      )}

      {/* Suite Tab Toolbar */}
      {activeTab === 'suite' && (
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-emerald-400">GNOA Audio/Video Suite:</span>
            <span className="bg-[#222] px-2 py-0.5 rounded text-[11px]">System Audio Driver (Installed)</span>
            <span className="bg-[#222] px-2 py-0.5 rounded text-[11px]">Microphone Noise Filter (Ready)</span>
            <span className="bg-[#222] px-2 py-0.5 rounded text-[11px]">Hardware Encoder (Active)</span>
          </div>
        </div>
      )}
    </div>
  );
};
