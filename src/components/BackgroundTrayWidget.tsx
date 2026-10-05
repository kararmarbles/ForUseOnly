/**
 * BackgroundTrayWidget – Windows-only background mode overlay.
 * Shows when the app is minimized to tray during recording.
 * Removed Mac OS toggle, Mac menu bar, and Apple/Laptop switcher.
 */
import React from 'react';
import { RecordingState } from '../types';
import { formatTime } from '../utils/helpers';
import { Maximize2, Square, Pause, Cpu } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface BackgroundTrayWidgetProps {
  recordingState: RecordingState;
  elapsedMs: number;
  onRestore: () => void;
  onRecord: () => void;
  onPause: () => void;
  onStop: () => void;
}

export const BackgroundTrayWidget: React.FC<BackgroundTrayWidgetProps> = ({
  recordingState,
  elapsedMs,
  onRestore,
  onRecord,
  onPause,
  onStop,
}) => {
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] bg-gradient-to-br from-[#0b1329] to-[#030712] flex flex-col justify-between select-none">
      {/* Center: Background mode card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/15 p-6 rounded-xl shadow-2xl max-w-md w-full text-slate-100 flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg">
              <img src={logoImg} alt="GNOA" className="w-6 h-6 object-contain" />
            </div>
            <div className="text-left">
              <div className="font-bold text-base text-white tracking-wide">
                GNOA Recording Suit
              </div>
              <div className="text-[11px] text-green-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>Running in Background (Laptop Windows)</span>
              </div>
            </div>
          </div>

          {/* Performance & Status pill */}
          <div className="w-full bg-[#141414] rounded-lg p-3 border border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-300">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Lightweight Background Mode</span>
            </div>
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[10px] font-sans font-semibold uppercase ${
              isRecording
                ? 'bg-red-950/90 text-red-300 border border-red-700 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
                : isPaused
                ? 'bg-amber-950/90 text-amber-300 border border-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {isRecording && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                </span>
              )}
              {isPaused && (
                <span className="flex space-x-0.5 items-center mr-0.5">
                  <span className="w-0.5 h-2 bg-amber-400 rounded-xs" />
                  <span className="w-0.5 h-2 bg-amber-400 rounded-xs" />
                </span>
              )}
              <span>{recordingState}</span>
            </div>
          </div>

          {/* Recording Timer if active */}
          {isRecording && (
            <div className="text-3xl font-black font-mono text-green-400 tracking-wider">
              {formatTime(elapsedMs)}
            </div>
          )}

          {/* Quick Controls */}
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
                  <span>Stop &amp; Save</span>
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

          <div className="pt-2 border-t border-white/10 w-full text-center text-[11px] text-slate-400">
            <span>Hotkeys: F9 (Record/Stop) · F10 (Pause) · F12 (Snapshot)</span>
          </div>
        </div>
      </div>

      {/* Windows Taskbar */}
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
          <div className="text-right text-[10px] leading-tight">
            <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
