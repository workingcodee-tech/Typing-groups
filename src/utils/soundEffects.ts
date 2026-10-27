/**
 * Web Audio API synthesizer for mechanical keyboard switch sounds and race audio effects.
 * Zero external audio files required, instant latency-free feedback.
 */

export type SwitchSoundType = 'blue' | 'brown' | 'red' | 'thock' | 'off';

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundType: SwitchSoundType = 'thock';
  private volume: number = 0.4;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext restriction on mobile
    }
  }

  public setSoundType(type: SwitchSoundType) {
    this.soundType = type;
  }

  public getSoundType(): SwitchSoundType {
    return this.soundType;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public playKey(key: string, isSpace: boolean = false, isError: boolean = false) {
    if (this.soundType === 'off' || this.volume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (isError) {
      // Dull error buzz
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
      return;
    }

    // Spacebar has deeper resonance
    const freqMult = isSpace ? 0.7 : (1 + (Math.random() * 0.15 - 0.075));

    switch (this.soundType) {
      case 'blue': {
        // High click + tactile bottom out
        const osc = this.ctx.createOscillator();
        const clickOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650 * freqMult, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(2400 * freqMult, now);
        clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.015);

        gain.gain.setValueAtTime(this.volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        clickOsc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        clickOsc.start(now);
        osc.stop(now + 0.05);
        clickOsc.stop(now + 0.05);
        break;
      }

      case 'brown': {
        // Subtle tactile pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(420 * freqMult, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.035);

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'red': {
        // Smooth linear soft thump
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260 * freqMult, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
        break;
      }

      case 'thock':
      default: {
        // Deep acoustic creamy thock sound
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(280 * freqMult, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(540 * freqMult, now);
        osc2.frequency.exponentialRampToValueAtTime(110, now + 0.03);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(2, now);

        gain.gain.setValueAtTime(this.volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.06);
        osc2.stop(now + 0.06);
        break;
      }
    }
  }

  public playCountdown(count: number) {
    try {
      if (this.soundType === 'off' || this.volume <= 0) return;
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = count === 0 ? 880 : 440; // GO chime is higher pitch
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (count === 0 ? 0.35 : 0.15));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (count === 0 ? 0.35 : 0.15));
    } catch {
      // Audio playback fails gracefully without interrupting countdown
    }
  }

  public playFinish() {
    try {
      if (this.soundType === 'off' || this.volume <= 0) return;
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch {
      // Ignore finish sound errors
    }
  }
}

export const sounds = new SoundManager();
