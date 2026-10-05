import React, { useState, useRef, useEffect } from 'react';
import { RecordingItem, SnapshotItem } from '../types';
import { formatDurationSimple } from '../utils/helpers';
import { Play, Download, Trash2, Folder, Film, Image as ImageIcon, X, Pause, FolderOpen } from 'lucide-react';

interface RecordingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordings: RecordingItem[];
  snapshots: SnapshotItem[];
  destinationFolder: string;
  onDeleteRecording: (id: string) => void;
  onDeleteSnapshot: (id: string) => void;
  initialPlayItem?: RecordingItem | null;
}

export const RecordingsModal: React.FC<RecordingsModalProps> = ({
  isOpen,
  onClose,
  recordings,
  snapshots,
  destinationFolder,
  onDeleteRecording,
  onDeleteSnapshot,
  initialPlayItem = null,
}) => {
  const [activeTab, setActiveTab] = useState<'recordings' | 'snapshots'>('recordings');
  const [activePlayingItem, setActivePlayingItem] = useState<RecordingItem | null>(initialPlayItem);
  const [viewingSnapshot, setViewingSnapshot] = useState<SnapshotItem | null>(null);

  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setActivePlayingItem(initialPlayItem);
    setCurrentPlaybackTime(0);
    setIsPlaying(true);
  }, [initialPlayItem]);

  // Fix Chromium / MediaRecorder duration bug on load
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      if (videoRef.current.duration === Infinity || isNaN(videoRef.current.duration)) {
        videoRef.current.currentTime = 1e101;
        videoRef.current.ontimeupdate = () => {
          if (videoRef.current) {
            videoRef.current.ontimeupdate = null;
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        };
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentPlaybackTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentPlaybackTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleShowFileInFolder = (filePath?: string) => {
    if ((window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        if (filePath) {
          ipcRenderer.invoke('show-item-in-folder', filePath);
        } else {
          ipcRenderer.invoke('open-directory', destinationFolder);
        }
      } catch (e) {
        alert(`File saved in: ${destinationFolder}`);
      }
    } else {
      alert(`File saved in: ${destinationFolder}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs select-none p-4">
      <div className="w-full max-w-3xl bg-[#2d2d2d] text-slate-100 rounded border border-[#555] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-xs">
        {/* Title bar */}
        <div className="h-8 bg-[#222] border-b border-[#3e3e3e] flex items-center justify-between px-3">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-white">GNOA Recordings Library</span>
            <span className="text-slate-400 font-mono text-[11px] truncate max-w-xs">
              [{destinationFolder}]
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-[#333]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player overlay if playing an item */}
        {activePlayingItem && (
          <div className="bg-black p-3 flex flex-col items-center border-b border-[#444]">
            <div className="w-full flex justify-between items-center text-xs text-slate-300 pb-2">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>Now Playing: {activePlayingItem.title}.{activePlayingItem.savedFilePath ? activePlayingItem.savedFilePath.split('.').pop() : 'mp4'}</span>
                <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-mono uppercase">
                  {activePlayingItem.savedFilePath ? activePlayingItem.savedFilePath.split('.').pop() : 'MP4'}
                </span>
              </span>
              <button
                onClick={() => setActivePlayingItem(null)}
                className="text-xs bg-[#333] hover:bg-[#444] px-2 py-0.5 rounded text-slate-300"
              >
                Close Player ✕
              </button>
            </div>
            
            <div className="w-full flex flex-col items-center">
              <video
                ref={videoRef}
                src={activePlayingItem.url}
                autoPlay
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="max-h-72 rounded-t border border-[#333] w-auto max-w-full bg-black"
              />

              {/* Custom Scrubbing & Time Control Bar */}
              <div className="w-full bg-[#1b1b1b] px-3 py-2 flex items-center space-x-3 rounded-b border border-t-0 border-[#333]">
                <button
                  onClick={togglePlayPause}
                  className="px-2.5 py-1 bg-[#333] hover:bg-[#444] rounded text-white font-semibold flex items-center space-x-1 text-xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <span className="font-mono text-cyan-400 text-xs min-w-[45px] text-right">
                  {formatDurationSimple(Math.floor(currentPlaybackTime))}
                </span>

                <input
                  type="range"
                  min={0}
                  max={activePlayingItem.durationSeconds || (videoRef.current && isFinite(videoRef.current.duration) ? videoRef.current.duration : 10)}
                  step={0.1}
                  value={currentPlaybackTime}
                  onChange={handleSeek}
                  className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-[#333] rounded"
                />

                <span className="font-mono text-slate-300 text-xs min-w-[45px]">
                  {formatDurationSimple(activePlayingItem.durationSeconds)}
                </span>

                {activePlayingItem.savedFilePath && (
                  <button
                    onClick={() => handleShowFileInFolder(activePlayingItem.savedFilePath)}
                    className="text-xs bg-[#2a2a2a] hover:bg-[#383838] text-slate-300 px-2 py-1 rounded border border-[#444] flex items-center space-x-1"
                    title="Reveal in Windows Explorer"
                  >
                    <FolderOpen className="w-3 h-3 text-amber-400" />
                    <span>Location</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Snapshot viewer overlay */}
        {viewingSnapshot && (
          <div className="bg-black p-3 flex flex-col items-center border-b border-[#444]">
            <div className="w-full flex justify-between items-center text-xs text-slate-300 pb-2">
              <span className="font-semibold text-white flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Snapshot: {viewingSnapshot.title}</span>
              </span>
              <button
                onClick={() => setViewingSnapshot(null)}
                className="text-xs bg-[#333] hover:bg-[#444] px-2 py-0.5 rounded text-slate-300"
              >
                Close ✕
              </button>
            </div>
            <img
              src={viewingSnapshot.dataUrl}
              alt="Snapshot"
              className="max-h-72 rounded border border-[#333] object-contain"
            />
          </div>
        )}

        {/* Tabs: Recordings vs Snapshots */}
        <div className="bg-[#242424] px-3 pt-2 border-b border-[#3a3a3a] flex space-x-2">
          <button
            onClick={() => setActiveTab('recordings')}
            className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeTab === 'recordings'
                ? 'bg-[#2d2d2d] text-white border-t-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-blue-400" />
            <span>Video Recordings ({recordings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeTab === 'snapshots'
                ? 'bg-[#2d2d2d] text-white border-t-2 border-green-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-green-400" />
            <span>Snapshots ({snapshots.length})</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 min-h-[220px]">
          {activeTab === 'recordings' ? (
            recordings.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Film className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-300">No recordings yet</p>
                <p className="text-[11px] mt-1">Press the red Record button or F9 to record your screen and audio.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recordings.map((rec) => {
                  const ext = rec.savedFilePath ? rec.savedFilePath.split('.').pop() : 'mp4';
                  return (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-2.5 rounded bg-[#242424] hover:bg-[#282828] border border-[#3e3e3e] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-10 bg-black rounded overflow-hidden flex items-center justify-center border border-[#444] flex-shrink-0">
                          {rec.thumbnailUrl ? (
                            <img src={rec.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <Film className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-[12px] flex items-center space-x-1.5">
                            <span>{rec.title}.{ext}</span>
                            <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1 py-0.2 rounded font-mono uppercase">{ext}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                            <span>{rec.date}</span>
                            <span>•</span>
                            <span>Duration: {formatDurationSimple(rec.durationSeconds)}</span>
                            <span>•</span>
                            <span>Size: {rec.fileSizeFormatted}</span>
                            <span>•</span>
                            <span className="text-cyan-400 uppercase font-mono">{rec.sourceType}</span>
                          </div>
                          {rec.savedFilePath && (
                            <div className="text-[9.5px] text-emerald-400 truncate max-w-sm mt-0.5">
                              ✓ Saved to: {rec.savedFilePath}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setActivePlayingItem(rec)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center space-x-1 shadow"
                          title="Play in viewer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play</span>
                        </button>

                        {rec.savedFilePath && (
                          <button
                            onClick={() => handleShowFileInFolder(rec.savedFilePath)}
                            className="px-2.5 py-1 bg-[#383838] hover:bg-[#484848] text-amber-300 rounded font-medium flex items-center space-x-1 border border-[#555]"
                            title="Show in Windows Explorer"
                          >
                            <FolderOpen className="w-3 h-3" />
                            <span>Folder</span>
                          </button>
                        )}

                        <a
                          href={rec.url}
                          download={`${rec.title}.${ext}`}
                          className="px-2.5 py-1 bg-[#404040] hover:bg-[#505050] text-slate-200 rounded font-medium flex items-center space-x-1 border border-[#555]"
                          title="Download video file"
                        >
                          <Download className="w-3 h-3" />
                          <span>Save {ext?.toUpperCase()}</span>
                        </a>

                        <button
                          onClick={() => onDeleteRecording(rec.id)}
                          className="p-1 hover:bg-red-950/60 hover:text-red-400 text-slate-400 rounded transition-colors"
                          title="Delete recording"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            snapshots.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-300">No snapshots captured</p>
                <p className="text-[11px] mt-1">Click the SNAP camera button or press F12 to capture high-res snapshots.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-2 rounded bg-[#242424] border border-[#3e3e3e] flex flex-col space-y-2 group"
                  >
                    <div
                      onClick={() => setViewingSnapshot(snap)}
                      className="h-28 bg-black rounded overflow-hidden cursor-pointer border border-[#333]"
                    >
                      <img src={snap.dataUrl} alt={snap.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-white truncate max-w-[120px]">{snap.title}</span>
                      <div className="flex items-center space-x-1">
                        <a
                          href={snap.dataUrl}
                          download={`${snap.title}.png`}
                          className="p-1 hover:text-blue-400 text-slate-400"
                          title="Download PNG"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => onDeleteSnapshot(snap.id)}
                          className="p-1 hover:text-red-400 text-slate-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#222] border-t border-[#3a3a3a] px-4 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Total items: {recordings.length + snapshots.length}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#444] hover:bg-[#555] text-white rounded font-medium border border-[#666]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
