import React from 'react';
import { OSType, RecordingState } from '../types';
import { formatTime } from '../utils/helpers';
import { Maximize2, Radio, Play, Square, Pause, Laptop, Apple, Cpu } from 'lucide-react';

interface BackgroundTrayWidgetProps {
  os: OSType;
  recordingState: RecordingState;
  elapsedMs: number;
  onRestore: () => void;
  onRecord: () => void;
  onPause: () => void;
  onStop: () => void;
  onToggleOs: () => void;
}

export const BackgroundTrayWidget: React.FC<BackgroundTrayWidgetProps> = ({
  os,
  recordingState,
  elapsedMs,
  onRestore,
  onRecord,
  onPause,
  onStop,
  onToggleOs,
}) => {
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] bg-gradient-to-br from-[#0b1329] to-[#030712] flex flex-col justify-between select-none">
      {/* macOS Top Menu Bar if in macOS mode */}
      {os === 'macos' && (
        <div className="h-7 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between text-xs text-white">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-sm"></span>
            <span className="font-semibold">GNOA Recording Suit</span>
            <span className="text-slate-300">File</span>
            <span className="text-slate-300">Capture</span>
            <span className="text-slate-300">Window</span>
            <span className="text-slate-300">Help</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            {/* GNOA Tray Icon */}
            <div
              onClick={onRestore}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer ${
                isRecording ? 'bg-red-600/80 text-white animate-pulse' : 'bg-white/15 text-slate-200 hover:bg-white/25'
              }`}
              title="Click to open GNOA Recording Suit"
            >
              <span className="text-cyan-400 font-bold">💾</span>
              <span>GNOA: {isRecording ? formatTime(elapsedMs) : 'Background'}</span>
            </div>

            <span>Wi-Fi</span>
            <span>🔋 98%</span>
            <span>Fri 1:15 PM</span>
          </div>
        </div>
      )}

      {/* Center Simulated Workspace / Desktop Wallpaper */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/15 p-6 rounded-xl shadow-2xl max-w-md w-full text-slate-100 flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg">
              <span className="text-xl">💾</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-base text-white tracking-wide">
                GNOA Recording Suit
              </div>
              <div className="text-[11px] text-green-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>Running in Background ({os === 'windows' ? 'Laptop Windows' : 'macOS'})</span>
              </div>
            </div>
          </div>

          {/* Performance & Status pill */}
          <div className="w-full bg-[#141414] rounded-lg p-3 border border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-300">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>CPU: 0.3%</span>
              <span className="text-slate-600">•</span>
              <span>RAM: 12.8 MB</span>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase ${
              isRecording ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-300'
            }`}>
              {recordingState}
            </div>
          </div>

          {/* Recording Timer if active */}
          {isRecording && (
            <div className="text-3xl font-black font-mono text-green-400 tracking-wider">
              {formatTime(elapsedMs)}
            </div>
          )}

          {/* Quick Controls in Tray */}
          <div className="flex items-center space-x-3 w-full justify-center pt-1">
            {recordingState === 'idle' ? (
              <button
                onClick={onRecord}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span>Quick Record (F9)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onPause}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={onStop}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop & Save</span>
                </button>
              </>
            )}

            <button
              onClick={onRestore}
              className="flex items-center space-x-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Restore Window</span>
            </button>
          </div>

          {/* Bottom Switcher */}
          <div className="pt-2 border-t border-white/10 w-full flex items-center justify-between text-[11px] text-slate-400">
            <button
              onClick={onToggleOs}
              className="flex items-center space-x-1 hover:text-white"
            >
              {os === 'windows' ? (
                <>
                  <Laptop className="w-3.5 h-3.5 text-sky-400" />
                  <span>Laptop Mode</span>
                </>
              ) : (
                <>
                  <Apple className="w-3.5 h-3.5 text-white" />
                  <span>Mac Mode</span>
                </>
              )}
            </button>
            <span>Hotkeys: F9 (Record), F10 (Pause), F12 (Snap)</span>
          </div>
        </div>
      </div>

      {/* Windows Taskbar if in Windows mode */}
      {os === 'windows' && (
        <div className="h-11 bg-[#1a1f2c]/90 backdrop-blur-md border-t border-white/10 px-4 flex items-center justify-between text-xs text-white">
          <div className="flex items-center space-x-2">
            {/* Windows 11 Start Icon */}
            <div className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 bg-blue-500" />
                <div className="w-2 h-2 bg-blue-500" />
                <div className="w-2 h-2 bg-blue-500" />
                <div className="w-2 h-2 bg-blue-500" />
              </div>
            </div>
            {/* GNOA active taskbar button */}
            <div
              onClick={onRestore}
              className="flex items-center space-x-2 px-3 py-1 bg-white/15 hover:bg-white/25 rounded border-b-2 border-blue-400 cursor-pointer shadow"
            >
              <span className="text-cyan-400">💾</span>
              <span className="text-[11px] font-medium">GNOA Recording Suit</span>
              {isRecording && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
          </div>

          {/* Windows System Tray */}
          <div className="flex items-center space-x-3 text-[11px] text-slate-300">
            <div
              onClick={onRestore}
              className="p-1 hover:bg-white/10 rounded cursor-pointer flex items-center space-x-1"
              title="GNOA Background Service (Running)"
            >
              <span className="text-cyan-400 text-sm">💾</span>
            </div>
            <span>ENG</span>
            <span>🔊 100%</span>
            <span>🔋 95%</span>
            <div className="text-right text-[10px] leading-tight">
              <div>1:15 PM</div>
              <div>10/03/2026</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
