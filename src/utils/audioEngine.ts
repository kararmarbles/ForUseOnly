// Web Audio Engine for GNOA Recording Suit
// Handles mixing of Microphone + System Audio, VU metering, and signaling tones

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private systemSource: MediaStreamAudioSourceNode | null = null;
  private destination: MediaStreamAudioDestinationNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.destination = this.ctx.createMediaStreamDestination();
      const buffer = new ArrayBuffer(this.analyser.frequencyBinCount);
      this.dataArray = new Uint8Array(buffer);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public connectStreams(micStream?: MediaStream | null, systemStream?: MediaStream | null) {
    this.init();
    if (!this.ctx || !this.analyser || !this.destination) return;

    // Disconnect previous
    if (this.micSource) {
      try { this.micSource.disconnect(); } catch { /* ignore */ }
      this.micSource = null;
    }
    if (this.systemSource) {
      try { this.systemSource.disconnect(); } catch { /* ignore */ }
      this.systemSource = null;
    }

    if (micStream && micStream.getAudioTracks().length > 0) {
      try {
        this.micSource = this.ctx.createMediaStreamSource(micStream);
        this.micSource.connect(this.analyser);
        this.micSource.connect(this.destination);
      } catch (err) {
        console.warn('Could not connect mic audio:', err);
      }
    }

    if (systemStream && systemStream.getAudioTracks().length > 0) {
      try {
        this.systemSource = this.ctx.createMediaStreamSource(systemStream);
        this.systemSource.connect(this.analyser);
        this.systemSource.connect(this.destination);
      } catch (err) {
        console.warn('Could not connect system audio:', err);
      }
    }
  }

  public getMixedAudioTracks(): MediaStreamTrack[] {
    if (this.destination) {
      return this.destination.stream.getAudioTracks();
    }
    return [];
  }

  // Returns dB level from -42 dB to +12 dB
  public getDecibelLevel(): number {
    if (!this.analyser || !this.dataArray) return -42;
    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    if (avg === 0) return -42;

    // Map 0..255 to roughly -42 dB .. +6 dB
    const normalized = avg / 255;
    const db = -42 + normalized * 48; // -42 dB at zero to +6 dB at max
    return Math.min(6, Math.max(-42, Math.round(db)));
  }

  public playTone(freq = 880, duration = 0.12) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Tone play error:', e);
    }
  }

  public playClickSound() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // ignore
    }
  }

  public dispose() {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch { /* ignore */ }
      this.ctx = null;
    }
  }
}

export const audioEngine = new AudioEngine();
