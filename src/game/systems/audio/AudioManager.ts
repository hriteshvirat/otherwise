// ============================================================
// OTHERWISE — Audio Manager
// Procedural audio with regional ambient synthesizer soundscapes for all 4 Regions
// ============================================================
import Phaser from 'phaser';

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export class AudioManager {
  private scene: Phaser.Scene;
  private settings: AudioSettings = {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    muted: false,
  };

  private audioContext: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicIntervalId: number | null = null;
  private currentRegion: string = 'meadow';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadSettings();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    } catch {
      console.warn('AudioContext not available');
    }
  }

  /** Start ambient regional music */
  startMusic(region: string = 'meadow'): void {
    this.currentRegion = region;
    if (this.isMusicPlaying) {
      this.stopMusic();
    }
    this.isMusicPlaying = true;

    // Scales per region
    let scale: number[];
    let noteInterval = 1800;
    let baseWave: OscillatorType = 'sine';
    let filterCutoff = 800;

    switch (region) {
      case 'woods':
        // C minor dark moody tones
        scale = [130.81, 155.56, 196.00, 233.08, 261.63, 311.13];
        noteInterval = 2100;
        baseWave = 'triangle';
        filterCutoff = 550;
        break;
      case 'ruins':
        // A minor / Dorian mechanical cadence
        scale = [110.00, 146.83, 164.81, 220.00, 293.66, 329.63, 440.00];
        noteInterval = 1400;
        baseWave = 'sawtooth';
        filterCutoff = 650;
        break;
      case 'mountains':
        // E ethereal lydian / dream harmonics
        scale = [164.81, 207.65, 246.94, 329.63, 415.30, 493.88, 659.25];
        noteInterval = 2200;
        baseWave = 'sine';
        filterCutoff = 1200;
        break;
      case 'meadow':
      default:
        // D minor pentatonic warm nostalgic chords
        scale = [146.83, 174.61, 220.00, 261.63, 293.66, 349.23, 440.00];
        noteInterval = 1800;
        baseWave = 'sine';
        filterCutoff = 800;
        break;
    }

    let noteIndex = 0;

    const playAmbientNote = () => {
      if (!this.isMusicPlaying || !this.audioContext || this.settings.muted) return;
      const vol = this.settings.masterVolume * this.settings.musicVolume;
      if (vol <= 0) return;

      const freq = scale[noteIndex % scale.length];
      noteIndex = (noteIndex + 1 + Math.floor(Math.random() * 2)) % scale.length;

      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = baseWave;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, ctx.currentTime);

      const duration = 2.4 + Math.random() * 1.4;
      const noteVol = vol * (baseWave === 'sawtooth' ? 0.05 : 0.12);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(noteVol, ctx.currentTime + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.05);
    };

    this.musicIntervalId = window.setInterval(playAmbientNote, noteInterval);
    playAmbientNote();
  }

  /** Stop music */
  stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  /** Play procedural sound effects */
  playSfx(name: string): void {
    if (this.settings.muted || !this.audioContext) return;
    const volume = this.settings.masterVolume * this.settings.sfxVolume;
    if (volume <= 0) return;

    try {
      switch (name) {
        case 'jump': this.playTone(440, 0.08, 'sine', volume * 0.3, 600); break;
        case 'land': this.playNoise(0.05, volume * 0.2); break;
        case 'interact': this.playTone(523, 0.1, 'sine', volume * 0.3, 660); break;
        case 'concept_applied': this.playChime([523, 659, 784], volume * 0.25); break;
        case 'concept_fear': this.playTone(220, 0.15, 'sawtooth', volume * 0.15); break;
        case 'concept_lonely': this.playTone(330, 0.2, 'sine', volume * 0.2, 294); break;
        case 'concept_curious': this.playChime([440, 554, 659], volume * 0.2); break;
        case 'puzzle_success': this.playChime([523, 659, 784, 1047], volume * 0.35); break;
        case 'ui_click': this.playTone(880, 0.03, 'sine', volume * 0.15); break;
        case 'ui_hover': this.playTone(660, 0.02, 'sine', volume * 0.08); break;
        case 'death': this.playTone(200, 0.3, 'sawtooth', volume * 0.2, 80); break;
        case 'discovery': this.playChime([392, 494, 587, 784], volume * 0.3); break;
        case 'collect': this.playTone(880, 0.1, 'sine', volume * 0.25, 1100); break;
        case 'switch': this.playTone(350, 0.06, 'triangle', volume * 0.25, 520); break;
      }
    } catch {
      // Audio fallback safe
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    endFreq?: number
  ): void {
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq) {
      osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.01);
  }

  private playChime(frequencies: number[], volume: number): void {
    if (!this.audioContext) return;
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', volume * (1 - i * 0.15));
      }, i * 80);
    });
  }

  private playNoise(duration: number, volume: number): void {
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  setMasterVolume(v: number): void { this.settings.masterVolume = v; this.saveSettings(); }
  setMusicVolume(v: number): void { this.settings.musicVolume = v; this.saveSettings(); }
  setSfxVolume(v: number): void { this.settings.sfxVolume = v; this.saveSettings(); }
  setMuted(m: boolean): void { this.settings.muted = m; this.saveSettings(); }
  toggleMute(): void { this.settings.muted = !this.settings.muted; this.saveSettings(); }
  getSettings(): AudioSettings { return { ...this.settings }; }

  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private saveSettings(): void {
    localStorage.setItem('otherwise_audio', JSON.stringify(this.settings));
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('otherwise_audio');
    if (saved) {
      try {
        Object.assign(this.settings, JSON.parse(saved));
      } catch {}
    }
  }
}
