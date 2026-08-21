// ============================================================
// OTHERWISE — Audio Manager
// Procedural audio with volume controls, SFX, and atmospheric synth BGM
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

  // Web Audio context for procedural sounds
  private audioContext: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicIntervalId: number | null = null;
  private musicGainNode: GainNode | null = null;

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

  /** Start atmospheric background music loop */
  startMusic(): void {
    if (this.isMusicPlaying || !this.audioContext) return;
    this.isMusicPlaying = true;

    // D minor pentatonic chords & arpeggios
    // D3, F3, A3, C4, D4, F4, A4
    const scale = [146.83, 174.61, 220.00, 261.63, 293.66, 349.23, 440.00];
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

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const duration = 2.5 + Math.random() * 1.5;
      const noteVol = vol * 0.12;

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(noteVol, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.05);
    };

    // Trigger ambient note every ~1.8 seconds
    this.musicIntervalId = window.setInterval(playAmbientNote, 1800);
    playAmbientNote();
  }

  /** Stop background music */
  stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  /** Play a procedural sound effect */
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
        case 'puzzle_success': this.playChime([523, 659, 784, 1047], volume * 0.3); break;
        case 'ui_click': this.playTone(880, 0.03, 'sine', volume * 0.15); break;
        case 'ui_hover': this.playTone(660, 0.02, 'sine', volume * 0.08); break;
        case 'death': this.playTone(200, 0.3, 'sawtooth', volume * 0.2, 80); break;
        case 'discovery': this.playChime([392, 494, 587, 784], volume * 0.3); break;
        case 'collect': this.playTone(880, 0.1, 'sine', volume * 0.25, 1100); break;
        case 'switch': this.playTone(350, 0.06, 'triangle', volume * 0.25, 520); break;
      }
    } catch (e) {
      // Audio failures should never crash the game
    }
  }

  /** Play a single tone with optional pitch slide */
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

  /** Play a chime (sequence of tones) */
  private playChime(frequencies: number[], volume: number): void {
    if (!this.audioContext) return;
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', volume * (1 - i * 0.15));
      }, i * 80);
    });
  }

  /** Play short noise burst (landing, impact) */
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

    // Low-pass filter for softer sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  /** Update settings */
  setMasterVolume(v: number): void { this.settings.masterVolume = v; this.saveSettings(); }
  setMusicVolume(v: number): void { this.settings.musicVolume = v; this.saveSettings(); }
  setSfxVolume(v: number): void { this.settings.sfxVolume = v; this.saveSettings(); }
  setMuted(m: boolean): void { this.settings.muted = m; this.saveSettings(); }
  toggleMute(): void { this.settings.muted = !this.settings.muted; this.saveSettings(); }
  getSettings(): AudioSettings { return { ...this.settings }; }

  /** Resume audio context (required after user interaction) */
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
