/**
 * GNOA Recording Suit
 * Professional Screen, Webcam, System Sound & Audio Recording Application
 * Works with Laptop (Windows) and Mac OS as a lightweight background application.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  OSType,
  ActiveTab,
  CaptureSource,
  ScreenSelectionMode,
  RecordingState,
  AppSettings,
  RecordingItem,
  SnapshotItem,
} from './types';
import { defaultSettings, formatFileSize } from './utils/helpers';
import { audioEngine } from './utils/audioEngine';
import { TitleBar } from './components/TitleBar';
import { MenuBar } from './components/MenuBar';
import { RibbonTabs } from './components/RibbonTabs';
import { Toolbars } from './components/Toolbars';
import { PreviewViewport } from './components/PreviewViewport';
import { BottomControlDock } from './components/BottomControlDock';
import { OptionsModal } from './components/OptionsModal';
import { RecordingsModal } from './components/RecordingsModal';
import { BackgroundTrayWidget } from './components/BackgroundTrayWidget';

export default function App() {
  // OS & Layout state
  const [os, setOs] = useState<OSType>('windows');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimizedToTray, setIsMinimizedToTray] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Tabs & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [optionsInitialTab, setOptionsInitialTab] = useState<string>('video');
  const [recordingsModalOpen, setRecordingsModalOpen] = useState(false);
  const [lastRecordedItem, setLastRecordedItem] = useState<RecordingItem | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Capture & Media Stream state
  const [source, setSource] = useState<CaptureSource>('screen');
  const [screenSelectionMode, setScreenSelectionMode] = useState<ScreenSelectionMode>('entire');
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  // Recording Engine State
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [dbLevel, setDbLevel] = useState(-42);

  // Settings & Storage (Persistent in localStorage & electron userData)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('gnoa_settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage:', e);
    }
    return defaultSettings;
  });

  const [recordings, setRecordings] = useState<RecordingItem[]>(() => {
    try {
      const saved = localStorage.getItem('gnoa_recordings_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [snapshots, setSnapshots] = useState<SnapshotItem[]>(() => {
    try {
      const saved = localStorage.getItem('gnoa_snapshots_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Save settings persistently
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('gnoa_settings', JSON.stringify(newSettings));
      if ((window as any).require) {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.invoke('save-persistent-settings', newSettings);
      }
    } catch (e) {
      console.warn('Failed to persist settings:', e);
    }
  };

  // Load persistent settings from Electron userData on startup
  useEffect(() => {
    if ((window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.invoke('load-persistent-settings').then((fileSettings: any) => {
          if (fileSettings) {
            setSettings((prev) => ({ ...prev, ...fileSettings }));
          }
        });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save recordings metadata history
  useEffect(() => {
    try {
      const metadataOnly = recordings.map(({ id, title, url, date, durationSeconds, fileSizeFormatted, sourceType, resolution, savedFilePath }) => ({
        id, title, url, date, durationSeconds, fileSizeFormatted, sourceType, resolution, savedFilePath
      }));
      localStorage.setItem('gnoa_recordings_history', JSON.stringify(metadataOnly));
    } catch (e) {
      // ignore
    }
  }, [recordings]);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);
  const vuAnimationFrameRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // --- Real Audio VU Meter Loop ---
  useEffect(() => {
    const updateMeter = () => {
      if (settings.onlyShowDbDuringRecord && recordingState !== 'recording') {
        setDbLevel(-42);
      } else {
        const lvl = audioEngine.getDecibelLevel();
        setDbLevel(lvl);
      }
      vuAnimationFrameRef.current = requestAnimationFrame(updateMeter);
    };

    vuAnimationFrameRef.current = requestAnimationFrame(updateMeter);
    return () => {
      if (vuAnimationFrameRef.current) cancelAnimationFrame(vuAnimationFrameRef.current);
    };
  }, [recordingState, settings.onlyShowDbDuringRecord]);

  // Request Microphone and connect to AudioEngine
  const initAudioStreams = useCallback(async () => {
    try {
      if (settings.recordMicrophone && !micStream) {
        const audioConstraints: MediaStreamConstraints = {
          audio: settings.microphoneDeviceId
            ? { deviceId: { exact: settings.microphoneDeviceId } }
            : true,
        };
        const mic = await navigator.mediaDevices.getUserMedia(audioConstraints);
        setMicStream(mic);
        audioEngine.connectStreams(mic, screenStream);
      }
    } catch (err) {
      console.warn('Microphone access note:', err);
    }
  }, [settings.recordMicrophone, settings.microphoneDeviceId, micStream, screenStream]);

  // --- Start Screen Capture (Screen + System Sound) ---
  const handleStartScreenCapture = async () => {
    try {
      let displayStream: MediaStream;

      if ((window as any).require) {
        try {
          const { ipcRenderer } = (window as any).require('electron');
          const sources = await ipcRenderer.invoke('get-desktop-sources');
          if (sources && sources.length > 0) {
            const screenSource = sources[0]; // just pick the primary screen for now
            displayStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                }
              },
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: screenSource.id,
                  minFrameRate: settings.frameRate,
                  maxFrameRate: settings.frameRate
                }
              }
            } as any);
          } else {
            throw new Error('No desktop sources found');
          }
        } catch (err) {
          console.warn('Electron IPC capture failed, falling back to standard getDisplayMedia', err);
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              frameRate: settings.frameRate,
            },
            audio: settings.recordSpeakers,
          });
        }
      } else {
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: settings.frameRate,
          },
          audio: settings.recordSpeakers,
        });
      }

      // Handle stream end when user clicks "Stop Sharing" from browser native banner
      displayStream.getVideoTracks()[0].onended = () => {
        handleStopRecording();
        setScreenStream(null);
      };

      setScreenStream(displayStream);
      setSource('screen');

      // Connect screen system audio tracks + mic
      audioEngine.connectStreams(micStream, displayStream);
      
      return displayStream;
    } catch (err) {
      console.warn('Screen capture cancelled or unavailable:', err);
      return null;
    }
  };

  // --- Start Webcam Capture ---
  const handleStartWebcamCapture = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: settings.webcamDeviceId
          ? { deviceId: { exact: settings.webcamDeviceId } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: settings.recordMicrophone,
      };

      const cam = await navigator.mediaDevices.getUserMedia(constraints);
      setWebcamStream(cam);
      if (source === 'webcam') {
        audioEngine.connectStreams(cam, screenStream);
      }
      return cam;
    } catch (err) {
      console.warn('Webcam access error:', err);
      alert('Unable to access webcam. Please check camera permissions in your browser.');
      return null;
    }
  };

  // Toggle Source
  const handleSelectSource = (newSource: CaptureSource) => {
    setSource(newSource);
    if (newSource === 'screen') {
      if (!screenStream) handleStartScreenCapture();
    } else if (newSource === 'webcam') {
      if (!webcamStream) handleStartWebcamCapture();
    } else {
      // Device / Network simulation
      alert(`Connecting to ${newSource.toUpperCase()} capture device...`);
    }
  };

  // Toggle Webcam Overlay (Picture-in-Picture)
  const handleToggleWebcamOverlay = () => {
    const nextState = !settings.showWebcamOverlay;
    setSettings((prev) => ({ ...prev, showWebcamOverlay: nextState }));
    if (nextState && !webcamStream) {
      handleStartWebcamCapture();
    }
  };

  // --- Execute Actual Recording Start ---
  const startRecordingImmediate = async () => {
    // Determine active stream to record
    let activeStream: MediaStream | null = source === 'screen' ? screenStream : webcamStream;

    // If no stream active yet, request screen stream first
    if (!activeStream) {
      if (source === 'screen') {
        activeStream = await handleStartScreenCapture();
      } else {
        activeStream = await handleStartWebcamCapture();
      }
      
      if (!activeStream) return; // User cancelled or failed
    }

    if (settings.soundRecordToneStart) {
      audioEngine.playTone(880, 0.15); // Start beep
    }

    try {
      // Combine video track + mixed audio tracks
      const tracks: MediaStreamTrack[] = [...activeStream.getVideoTracks()];

      // Get mixed audio (Microphone + System Sound)
      const mixedAudioTracks = audioEngine.getMixedAudioTracks();
      if (mixedAudioTracks.length > 0) {
        tracks.push(...mixedAudioTracks);
      } else {
        // Fallback to source audio tracks if available
        tracks.push(...activeStream.getAudioTracks());
      }

      const combinedStream = new MediaStream(tracks);

      // Determine mimeType prioritizing MKV
      const mimeTypes = [
        'video/x-matroska;codecs=avc1,opus',
        'video/x-matroska;codecs=vp9,opus',
        'video/x-matroska',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4',
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/x-matroska';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 3000000,
      });

      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        finalizeRecording();
      };

      recorder.start(1000); // 1-second chunks
      mediaRecorderRef.current = recorder;

      // Start elapsed timer
      setRecordingState('recording');
      startTimeRef.current = Date.now();
      pausedElapsedRef.current = 0;
      setElapsedMs(0);
      setShowSuccessBanner(false);

      // Auto-minimize software window when recording starts (Issue #4)
      if ((window as any).require) {
        try {
          const { ipcRenderer } = (window as any).require('electron');
          ipcRenderer.send('window-minimize');
        } catch (e) {
          // ignore
        }
      }
      setIsMinimizedToTray(true);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const currentElapsed = now - startTimeRef.current + pausedElapsedRef.current;
        setElapsedMs(currentElapsed);

        // Check user-configured recording limit (requirement: "can set recording time")
        if (settings.limitMaxRecordingTime && settings.maxRecordingTimeSeconds > 0) {
          if (currentElapsed >= settings.maxRecordingTimeSeconds * 1000) {
            if (settings.onMaxTimeReached === 'stop') {
              handleStopRecording();
            } else {
              // Auto split & continue
              handleStopRecording();
              setTimeout(() => startRecordingImmediate(), 800);
            }
          }
        }
      }, 50);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      alert('Could not start recording with current stream.');
    }
  };

  // --- Finalize Recording into Blob & Add to Library ---
  const finalizeRecording = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (settings.soundRecordToneStop) {
      audioEngine.playTone(440, 0.2); // Stop beep
    }

    const blob = new Blob(recordedChunksRef.current, { type: 'video/x-matroska' });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const durationSec = Math.max(1, Math.round(elapsedMs / 1000));

    // Generate filename based on template - MKV format (Issue #5)
    const dateFormatted = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
    const autoNumber = (recordings.length + 1).toString().padStart(3, '0');
    const title = `GNOA_${dateFormatted}_${timeFormatted}_${autoNumber}`;
    const fileName = `${title}.mkv`;

    // Auto-save recording directly into user's desired destination folder (Issue #7)
    let savedFilePath = '';
    if ((window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const arrayBuffer = await blob.arrayBuffer();
        const saveRes = await ipcRenderer.invoke('save-recording-file', {
          destinationFolder: settings.destinationFolder,
          fileName,
          buffer: new Uint8Array(arrayBuffer),
        });
        if (saveRes && saveRes.success) {
          savedFilePath = saveRes.filePath;
        }

        // Restore window from auto-minimize when recording finishes (Issue #4)
        ipcRenderer.send('window-restore');
      } catch (err) {
        console.warn('Auto-save note:', err);
      }
    }

    setIsMinimizedToTray(false);

    const newRecording: RecordingItem = {
      id: Date.now().toString(),
      title,
      url,
      blob,
      date: now.toLocaleString(),
      durationSeconds: durationSec,
      fileSizeFormatted: formatFileSize(blob.size),
      sourceType: source,
      resolution: source === 'screen' ? '1920x1080' : '1280x720',
      savedFilePath,
    };

    setRecordings((prev) => [newRecording, ...prev]);
    setLastRecordedItem(newRecording);
    setRecordingState('idle');

    // Show Debut-style notification (Issue #3)
    if (!settings.disablePlayVideoNotification) {
      setShowSuccessBanner(true);
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Recording Complete', {
            body: `Video saved as ${fileName} in ${settings.destinationFolder}`,
          });
        }
      } catch (e) {
        // ignore
      }
    }
  };

  // --- Trigger Record Button (with optional countdown) ---
  const handleRecord = () => {
    if (recordingState === 'recording' || recordingState === 'countdown') return;

    // Check if countdown timer enabled in options
    if (settings.showCountdownTimer && settings.countdownSeconds > 0) {
      setRecordingState('countdown');
      let count = settings.countdownSeconds;
      setCountdownValue(count);

      countdownIntervalRef.current = window.setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownValue(count);
          audioEngine.playTone(600, 0.08);
        } else {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setCountdownValue(null);
          startRecordingImmediate();
        }
      }, 1000);
    } else {
      startRecordingImmediate();
    }
  };

  // --- Pause / Resume ---
  const handlePause = () => {
    if (!mediaRecorderRef.current) return;

    if (recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      pausedElapsedRef.current = elapsedMs;
    } else if (recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      startTimeRef.current = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        setElapsedMs(now - startTimeRef.current + pausedElapsedRef.current);
      }, 50);
    }
  };

  // --- Stop Recording ---
  const handleStopRecording = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      setCountdownValue(null);
    }

    if ((window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.send('window-restore');
      } catch (e) {}
    }
    setIsMinimizedToTray(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setRecordingState('idle');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // --- Reveal in Windows Explorer ---
  const handleShowInFolder = (filePath?: string) => {
    if ((window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        if (filePath) {
          ipcRenderer.invoke('show-item-in-folder', filePath);
        } else {
          ipcRenderer.invoke('open-directory', settings.destinationFolder);
        }
      } catch (e) {
        alert(`Recordings folder: ${settings.destinationFolder}`);
      }
    } else {
      alert(`Recordings folder: ${settings.destinationFolder}`);
    }
  };

  // --- Automatic & Scheduled Recording Start (Issue #1) ---
  useEffect(() => {
    // 1. Auto-start recording on launch after delay if enabled
    if (settings.startRecordingAutomatically) {
      const delayMs = (settings.autoStartDelaySeconds || 3) * 1000;
      const timer = setTimeout(() => {
        if (recordingState === 'idle') {
          handleRecord();
        }
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [settings.startRecordingAutomatically, settings.autoStartDelaySeconds]);

  useEffect(() => {
    // 2. Scheduled automatic recording at specific time (HH:MM)
    if (!settings.enableScheduledRecording || !settings.scheduledRecordingTime) return;

    let lastTriggeredMinute = '';

    const interval = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const currentHM = `${currentH}:${currentM}`;

      if (currentHM === settings.scheduledRecordingTime && lastTriggeredMinute !== currentHM) {
        lastTriggeredMinute = currentHM;
        if (recordingState === 'idle') {
          handleRecord();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.enableScheduledRecording, settings.scheduledRecordingTime, recordingState]);

  // --- Instant Snapshot Capture ---
  const handleTakeSnapshot = () => {
    const videoElement = document.querySelector('video') as HTMLVideoElement | null;
    if (!videoElement || videoElement.videoWidth === 0) {
      // Capture canvas fallback
      alert('Snapshot: Please have an active screen or webcam video stream to capture.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Optional timestamp watermark
    if (settings.showTimestampWatermark) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(20, 20, 320, 34);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText(`${new Date().toLocaleString()} [GNOA]`, 30, 44);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const now = new Date();
    const title = `Snapshot_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;

    const newSnapshot: SnapshotItem = {
      id: Date.now().toString(),
      title,
      dataUrl,
      date: now.toLocaleString(),
      resolution: `${canvas.width}x${canvas.height}`,
    };

    setSnapshots((prev) => [newSnapshot, ...prev]);

    // Play camera sound
    audioEngine.playTone(1500, 0.05);

    // Brief notification
    setShowSuccessBanner(true);
  };

  // --- Global Keyboard Hotkeys (F9 = Record/Stop, F10 = Pause, F12 = Snap) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F9: Record or Stop
      if (e.key === 'F9') {
        e.preventDefault();
        if (recordingState === 'idle') {
          handleRecord();
        } else {
          handleStopRecording();
        }
      }
      // F10: Pause / Resume
      if (e.key === 'F10') {
        e.preventDefault();
        if (recordingState === 'recording' || recordingState === 'paused') {
          handlePause();
        }
      }
      // F12: Snapshot
      if (e.key === 'F12') {
        e.preventDefault();
        handleTakeSnapshot();
      }
      // Ctrl + O: Options
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setOptionsModalOpen(true);
      }
      // Ctrl + R: Recordings
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setRecordingsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recordingState, source, screenStream, webcamStream, settings]);

  // Audio click sound simulation if enabled
  useEffect(() => {
    if (!settings.recordMouseClicks) return;
    const handleMouseClick = () => {
      audioEngine.playClickSound();
    };
    window.addEventListener('mousedown', handleMouseClick);
    return () => window.removeEventListener('mousedown', handleMouseClick);
  }, [settings.recordMouseClicks]);

  // Init mic on startup if enabled
  useEffect(() => {
    initAudioStreams();
  }, [initAudioStreams]);

  return (
    <div
      className={`w-screen h-screen flex flex-col bg-[#1e1e1e] text-slate-100 select-none overflow-hidden font-sans ${
        isMaximized ? 'fixed inset-0' : 'p-0'
      }`}
    >
      {/* If Minimized to Tray (Background Application Mode) */}
      {isMinimizedToTray ? (
        <BackgroundTrayWidget
          os={os}
          recordingState={recordingState}
          elapsedMs={elapsedMs}
          onRestore={() => setIsMinimizedToTray(false)}
          onRecord={handleRecord}
          onPause={handlePause}
          onStop={handleStopRecording}
          onToggleOs={() => setOs((prev) => (prev === 'windows' ? 'macos' : 'windows'))}
        />
      ) : (
        /* Full GNOA Application Main Window */
        <div className="flex-1 flex flex-col bg-[#1e1e1e] h-full overflow-hidden border border-[#333]">
          {/* 1. Window Title Bar */}
          <TitleBar
            os={os}
            onToggleOs={() => setOs((prev) => (prev === 'windows' ? 'macos' : 'windows'))}
            onMinimizeToTray={() => setIsMinimizedToTray(true)}
            onClose={() => setIsMinimizedToTray(true)}
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
          />

          {/* 2. Menu Bar (File, Effects, Screen Capture, View, Tools, Help) */}
          <MenuBar
            recordingState={recordingState}
            onRecord={handleRecord}
            onPause={handlePause}
            onStop={handleStopRecording}
            onTakeSnapshot={handleTakeSnapshot}
            onOpenRecordings={() => setRecordingsModalOpen(true)}
            onOpenOptions={(tab) => {
              if (tab) setOptionsInitialTab(tab);
              setOptionsModalOpen(true);
            }}
            onSelectScreenMode={(mode) => setScreenSelectionMode(mode)}
            onToggleWebcamOverlay={handleToggleWebcamOverlay}
            webcamOverlayActive={settings.showWebcamOverlay}
          />

          {/* 3. Ribbon Tab Bar (Menu, Home, Effects, Options, Help, Suite) */}
          <RibbonTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenOptions={() => setOptionsModalOpen(true)}
            onOpenRecordings={() => setRecordingsModalOpen(true)}
            onOpenHelp={() => setActiveTab('help')}
          />

          {/* 4. Active Toolbar Ribbon */}
          <Toolbars
            activeTab={activeTab}
            currentSource={source}
            onSelectSource={handleSelectSource}
            onSelectScreenMode={(mode) => {
              setScreenSelectionMode(mode);
              handleStartScreenCapture();
            }}
            onToggleWebcamOverlay={handleToggleWebcamOverlay}
            webcamOverlayActive={settings.showWebcamOverlay}
            onOpenRecordings={() => setRecordingsModalOpen(true)}
            onOpenOptions={(tab) => {
              if (tab) setOptionsInitialTab(tab);
              setOptionsModalOpen(true);
            }}
            onOpenShare={() => {
              if (lastRecordedItem) {
                setRecordingsModalOpen(true);
              } else {
                alert('No recording yet to share. Please record a video first.');
              }
            }}
          />

          {/* 5. Center Viewport (Live video preview + PiP + Expand button) */}
          <PreviewViewport
            source={source}
            screenStream={screenStream}
            webcamStream={webcamStream}
            recordingState={recordingState}
            screenSelectionMode={screenSelectionMode}
            settings={settings}
            countdownValue={countdownValue}
            onStartCapture={handleStartScreenCapture}
            onRequestWebcam={handleStartWebcamCapture}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />

          {/* 6. Bottom Controls Dock (Record, Pause, Stop, VU dB meter, Timer, FPS, Snap, Green banner) */}
          <BottomControlDock
            recordingState={recordingState}
            elapsedMs={elapsedMs}
            dbLevel={dbLevel}
            settings={settings}
            onRecord={handleRecord}
            onPause={handlePause}
            onStop={handleStopRecording}
            onTakeSnapshot={handleTakeSnapshot}
            showSuccessBanner={showSuccessBanner}
            onCloseSuccessBanner={() => setShowSuccessBanner(false)}
            onPlayLastRecording={() => {
              if (lastRecordedItem) {
                setRecordingsModalOpen(true);
              }
            }}
            onOpenRecordingsFolder={() => handleShowInFolder()}
            onShowInFolder={handleShowInFolder}
            lastRecordedItem={lastRecordedItem}
            audioActive={settings.recordMicrophone || settings.recordSpeakers}
          />
        </div>
      )}

      {/* Options Dialog Modal */}
      <OptionsModal
        isOpen={optionsModalOpen}
        onClose={() => setOptionsModalOpen(false)}
        initialTab={optionsInitialTab}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Recordings & Snapshots Library Modal */}
      <RecordingsModal
        isOpen={recordingsModalOpen}
        onClose={() => setRecordingsModalOpen(false)}
        recordings={recordings}
        snapshots={snapshots}
        destinationFolder={settings.destinationFolder}
        onDeleteRecording={(id) => setRecordings((prev) => prev.filter((r) => r.id !== id))}
        onDeleteSnapshot={(id) => setSnapshots((prev) => prev.filter((s) => s.id !== id))}
        initialPlayItem={lastRecordedItem}
      />
    </div>
  );
}
