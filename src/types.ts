export type OSType = 'windows' | 'macos';

export type ActiveTab = 'home' | 'effects' | 'options' | 'help' | 'suite';

export type CaptureSource = 'screen' | 'webcam' | 'device' | 'network';

export type ScreenSelectionMode = 'entire' | 'window' | 'rectangle';

export type RecordingState = 'idle' | 'countdown' | 'recording' | 'paused';

export interface AppSettings {
  // Video
  frameRate: number;
  loadLastSelection: boolean;
  applyGammaRamp: boolean;
  webcamDeviceId: string;
  webcamFormat: string;
  stretchWidescreen: boolean;
  deinterlaceVideo: boolean;
  
  // Audio
  recordMicrophone: boolean;
  microphoneDeviceId: string;
  recordSpeakers: boolean; // System audio / sound
  speakersDeviceId: string;
  recordMouseClicks: boolean;
  onlyShowDbDuringRecord: boolean;
  noiseReduction: boolean;
  soundRecordToneStart: boolean;
  soundRecordToneStop: boolean;
  soundRecordToneInterval: boolean;
  toneIntervalSeconds: number;

  // Output
  warnLowDiskSpace: number;
  overwriteOldRecordings: boolean;
  destinationFolder: string;
  fileNamePrompt: boolean;
  fileNameFormat: string;
  mirrorRecording: boolean;
  mirrorFolder: string;

  // Record
  limitMaxRecordingTime: boolean;
  maxRecordingTimeSeconds: number; // e.g., 1800 for 0:30:00
  onMaxTimeReached: 'stop' | 'continue';
  disablePreviewInScreenCapture: boolean;
  minimizeWhenRecording: boolean;
  minimizeToTray: boolean;
  quickStopFromTray: boolean;
  disablePlayVideoNotification: boolean;
  showCountdownTimer: boolean;
  countdownSeconds: number;

  // Effects
  showWebcamOverlay: boolean;
  webcamOverlayPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  webcamOverlaySize: 'small' | 'medium' | 'large';
  showTimestampWatermark: boolean;
  showTextCaption: boolean;
  textCaption: string;
  showWatermark: boolean;
  cursorHighlight: boolean;

  // Other / Startup
  runOnComputerStart: boolean;
  startRecordingAutomatically: boolean;
  displayTaskbarNotification: boolean;
  showRecordingPreview: boolean;
}

export interface RecordingItem {
  id: string;
  title: string;
  url: string;
  blob: Blob;
  date: string;
  durationSeconds: number;
  fileSizeFormatted: string;
  thumbnailUrl?: string;
  sourceType: CaptureSource;
  resolution: string;
}

export interface SnapshotItem {
  id: string;
  title: string;
  dataUrl: string;
  date: string;
  resolution: string;
}
