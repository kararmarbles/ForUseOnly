import React from 'react';
import { RecordingState, AppSettings } from '../types';
import { Camera, Volume2 } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface BottomControlDockProps {
  recordingState: RecordingState;
  elapsedMs: number;
  dbLevel: number;
  settings: AppSettings;
  onRecord: () => void;
  onPause: () => void;
  onStop: () => void;
  onTakeSnapshot: () => void;
  showSuccessBanner: boolean;
  onCloseSuccessBanner: () => void;
  onPlayLastRecording: () => void;
  onOpenRecordingsFolder: () => void;
  audioActive: boolean;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  recordingState,
  elapsedMs,
  dbLevel,
  settings,
  onRecord,
  onPause,
  onStop,
  onTakeSnapshot,
  showSuccessBanner,
  onCloseSuccessBanner,
  onPlayLastRecording,
  onOpenRecordingsFolder,
  audioActive,
}) => {
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isIdle = recordingState === 'idle';

  // Calculate VU meter percentage from dbLevel (-42 dB to +12 dB = 54 dB total range)
  const clampedDb = Math.max(-42, Math.min(12, dbLevel));
  const vuPercent = Math.min(100, Math.max(0, ((clampedDb + 42) / 54) * 100));

  return (
    <div className="flex flex-col bg-[#383838] border-t border-[#484848] select-none shadow-md">
      {/* Green Success Banner (Screenshots 1 & 2) */}
      {showSuccessBanner && (
        <div className="bg-[#4caf50] text-white px-4 py-1.5 flex items-center justify-between text-xs font-semibold shadow-inner transition-all animate-fadeIn">
          <div className="flex items-center space-x-4">
            <span className="text-white drop-shadow">Recording successful.</span>
            <button
              onClick={onPlayLastRecording}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-black text-xs font-semibold rounded shadow border border-red-700 active:scale-95 transition-transform"
            >
              Play Recording
            </button>
            <button
              onClick={onOpenRecordingsFolder}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-black text-xs font-semibold rounded shadow border border-emerald-700 active:scale-95 transition-transform"
            >
              Open Recordings Folder
            </button>
          </div>
          <button
            onClick={onCloseSuccessBanner}
            className="text-white hover:text-black/80 font-bold text-sm px-1.5 py-0.5 rounded hover:bg-white/20"
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Control Strip */}
      <div className="h-16 px-4 flex items-center justify-between bg-[#383838]">
        {/* Left Section: Transport buttons and VU meter dock */}
        <div className="flex items-center space-x-1.5">
          {/* Record Button */}
          <button
            onClick={onRecord}
            disabled={recordingState === 'countdown'}
            className={`w-12 h-12 rounded-sm border flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-gradient-to-b from-[#2d2d2d] to-[#1f1f1f] border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                : 'bg-gradient-to-b from-[#484848] to-[#2a2a2a] border-[#555] hover:from-[#555] hover:to-[#333] active:from-[#222] active:to-[#333]'
            }`}
            title={isRecording ? 'Recording active' : 'Start Recording (F9)'}
          >
            <div
              className={`w-6 h-6 rounded-full transition-transform ${
                isRecording
                  ? 'bg-red-600 animate-pulse scale-90'
                  : 'bg-gradient-to-br from-red-500 to-red-700 shadow-md group-hover:scale-105'
              }`}
            />
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            disabled={isIdle}
            className={`w-12 h-12 rounded-sm border flex items-center justify-center transition-all ${
              isIdle
                ? 'bg-[#333] border-[#444] opacity-40 cursor-not-allowed text-slate-500'
                : isPaused
                ? 'bg-amber-900/60 border-amber-500 text-amber-300'
                : 'bg-gradient-to-b from-[#484848] to-[#2a2a2a] border-[#555] hover:from-[#555] hover:to-[#333] text-slate-200'
            }`}
            title={isPaused ? 'Resume (F10)' : 'Pause (F10)'}
          >
            <div className="flex space-x-1">
              <div className="w-1.5 h-5 bg-current rounded-xs" />
              <div className="w-1.5 h-5 bg-current rounded-xs" />
            </div>
          </button>

          {/* Stop Button */}
          <button
            onClick={onStop}
            disabled={isIdle}
            className={`w-12 h-12 rounded-sm border flex items-center justify-center transition-all ${
              isIdle
                ? 'bg-[#333] border-[#444] opacity-40 cursor-not-allowed text-slate-500'
                : 'bg-gradient-to-b from-[#484848] to-[#2a2a2a] border-[#555] hover:from-[#555] hover:to-[#333] active:from-[#222] active:to-[#333] text-slate-300 hover:text-white'
            }`}
            title="Stop Recording (F9)"
          >
            <div className="w-5 h-5 bg-slate-300 rounded-xs" />
          </button>

          {/* Audio VU Meter & Timer Section (Authentic NCH Debut style) */}
          <div className="flex items-center bg-[#242424] border border-[#1b1b1b] rounded-sm px-2.5 py-1 ml-2 min-w-[280px] h-12">
            {/* Speaker Icon */}
            <div className="mr-2 text-slate-300">
              <Volume2 className={`w-5 h-5 ${audioActive ? 'text-green-400' : 'text-slate-400'}`} />
            </div>

            {/* Meter and Timer stack */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Top row: Timer & FPS */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-200 leading-none mb-1">
                <span className={`tracking-wider ${isRecording ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
                  {formatTime(elapsedMs)}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  {settings.frameRate} fps
                </span>
              </div>

              {/* VU Meter Bar */}
              <div className="w-full h-2 bg-[#151515] rounded-xs overflow-hidden relative border border-[#333]">
                {/* Active Level Fill */}
                <div
                  className="h-full transition-all duration-75 ease-out"
                  style={{
                    width: audioActive || isRecording ? `${vuPercent}%` : '0%',
                    background: 'linear-gradient(to right, #22c55e 60%, #eab308 85%, #ef4444 100%)',
                  }}
                />
              </div>

              {/* dB Scale Markings (Authentic: -42, -36, -30, -24, -18, -12, -6, 0, 6, 12) */}
              <div className="flex justify-between text-[7.5px] text-slate-400 mt-0.5 font-mono select-none px-0.5">
                <span>-42</span>
                <span>-36</span>
                <span>-30</span>
                <span>-24</span>
                <span>-18</span>
                <span>-12</span>
                <span>-6</span>
                <span className="text-slate-200 font-bold">0</span>
                <span className="text-yellow-400">6</span>
                <span className="text-red-400">12</span>
              </div>
            </div>
          </div>

          {/* Snapshot Button */}
          <button
            onClick={onTakeSnapshot}
            className="w-12 h-12 rounded-sm border border-[#555] bg-gradient-to-b from-[#484848] to-[#2a2a2a] hover:from-[#555] hover:to-[#333] active:from-[#222] active:to-[#333] flex flex-col items-center justify-center text-slate-200 transition-colors ml-1"
            title="Take Snapshot (F12)"
          >
            <Camera className="w-5 h-5 text-sky-400" />
            <span className="text-[8px] font-semibold text-slate-300">SNAP</span>
          </button>
        </div>

        {/* Right Section: Brand Logo / Status */}
        <div className="flex items-center space-x-3 text-right">
          <div className="flex flex-col items-end opacity-40 hover:opacity-80 transition-opacity">
            <span className="text-xl font-black tracking-tighter text-slate-400 font-sans leading-none">
              GNOA
            </span>
            <span className="text-[8px] uppercase tracking-widest text-slate-400 font-medium">
              Software
            </span>
          </div>
        </div>
      </div>

      {/* Very Bottom Status Bar */}
      <div className="h-5 bg-[#202020] border-t border-[#2e2e2e] px-2 flex items-center justify-between text-[10px] text-slate-400 select-none">
        <div>GNOA Recording Suit v 9.36 © GNOA Software</div>
        <div className="flex items-center space-x-3">
          <span className="text-slate-400">
            Audio: {settings.recordMicrophone ? 'Mic (ON)' : 'Mic (OFF)'} | {settings.recordSpeakers ? 'System Sound (ON)' : 'System Sound (OFF)'}
          </span>
          <span className="text-slate-400">
            Limit: {settings.limitMaxRecordingTime ? `${Math.floor(settings.maxRecordingTimeSeconds / 60)} min` : 'Unlimited'}
          </span>
          <span className="text-emerald-400 font-medium">
            ● Ready
          </span>
        </div>
      </div>
    </div>
  );
};
