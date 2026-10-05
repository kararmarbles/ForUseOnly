import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'video',
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [devices, setDevices] = useState<{ audioInputs: MediaDeviceInfo[]; videoInputs: MediaDeviceInfo[] }>({
    audioInputs: [],
    videoInputs: [],
  });

  // Keep local settings in sync when opening
  useEffect(() => {
    setLocalSettings(settings);
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab, settings]);

  // Enumerate actual connected audio/video hardware
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devs) => {
        const audioInputs = devs.filter((d) => d.kind === 'audioinput');
        const videoInputs = devs.filter((d) => d.kind === 'videoinput');
        setDevices({ audioInputs, videoInputs });
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  // Convert maxRecordingTimeSeconds to h:mm:ss string and vice versa
  const maxHours = Math.floor(localSettings.maxRecordingTimeSeconds / 3600);
  const maxMinutes = Math.floor((localSettings.maxRecordingTimeSeconds % 3600) / 60);
  const maxSeconds = localSettings.maxRecordingTimeSeconds % 60;
  const timeString = `${maxHours}:${maxMinutes.toString().padStart(2, '0')}:${maxSeconds.toString().padStart(2, '0')}`;

  const parseTimeString = (val: string) => {
    const parts = val.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 1800;
  };

  const tabs = [
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio' },
    { id: 'output', label: 'Output' },
    { id: 'hotkeys', label: 'Hot-Keys' },
    { id: 'record', label: 'Record' },
    { id: 'cursor', label: 'Cursor' },
    { id: 'snapshots', label: 'Snapshots' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none p-4">
      {/* Authentic Debut/Windows Modal Window */}
      <div className="w-full max-w-[580px] bg-[#323232] text-slate-100 rounded border border-[#555] shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Title bar */}
        <div className="h-7 bg-[#282828] border-b border-[#404040] flex items-center justify-between px-2 text-slate-200">
          <div className="flex items-center space-x-1.5">
            <span className="text-cyan-400 font-bold">💾</span>
            <span className="font-semibold text-white tracking-wide">GNOA Options</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('GNOA Recording Suit - Configuration Help')}
              className="text-slate-400 hover:text-white px-1 font-bold text-xs"
              title="Help"
            >
              ?
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-400 hover:bg-[#444] px-1.5 py-0.5 rounded text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Strip (Authentic Classic Tabs, Screenshot 4, 5, 6, 7, 8) */}
        <div className="bg-[#242424] px-1 pt-1.5 border-b border-[#444] flex overflow-x-auto space-x-0.5 text-[11px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-t border-t border-l border-r transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#323232] text-white border-[#555] font-semibold -mb-[1px] z-10'
                  : 'bg-[#202020] text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents Area */}
        <div className="p-4 bg-[#323232] min-h-[380px] max-h-[460px] overflow-y-auto space-y-4">
          {/* VIDEO TAB (Screenshot 4) */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              {/* Screen Capture Box */}
              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-2">
                <div className="font-semibold text-slate-200 flex items-center space-x-1">
                  <input type="radio" checked readOnly className="accent-blue-500 mr-1" />
                  <span>Screen Capture</span>
                </div>
                <div className="pl-4 space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.loadLastSelection}
                      onChange={(e) => setLocalSettings({ ...localSettings, loadLastSelection: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Load last selection</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.applyGammaRamp}
                      onChange={(e) => setLocalSettings({ ...localSettings, applyGammaRamp: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Apply gamma ramp (Only works with full screen applications)</span>
                  </label>

                  <div className="flex items-center space-x-3 pt-1">
                    <span className="text-slate-300">Limit frame rate:</span>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={localSettings.frameRate}
                      onChange={(e) => setLocalSettings({ ...localSettings, frameRate: parseInt(e.target.value, 10) })}
                      className="w-32 accent-blue-500"
                    />
                    <span className="font-mono text-cyan-400 font-semibold">{localSettings.frameRate} FPS</span>
                  </div>
                </div>
              </div>

              {/* Webcam Box */}
              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <div className="flex items-center space-x-1">
                    <input type="radio" checked={false} readOnly className="accent-blue-500 mr-1" />
                    <span>Webcam</span>
                  </div>
                  <span className="text-blue-400 hover:underline cursor-pointer text-[10.5px]">
                    View recommended capture devices
                  </span>
                </div>

                <div className="pl-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-16 text-slate-400">Name:</span>
                    <select
                      value={localSettings.webcamDeviceId}
                      onChange={(e) => setLocalSettings({ ...localSettings, webcamDeviceId: e.target.value })}
                      className="flex-1 bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-slate-200"
                    >
                      <option value="">Default HD User Facing Camera</option>
                      {devices.videoInputs.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera (${d.deviceId.slice(0, 8)})`}
                        </option>
                      ))}
                    </select>
                    <button className="px-2 py-1 bg-[#404040] hover:bg-[#505050] rounded border border-[#555] text-slate-200">
                      Device Settings...
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="w-16 text-slate-400">Format:</span>
                    <select
                      value={localSettings.webcamFormat}
                      onChange={(e) => setLocalSettings({ ...localSettings, webcamFormat: e.target.value })}
                      className="flex-1 bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-slate-200"
                    >
                      <option value="1280 x 720 [16:9], 30.00 fps">1280 x 720 [16:9], 30.00 fps, MJPG</option>
                      <option value="1920 x 1080 [16:9], 30.00 fps">1920 x 1080 [16:9], 30.00 fps, H264</option>
                      <option value="640 x 480 [4:3], 30.00 fps">640 x 480 [4:3], 30.00 fps</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.stretchWidescreen}
                        onChange={(e) => setLocalSettings({ ...localSettings, stretchWidescreen: e.target.checked })}
                        className="rounded accent-blue-500"
                      />
                      <span>Stretch video to widescreen</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.deinterlaceVideo}
                        onChange={(e) => setLocalSettings({ ...localSettings, deinterlaceVideo: e.target.checked })}
                        className="rounded accent-blue-500"
                      />
                      <span>Deinterlace video</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Capture Device Box */}
              <div className="border border-[#484848] rounded p-2 bg-[#2d2d2d] space-y-1 text-slate-400 text-[11px]">
                <div className="font-semibold text-slate-300">Capture Device & Network Camera</div>
                <p>Support for HDMI capture cards, Elgato CamLink, USB video grabbers, and ONVIF/RTSP IP cameras.</p>
              </div>
            </div>
          )}

          {/* AUDIO TAB (Screenshot 5) */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <p className="text-slate-300">To record audio, select from the options below.</p>

              {/* Microphone Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 w-28 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.recordMicrophone}
                      onChange={(e) => setLocalSettings({ ...localSettings, recordMicrophone: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span className="font-semibold text-slate-200">Microphone</span>
                  </label>
                  <select
                    disabled={!localSettings.recordMicrophone}
                    value={localSettings.microphoneDeviceId}
                    onChange={(e) => setLocalSettings({ ...localSettings, microphoneDeviceId: e.target.value })}
                    className="flex-1 bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-slate-200 disabled:opacity-50"
                  >
                    <option value="">Default Microphone (Logi USB Headset / Built-in)</option>
                    {devices.audioInputs.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Microphone (${d.deviceId.slice(0, 8)})`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => alert('Windows / Mac Sound Mixer settings')}
                    className="px-2.5 py-1 bg-[#404040] hover:bg-[#505050] rounded border border-[#555] text-slate-200"
                  >
                    System Mixer...
                  </button>
                </div>

                {/* Speakers / System Sound (crucial user requirement: "also caputer vido audio sytem sound screen cmera") */}
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 w-28 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.recordSpeakers}
                      onChange={(e) => setLocalSettings({ ...localSettings, recordSpeakers: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span className="font-semibold text-slate-200">Speakers</span>
                  </label>
                  <select
                    disabled={!localSettings.recordSpeakers}
                    value={localSettings.speakersDeviceId}
                    onChange={(e) => setLocalSettings({ ...localSettings, speakersDeviceId: e.target.value })}
                    className="flex-1 bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-slate-200 disabled:opacity-50"
                  >
                    <option value="MMDevice">MMDevice (System Sound Loopback / Desktop Audio)</option>
                    <option value="speakers">Default Audio Output / Speakers</option>
                  </select>
                  <button
                    onClick={() => alert('Windows Sound Properties')}
                    className="px-2.5 py-1 bg-[#404040] hover:bg-[#505050] rounded border border-[#555] text-slate-200"
                  >
                    Sound Mixer...
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-1.5 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.recordMouseClicks}
                    onChange={(e) => setLocalSettings({ ...localSettings, recordMouseClicks: e.target.checked })}
                    className="rounded accent-blue-500"
                  />
                  <span>Mouse Clicks (generate sound on click)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.onlyShowDbDuringRecord}
                    onChange={(e) => setLocalSettings({ ...localSettings, onlyShowDbDuringRecord: e.target.checked })}
                    className="rounded accent-blue-500"
                  />
                  <span>Only show dB levels during recording</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.noiseReduction}
                    onChange={(e) => setLocalSettings({ ...localSettings, noiseReduction: e.target.checked })}
                    className="rounded accent-blue-500"
                  />
                  <span>Automatic background noise reduction</span>
                </label>
              </div>

              {/* Tone Group Box */}
              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-2">
                <div className="font-semibold text-slate-300">Tone</div>
                <div className="space-y-1.5 pl-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.soundRecordToneStart}
                      onChange={(e) => setLocalSettings({ ...localSettings, soundRecordToneStart: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Sound record tone when recording starts</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.soundRecordToneStop}
                      onChange={(e) => setLocalSettings({ ...localSettings, soundRecordToneStop: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Sound stopped tone when recording stops</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.soundRecordToneInterval}
                        onChange={(e) => setLocalSettings({ ...localSettings, soundRecordToneInterval: e.target.checked })}
                        className="rounded accent-blue-500"
                      />
                      <span>Sound record tone every (seconds):</span>
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={localSettings.toneIntervalSeconds}
                      onChange={(e) => setLocalSettings({ ...localSettings, toneIntervalSeconds: parseInt(e.target.value, 10) || 30 })}
                      className="w-16 bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-0.5 text-center text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OUTPUT TAB (Screenshot 6) */}
          {activeTab === 'output' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span>Warn when hard drive space is low (below MB):</span>
                <input
                  type="number"
                  value={localSettings.warnLowDiskSpace}
                  onChange={(e) => setLocalSettings({ ...localSettings, warnLowDiskSpace: parseInt(e.target.value, 10) || 300 })}
                  className="w-20 bg-[#1e1e1e] border border-[#555] rounded px-2 py-0.5 text-slate-200 text-center font-mono"
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.overwriteOldRecordings}
                  onChange={(e) => setLocalSettings({ ...localSettings, overwriteOldRecordings: e.target.checked })}
                  className="rounded accent-blue-500"
                />
                <span>Automatically overwrite old recordings when space is low with new recordings</span>
              </label>

              {/* Destination Folder */}
              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-1.5">
                <div className="font-semibold text-slate-300">Destination Folder</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={localSettings.destinationFolder}
                    onChange={(e) => setLocalSettings({ ...localSettings, destinationFolder: e.target.value })}
                    className="flex-1 bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                  />
                  <button
                    onClick={async () => {
                      if ((window as any).require) {
                        try {
                          const { ipcRenderer } = (window as any).require('electron');
                          const result = await ipcRenderer.invoke('dialog:openDirectory');
                          if (result && result.length > 0) {
                            setLocalSettings({ ...localSettings, destinationFolder: result[0] });
                          }
                        } catch (err) {
                          const newPath = prompt('Enter destination directory:', localSettings.destinationFolder);
                          if (newPath) setLocalSettings({ ...localSettings, destinationFolder: newPath });
                        }
                      } else {
                        const newPath = prompt('Enter destination directory:', localSettings.destinationFolder);
                        if (newPath) setLocalSettings({ ...localSettings, destinationFolder: newPath });
                      }
                    }}
                    className="px-3 py-1 bg-[#404040] hover:bg-[#505050] rounded border border-[#555] text-slate-200 font-bold"
                  >
                    ...
                  </button>
                </div>
              </div>

              {/* Output File Name */}
              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-2">
                <div className="font-semibold text-slate-300">Output File Name</div>
                <div className="space-y-1.5 pl-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="filename_mode"
                      checked={localSettings.fileNamePrompt}
                      onChange={() => setLocalSettings({ ...localSettings, fileNamePrompt: true })}
                      className="accent-blue-500"
                    />
                    <span>Prompt for file name before recording starts</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="filename_mode"
                      checked={!localSettings.fileNamePrompt}
                      onChange={() => setLocalSettings({ ...localSettings, fileNamePrompt: false })}
                      className="accent-blue-500"
                    />
                    <span>Use this file name format</span>
                  </label>

                  <div className="flex items-center space-x-2 pt-1 pl-4">
                    <span className="text-slate-400">Format:</span>
                    <input
                      type="text"
                      value={localSettings.fileNameFormat}
                      onChange={(e) => setLocalSettings({ ...localSettings, fileNameFormat: e.target.value })}
                      className="flex-1 bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                    />
                    <button
                      onClick={() => setLocalSettings({ ...localSettings, fileNameFormat: '%autonumber%-%DD%-%MM%-%YYYY%' })}
                      className="px-3 py-1 bg-[#404040] hover:bg-[#505050] rounded border border-[#555] text-slate-200"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECORD TAB (Screenshot 7 - user requirement: "can set recording time and select screen also") */}
          {activeTab === 'record' && (
            <div className="space-y-4">
              {/* Limits Box */}
              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-2">
                <div className="font-semibold text-slate-200">Limits</div>
                <div className="pl-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.limitMaxRecordingTime}
                        onChange={(e) => setLocalSettings({ ...localSettings, limitMaxRecordingTime: e.target.checked })}
                        className="rounded accent-blue-500"
                      />
                      <span>Limit maximum recording time (h:mm:ss) to:</span>
                    </label>
                    <input
                      type="text"
                      defaultValue={timeString}
                      onBlur={(e) => {
                        const sec = parseTimeString(e.target.value);
                        setLocalSettings({ ...localSettings, maxRecordingTimeSeconds: sec });
                      }}
                      className="w-24 bg-[#1e1e1e] border border-[#555] rounded px-2 py-0.5 text-center text-cyan-400 font-mono font-semibold"
                    />
                  </div>

                  <div className="pl-4 space-y-1">
                    <span className="text-slate-400 text-[11px]">When the maximum recording time is reached:</span>
                    <div className="flex items-center space-x-4 pl-1">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="onMaxTime"
                          checked={localSettings.onMaxTimeReached === 'stop'}
                          onChange={() => setLocalSettings({ ...localSettings, onMaxTimeReached: 'stop' })}
                          className="accent-blue-500"
                        />
                        <span>Stop recording</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="onMaxTime"
                          checked={localSettings.onMaxTimeReached === 'continue'}
                          onChange={() => setLocalSettings({ ...localSettings, onMaxTimeReached: 'continue' })}
                          className="accent-blue-500"
                        />
                        <span>Create new recording and continue</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen Capture Options Box */}
              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-2">
                <div className="font-semibold text-slate-200">Screen Capture</div>
                <div className="pl-2 space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.disablePreviewInScreenCapture}
                      onChange={(e) => setLocalSettings({ ...localSettings, disablePreviewInScreenCapture: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Disable preview when recording in screen capture</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.minimizeWhenRecording}
                      onChange={(e) => setLocalSettings({ ...localSettings, minimizeWhenRecording: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Minimize GNOA window when recording if it is covering the recording selection</span>
                  </label>

                  <div className="pl-5 space-y-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.minimizeToTray}
                        onChange={(e) => setLocalSettings({ ...localSettings, minimizeToTray: e.target.checked })}
                        className="rounded accent-blue-500"
                      />
                      <span>Minimize to tray</span>
                    </label>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.quickStopFromTray}
                      onChange={(e) => setLocalSettings({ ...localSettings, quickStopFromTray: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Quick stop from tray</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.disablePlayVideoNotification}
                      onChange={(e) => setLocalSettings({ ...localSettings, disablePlayVideoNotification: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Disable 'Play Video' notification after recording</span>
                  </label>

                  <div className="flex items-center space-x-2 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.showCountdownTimer}
                        onChange={(e) => setLocalSettings({ ...localSettings, showCountdownTimer: e.target.checked })}
                        className="rounded accent-blue-500"
                      />
                      <span>Show recording countdown timer (countdown duration in seconds)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={localSettings.countdownSeconds}
                      onChange={(e) => setLocalSettings({ ...localSettings, countdownSeconds: parseInt(e.target.value, 10) || 3 })}
                      className="w-14 bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-0.5 text-center text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER TAB (Screenshot 8) */}
          {activeTab === 'other' && (
            <div className="space-y-4">
              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-2">
                <div className="font-semibold text-slate-200">Startup and Exit</div>
                <div className="pl-2 space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.runOnComputerStart}
                      onChange={(e) => setLocalSettings({ ...localSettings, runOnComputerStart: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Run GNOA when computer starts (Lightweight background service)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.startRecordingAutomatically}
                      onChange={(e) => setLocalSettings({ ...localSettings, startRecordingAutomatically: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Start recording automatically when GNOA runs</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showTimestampWatermark}
                      onChange={(e) => setLocalSettings({ ...localSettings, showTimestampWatermark: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Enable the Include Timestamp checkbox when GNOA runs</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.displayTaskbarNotification}
                      onChange={(e) => setLocalSettings({ ...localSettings, displayTaskbarNotification: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Display notification on taskbar during recording</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showRecordingPreview}
                      onChange={(e) => setLocalSettings({ ...localSettings, showRecordingPreview: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span>Show the recording preview</span>
                  </label>
                </div>
              </div>

              <div className="border border-[#484848] rounded p-2.5 bg-[#2d2d2d] space-y-1.5 text-slate-300">
                <div className="font-semibold text-slate-200">Dialogs & Notifications</div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-blue-500" />
                  <span>Display notification when starting screen capture if GNOA will be hidden</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded accent-blue-500" />
                  <span>Display notification when recording in high resolution MPG/MP4</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-blue-500" />
                  <span>Show recordings dialog when recording stops</span>
                </label>
              </div>
            </div>
          )}

          {/* HOTKEYS TAB */}
          {activeTab === 'hotkeys' && (
            <div className="space-y-3">
              <div className="font-semibold text-slate-200">Configured Keyboard Shortcuts</div>
              <div className="space-y-2 bg-[#2d2d2d] p-3 rounded border border-[#484848]">
                <div className="flex justify-between items-center py-1 border-b border-[#3e3e3e]">
                  <span>Start / Stop Recording:</span>
                  <span className="font-mono bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#555] text-cyan-400 font-bold">F9</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#3e3e3e]">
                  <span>Pause / Resume Recording:</span>
                  <span className="font-mono bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#555] text-cyan-400 font-bold">F10</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#3e3e3e]">
                  <span>Take Snapshot:</span>
                  <span className="font-mono bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#555] text-cyan-400 font-bold">F12</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#3e3e3e]">
                  <span>Open Recordings:</span>
                  <span className="font-mono bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#555] text-slate-300">Ctrl + R</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Open Options:</span>
                  <span className="font-mono bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#555] text-slate-300">Ctrl + O</span>
                </div>
              </div>
            </div>
          )}

          {/* CURSOR TAB */}
          {activeTab === 'cursor' && (
            <div className="space-y-3">
              <div className="font-semibold text-slate-200">Mouse Cursor & Highlighting Effects</div>
              <div className="bg-[#2d2d2d] p-3 rounded border border-[#484848] space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.cursorHighlight}
                    onChange={(e) => setLocalSettings({ ...localSettings, cursorHighlight: e.target.checked })}
                    className="rounded accent-blue-500"
                  />
                  <span>Highlight mouse cursor with yellow circle</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.recordMouseClicks}
                    onChange={(e) => setLocalSettings({ ...localSettings, recordMouseClicks: e.target.checked })}
                    className="rounded accent-blue-500"
                  />
                  <span>Animate click ripple effect on mouse click</span>
                </label>
              </div>
            </div>
          )}

          {/* SNAPSHOTS TAB */}
          {activeTab === 'snapshots' && (
            <div className="space-y-3">
              <div className="font-semibold text-slate-200">Snapshot Options</div>
              <div className="bg-[#2d2d2d] p-3 rounded border border-[#484848] space-y-2">
                <div className="flex items-center justify-between">
                  <span>Snapshot format:</span>
                  <select className="bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-slate-200">
                    <option>PNG (Lossless image format)</option>
                    <option>JPEG (High Quality 95%)</option>
                  </select>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-blue-500" />
                  <span>Play camera shutter sound on snapshot</span>
                </label>
              </div>
            </div>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="border border-[#484848] rounded p-3 bg-[#2d2d2d] space-y-3">
                <div className="font-semibold text-slate-200">Scheduled Automatic Recording</div>
                <div className="pl-2 space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.enableScheduledRecording}
                      onChange={(e) => setLocalSettings({ ...localSettings, enableScheduledRecording: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span className="font-semibold text-slate-200">Enable scheduled recording at specific time</span>
                  </label>

                  <div className="flex items-center space-x-3 pl-6">
                    <span className="text-slate-300">Start Time (24h format):</span>
                    <input
                      type="time"
                      disabled={!localSettings.enableScheduledRecording}
                      value={localSettings.scheduledRecordingTime || '12:00'}
                      onChange={(e) => setLocalSettings({ ...localSettings, scheduledRecordingTime: e.target.value })}
                      className="bg-[#1e1e1e] border border-[#555] rounded px-2.5 py-1 text-cyan-400 font-mono font-semibold disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-[#484848] rounded p-3 bg-[#2d2d2d] space-y-3">
                <div className="font-semibold text-slate-200">Auto-Start on Application Launch</div>
                <div className="pl-2 space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.startRecordingAutomatically}
                      onChange={(e) => setLocalSettings({ ...localSettings, startRecordingAutomatically: e.target.checked })}
                      className="rounded accent-blue-500"
                    />
                    <span className="font-semibold text-slate-200">Start recording automatically when application launches</span>
                  </label>

                  <div className="flex items-center space-x-3 pl-6">
                    <span className="text-slate-300">Wait delay before recording starts:</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      disabled={!localSettings.startRecordingAutomatically}
                      value={localSettings.autoStartDelaySeconds || 3}
                      onChange={(e) => setLocalSettings({ ...localSettings, autoStartDelaySeconds: parseInt(e.target.value, 10) || 3 })}
                      className="w-16 bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-center text-slate-100 disabled:opacity-40 font-mono"
                    />
                    <span className="text-slate-400">seconds</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#484848] rounded p-3 bg-[#2d2d2d] space-y-2 text-slate-400 text-[11px]">
                <div className="font-semibold text-slate-300">Notice:</div>
                <p>Scheduled and auto-start recordings will automatically minimize the application and save the output directly as MKV into your chosen destination folder.</p>
              </div>
            </div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === 'advanced' && (
            <div className="space-y-3">
              <div className="font-semibold text-slate-200">Advanced Hardware Acceleration & Codecs</div>
              <div className="bg-[#2d2d2d] p-3 rounded border border-[#484848] space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-blue-500" />
                  <span>Enable GPU hardware accelerated video encoder (NVENC / Apple Metal / Intel QSV)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-blue-500" />
                  <span>Use multi-threading for video compression</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Buttons (Screenshot 5) */}
        <div className="bg-[#2a2a2a] border-t border-[#444] px-4 py-2.5 flex items-center justify-end space-x-2">
          <button
            onClick={handleSave}
            className="w-20 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium rounded shadow transition-colors"
          >
            OK
          </button>
          <button
            onClick={onClose}
            className="w-20 py-1 bg-[#444] hover:bg-[#555] text-slate-200 font-medium rounded border border-[#666] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => alert('GNOA Recording Suit Help')}
            className="w-20 py-1 bg-[#444] hover:bg-[#555] text-slate-200 font-medium rounded border border-[#666] transition-colors"
          >
            Help
          </button>
        </div>
      </div>
    </div>
  );
};
