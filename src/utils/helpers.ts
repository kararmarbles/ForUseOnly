import { AppSettings } from '../types';

export const defaultSettings: AppSettings = {
  // Video
  frameRate: 15, // 15 FPS default as requested
  loadLastSelection: true,
  applyGammaRamp: false,
  webcamDeviceId: '',
  webcamFormat: '1280 x 720 [16:9], 30.00 fps',
  stretchWidescreen: false,
  deinterlaceVideo: false,

  // Audio
  recordMicrophone: true,
  microphoneDeviceId: '',
  recordSpeakers: true, // System sound
  speakersDeviceId: 'MMDevice',
  recordMouseClicks: true,
  onlyShowDbDuringRecord: false,
  noiseReduction: false,
  soundRecordToneStart: false,
  soundRecordToneStop: false,
  soundRecordToneInterval: false,
  toneIntervalSeconds: 30,

  // Output
  outputFormat: 'mp4', // Default to MP4 version as requested
  warnLowDiskSpace: 300,
  overwriteOldRecordings: false,
  destinationFolder: 'D:\\Recordings',
  fileNamePrompt: false,
  fileNameFormat: '%autonumber%-%DD%-%MM%-%YYYY%',
  mirrorRecording: false,
  mirrorFolder: '',

  // Record
  limitMaxRecordingTime: true,
  maxRecordingTimeSeconds: 300, // 0:05:00 (5 minutes limit)
  onMaxTimeReached: 'continue', // Auto split & continue
  disablePreviewInScreenCapture: false,
  minimizeWhenRecording: true,
  minimizeToTray: false,
  quickStopFromTray: false,
  disablePlayVideoNotification: false,
  showCountdownTimer: false,
  countdownSeconds: 3,

  // Effects
  showWebcamOverlay: false,
  webcamOverlayPosition: 'bottom-right',
  webcamOverlaySize: 'medium',
  showTimestampWatermark: false,
  showTextCaption: false,
  textCaption: 'GNOA Recording Suit',
  showWatermark: true,
  cursorHighlight: true,

  // Other & Schedule
  runOnComputerStart: true,
  startRecordingAutomatically: false,
  autoStartDelaySeconds: 3,
  enableScheduledRecording: false,
  scheduledRecordingTime: '12:00',
  displayTaskbarNotification: true,
  showRecordingPreview: true,
};

export function formatTime(totalMs: number): string {
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis = totalMs % 1000;

  const h = hours.toString();
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');
  const ms = millis.toString().padStart(3, '0');

  return `${h}:${m}:${s}.${ms}`;
}

export function formatDurationSimple(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
