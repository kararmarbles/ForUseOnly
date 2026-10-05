/**
 * TitleBar – Windows-only build.
 * No Mac OS toggle button. Clean and lightweight.
 */
import React from 'react';
import { Minus, Square, X, Minimize2 } from 'lucide-react';

interface TitleBarProps {
  onMinimizeToTray: () => void;
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onMinimizeToTray,
  onClose,
  isMaximized,
  onToggleMaximize,
}) => {
  return (
    <div className="h-8 flex items-center justify-between select-none text-xs border-b bg-[#181818] border-[#2d2d2d] text-slate-200">
      {/* Left: Icon + Title */}
      <div className="flex items-center space-x-2 pl-2">
        <img
          src="/logo.png"
          alt="GNOA Icon"
          className="w-4 h-4 flex-shrink-0 object-contain drop-shadow-sm"
        />
        <span className="font-medium text-slate-200 tracking-wide text-[12px]">
          GNOA Recording Suit – Licensed software
        </span>
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
