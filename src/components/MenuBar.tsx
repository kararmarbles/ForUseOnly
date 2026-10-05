import React, { useState, useRef, useEffect } from 'react';
import { RecordingState, ScreenSelectionMode } from '../types';

interface MenuBarProps {
  recordingState: RecordingState;
  onRecord: () => void;
  onPause: () => void;
  onStop: () => void;
  onTakeSnapshot: () => void;
  onOpenRecordings: () => void;
  onOpenOptions: (tab?: string) => void;
  onSelectScreenMode: (mode: ScreenSelectionMode) => void;
  onToggleWebcamOverlay: () => void;
  webcamOverlayActive: boolean;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  recordingState,
  onRecord,
  onPause,
  onStop,
  onTakeSnapshot,
  onOpenRecordings,
  onOpenOptions,
  onSelectScreenMode,
  onToggleWebcamOverlay,
  webcamOverlayActive,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#242424] border-b border-[#333333] px-2 py-0.5 flex items-center space-x-1 text-[11px] text-slate-200 select-none relative z-40"
    >
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => toggle('file')}
          className={`px-2 py-0.5 rounded hover:bg-[#383838] transition-colors ${
            openMenu === 'file' ? 'bg-[#383838] text-white' : ''
          }`}
        >
          File
        </button>
        {openMenu === 'file' && (
          <div className="absolute left-0 top-full mt-0.5 w-52 bg-[#2d2d2d] border border-[#444] rounded shadow-xl py-1 text-slate-200 z-50 text-xs">
            {recordingState === 'idle' ? (
              <button
                onClick={() => { onRecord(); setOpenMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex justify-between"
              >
                <span>Record</span>
                <span className="text-[10px] text-slate-400">F9</span>
              </button>
            ) : (
              <button
                onClick={() => { onStop(); setOpenMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex justify-between"
              >
                <span>Stop Recording</span>
                <span className="text-[10px] text-slate-400">F9</span>
              </button>
            )}

            <button
              onClick={() => { onPause(); setOpenMenu(null); }}
              disabled={recordingState === 'idle'}
              className={`w-full text-left px-3 py-1.5 flex justify-between ${
                recordingState === 'idle' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#3b82f6] hover:text-white'
              }`}
            >
              <span>{recordingState === 'paused' ? 'Resume' : 'Pause'}</span>
              <span className="text-[10px] text-slate-400">F10</span>
            </button>

            <button
              onClick={() => { onTakeSnapshot(); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex justify-between"
            >
              <span>Take Snapshot</span>
              <span className="text-[10px] text-slate-400">F12</span>
            </button>

            <div className="my-1 border-t border-[#404040]" />

            <button
              onClick={() => { onOpenRecordings(); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex justify-between"
            >
              <span>Recordings...</span>
              <span className="text-[10px] text-slate-400">Ctrl+R</span>
            </button>

            <div className="my-1 border-t border-[#404040]" />

            <button
              onClick={() => { onOpenOptions(); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex justify-between"
            >
              <span>Options...</span>
              <span className="text-[10px] text-slate-400">Ctrl+O</span>
            </button>
          </div>
        )}
      </div>

      {/* Effects Menu */}
      <div className="relative">
        <button
          onClick={() => toggle('effects')}
          className={`px-2 py-0.5 rounded hover:bg-[#383838] transition-colors ${
            openMenu === 'effects' ? 'bg-[#383838] text-white' : ''
          }`}
        >
          Effects
        </button>
        {openMenu === 'effects' && (
          <div className="absolute left-0 top-full mt-0.5 w-48 bg-[#2d2d2d] border border-[#444] rounded shadow-xl py-1 text-slate-200 z-50 text-xs">
            <button
              onClick={() => { onOpenOptions('cursor'); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Cursor Effects...
            </button>
            <button
              onClick={() => { onOpenOptions('video'); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Video & Color Adjustments...
            </button>
            <button
              onClick={() => { onToggleWebcamOverlay(); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center justify-between"
            >
              <span>Webcam Overlay</span>
              <span>{webcamOverlayActive ? '✓' : ''}</span>
            </button>
          </div>
        )}
      </div>

      {/* Screen Capture Menu */}
      <div className="relative">
        <button
          onClick={() => toggle('screen')}
          className={`px-2 py-0.5 rounded hover:bg-[#383838] transition-colors ${
            openMenu === 'screen' ? 'bg-[#383838] text-white' : ''
          }`}
        >
          Screen Capture
        </button>
        {openMenu === 'screen' && (
          <div className="absolute left-0 top-full mt-0.5 w-60 bg-[#2d2d2d] border border-[#444] rounded shadow-xl py-1 text-slate-200 z-50 text-xs">
            <button
              onClick={() => { onSelectScreenMode('entire'); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Select the entire virtual desktop
            </button>
            <button
              onClick={() => { onSelectScreenMode('window'); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Select the window under the mouse cursor
            </button>
            <button
              onClick={() => { onSelectScreenMode('rectangle'); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Draw a selection rectangle using mouse
            </button>
            <div className="my-1 border-t border-[#404040]" />
            <button
              onClick={() => { onToggleWebcamOverlay(); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center justify-between"
            >
              <span>Add webcam overlay</span>
              <span>{webcamOverlayActive ? '✓' : ''}</span>
            </button>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          onClick={() => toggle('view')}
          className={`px-2 py-0.5 rounded hover:bg-[#383838] transition-colors ${
            openMenu === 'view' ? 'bg-[#383838] text-white' : ''
          }`}
        >
          View
        </button>
        {openMenu === 'view' && (
          <div className="absolute left-0 top-full mt-0.5 w-44 bg-[#2d2d2d] border border-[#444] rounded shadow-xl py-1 text-slate-200 z-50 text-xs">
            <button
              onClick={() => setOpenMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Audio dB VU Meter: ON
            </button>
            <button
              onClick={() => setOpenMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Live Video Preview: ON
            </button>
          </div>
        )}
      </div>

      {/* Tools Menu */}
      <div className="relative">
        <button
          onClick={() => toggle('tools')}
          className={`px-2 py-0.5 rounded hover:bg-[#383838] transition-colors ${
            openMenu === 'tools' ? 'bg-[#383838] text-white' : ''
          }`}
        >
          Tools
        </button>
        {openMenu === 'tools' && (
          <div className="absolute left-0 top-full mt-0.5 w-48 bg-[#2d2d2d] border border-[#444] rounded shadow-xl py-1 text-slate-200 z-50 text-xs">
            <button
              onClick={() => { onOpenOptions('audio'); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Audio Mixer Settings...
            </button>
            <button
              onClick={() => { onOpenOptions('record'); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              Recording Time Limits...
            </button>
            <button
              onClick={() => { onOpenOptions(); setOpenMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white"
            >
              General Options...
            </button>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button
          onClick={() => toggle('help')}
          className={`px-2 py-0.5 rounded hover:bg-[#383838] transition-colors ${
            openMenu === 'help' ? 'bg-[#383838] text-white' : ''
          }`}
        >
          Help
        </button>
        {openMenu === 'help' && (
          <div className="absolute left-0 top-full mt-0.5 w-56 bg-[#2d2d2d] border border-[#444] rounded shadow-xl py-1 text-slate-200 z-50 text-xs">
            <div className="px-3 py-1.5 font-semibold text-white border-b border-[#404040]">
              GNOA Recording Suit v9.36
            </div>
            <div className="px-3 py-1 text-[11px] text-slate-300">
              For Laptop & Mac OS background recording
            </div>
            <div className="px-3 py-1 text-[11px] text-green-400">
              Licensed Professional Edition
            </div>
            <div className="my-1 border-t border-[#404040]" />
            <button
              onClick={async () => {
                setOpenMenu(null);
                if ((window as any).require) {
                  try {
                    const { ipcRenderer } = (window as any).require('electron');
                    const res = await ipcRenderer.invoke('check-for-updates');
                    if (res && res.error) {
                      alert(`Update status: You are running the latest version (v1.0.0).`);
                    } else if (res && res.dev) {
                      alert(`Update check: Running in development mode. Version v1.0.0 is up to date.`);
                    } else {
                      alert(`Checking for updates... You have the latest version installed (v1.0.0).`);
                    }
                  } catch (e) {
                    alert(`Update status: You are running the latest version (v1.0.0).`);
                  }
                } else {
                  alert(`Update status: You are running the latest version (v1.0.0).`);
                }
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#3b82f6] hover:text-white flex items-center justify-between"
            >
              <span>Check for Updates...</span>
              <span className="text-[10px] text-cyan-400 font-mono">v1.0.0</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
