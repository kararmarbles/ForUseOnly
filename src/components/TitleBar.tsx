import React from 'react';
import { OSType } from '../types';
import { Minus, Square, X, Minimize2, Laptop, Apple } from 'lucide-react';

interface TitleBarProps {
  os: OSType;
  onToggleOs: () => void;
  onMinimizeToTray: () => void;
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  os,
  onToggleOs,
  onMinimizeToTray,
  onClose,
  isMaximized,
  onToggleMaximize,
}) => {
  return (
    <div
      className={`h-8 flex items-center justify-between select-none text-xs border-b ${
        os === 'windows'
          ? 'bg-[#181818] border-[#2d2d2d] text-slate-200'
          : 'bg-[#2a2a2a] border-[#1f1f1f] text-slate-200 pl-2'
      }`}
    >
      {/* Left side: Mac traffic lights OR Windows Floppy Icon + Title */}
      {os === 'macos' ? (
        <div className="flex items-center space-x-2">
          {/* macOS window control buttons */}
          <div className="flex items-center space-x-1.5 mr-2">
            <button
              onClick={onClose}
              title="Close"
              className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-110 active:brightness-90 flex items-center justify-center group"
            >
              <X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={onMinimizeToTray}
              title="Minimize to Dock / Background Tray"
              className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-110 active:brightness-90 flex items-center justify-center group"
            >
              <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={onToggleMaximize}
              title="Zoom / Fullscreen"
              className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-110 active:brightness-90 flex items-center justify-center group"
            >
              <Square className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5">
            <img src="/logo.png" alt="Icon" className="w-4 h-4 flex-shrink-0 object-contain drop-shadow-sm" />
            <span className="font-semibold text-slate-100 tracking-wide text-[11.5px]">
              GNOA Recording Suit - Licensed software
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 pl-2">
          <img src="/logo.png" alt="Icon" className="w-4 h-4 flex-shrink-0 object-contain drop-shadow-sm" />
          <span className="font-medium text-slate-200 tracking-wide text-[12px]">
            GNOA Recording Suit - Licensed software
          </span>
        </div>
      )}

      {/* Center/Right quick tools: Laptop/Mac switcher & Background Tray button */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onToggleOs}
          className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10.5px] bg-[#2d2d2d] hover:bg-[#383838] text-slate-300 transition-colors border border-[#404040]"
          title="Switch Operating System view (Laptop Windows / macOS)"
        >
          {os === 'windows' ? (
            <>
              <Laptop className="w-3 h-3 text-sky-400" />
              <span>Laptop (Windows)</span>
            </>
          ) : (
            <>
              <Apple className="w-3 h-3 text-white" />
              <span>Mac OS</span>
            </>
          )}
        </button>

        <button
          onClick={onMinimizeToTray}
          className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10.5px] bg-[#1e3a1e] hover:bg-[#254b25] text-green-300 transition-colors border border-green-700/50"
          title="Minimize to background system tray / lightweight background service"
        >
          <Minimize2 className="w-3 h-3" />
          <span>Background Mode</span>
        </button>

        {/* Windows standard title bar controls on the right */}
        {os === 'windows' && (
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
        )}
      </div>
    </div>
  );
};
