/**
 * TitleBar – Windows-only build.
 * No Mac OS toggle button. Clean and lightweight.
 */
import React from 'react';
import { Minus, Square, X, Minimize2 } from 'lucide-react';
import { RecordingState } from '../types';
import { formatTime } from '../utils/helpers';
import logoImg from '../assets/logo.png';

interface TitleBarProps {
  onMinimizeToTray: () => void;
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  recordingState?: RecordingState;
  elapsedMs?: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onMinimizeToTray,
  onClose,
  isMaximized,
  onToggleMaximize,
  recordingState,
  elapsedMs = 0,
}) => {
  return (
    <div className="h-8 flex items-center justify-between select-none text-xs border-b bg-[#181818] border-[#2d2d2d] text-slate-200">
      {/* Left: Icon + Title + Status */}
      <div className="flex items-center space-x-2 pl-2">
        <img
          src={logoImg}
          alt="GNOA Icon"
          className="w-4 h-4 flex-shrink-0 object-contain drop-shadow-sm"
        />
        <span className="font-medium text-slate-200 tracking-wide text-[12px]">
          GNOA Recording Suit – Licensed software
        </span>

        {/* Live Recording Blinking Red Dot */}
        {recordingState === 'recording' && (
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-red-950/90 border border-red-500/70 text-red-300 text-[10.5px] font-bold shadow-[0_0_8px_rgba(239,68,68,0.4)] ml-2 animate-pulse">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_6px_#ef4444]" />
            </span>
            <span className="tracking-wide">REC</span>
            <span className="font-mono text-white text-[10.5px] ml-0.5 font-normal">
              {formatTime(elapsedMs)}
            </span>
          </div>
        )}

        {/* Live Paused Indicator */}
        {recordingState === 'paused' && (
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/70 text-amber-300 text-[10.5px] font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)] ml-2">
            <span className="flex space-x-0.5 items-center">
              <span className="w-1 h-2.5 bg-amber-400 rounded-xs" />
              <span className="w-1 h-2.5 bg-amber-400 rounded-xs" />
            </span>
            <span className="tracking-wide">PAUSED</span>
            <span className="font-mono text-amber-100 text-[10.5px] ml-0.5 font-normal">
              {formatTime(elapsedMs)}
            </span>
          </div>
        )}
      </div>

      {/* Right: Background Mode + Window Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onMinimizeToTray}
          className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10.5px] bg-[#1e3a1e] hover:bg-[#254b25] text-green-300 transition-colors border border-green-700/50"
          title="Minimize to background system tray"
        >
          <Minimize2 className="w-3 h-3" />
          <span>Background Mode</span>
        </button>

        {/* Windows standard title bar controls */}
        <div className="flex items-center h-8 ml-2">
          <button
            onClick={onMinimizeToTray}
            title="Minimize to Tray"
            className="w-10 h-8 flex items-center justify-center hover:bg-[#2d2d2d] text-slate-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleMaximize}
            title={isMaximized ? 'Restore' : 'Maximize'}
            className="w-10 h-8 flex items-center justify-center hover:bg-[#2d2d2d] text-slate-300 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="w-10 h-8 flex items-center justify-center hover:bg-[#e81123] hover:text-white text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
