export class SoundManager {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playNoiseBurst(duration: number, filterFreq: number, volume = 0.14): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 1.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  public playStep(soundType: 'grass' | 'stone' | 'wood' | 'sand' | 'glass' | 'water'): void {
    const freqMap: Record<typeof soundType, number> = {
      grass: 420,
      sand: 550,
      wood: 310,
      stone: 680,
      glass: 1200,
      water: 280,
    };
    const jitter = (Math.random() - 0.5) * 80;
    this.playNoiseBurst(0.06, freqMap[soundType] + jitter, 0.06);
  }

  public playDig(soundType: 'grass' | 'stone' | 'wood' | 'sand' | 'glass' | 'water'): void {
    const freqMap: Record<typeof soundType, number> = {
      grass: 520,
      sand: 620,
      wood: 360,
      stone: 820,
      glass: 1450,
      water: 320,
    };
    this.playNoiseBurst(0.075, freqMap[soundType] + (Math.random() - 0.5) * 90, 0.11);
  }

  public playBreak(soundType: 'grass' | 'stone' | 'wood' | 'sand' | 'glass' | 'water'): void {
    const freqMap: Record<typeof soundType, number> = {
      grass: 480,
      sand: 580,
      wood: 340,
      stone: 760,
      glass: 1650,
      water: 300,
    };
    this.playNoiseBurst(0.16, freqMap[soundType], 0.22);
  }

  public playPlace(soundType: 'grass' | 'stone' | 'wood' | 'sand' | 'glass' | 'water'): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.playDig(soundType);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160 + Math.random() * 40, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(95, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.075);
  }

  public playPop(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  public playCraft(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = ctx.currentTime + idx * 0.055;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playFuse(): void {
    this.playNoiseBurst(0.6, 2200, 0.18);
  }

  public playExplosion(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.playNoiseBurst(0.65, 180, 0.42);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.55);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.56);
  }

  public playHurt(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  public playDoorToggle(open: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.playNoiseBurst(0.08, open ? 480 : 320, 0.14);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const startFreq = open ? 180 : 280;
    const endFreq = open ? 310 : 140;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.11);

    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  public playSlimeJump(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.26;

    // 1. 主果凍彈跳震盪音 (FM Vibrato Wobble：快速颤音模擬果凍Q彈晃動感)
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.exponentialRampToValueAtTime(275, now + 0.065);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(215, now + 0.20);
    osc.frequency.exponentialRampToValueAtTime(120, now + duration);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(28, now);
    lfoGain.gain.setValueAtTime(55, now);
    lfoGain.gain.exponentialRampToValueAtTime(8, now + duration);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    mainGain.gain.setValueAtTime(0.01, now);
    mainGain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(mainGain);
    mainGain.connect(ctx.destination);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + duration + 0.01);
    lfo.stop(now + duration + 0.01);

    // 2. 黏液濕潤擠壓濾波聲 (High-Q Bandpass Wet Squish)
    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const squishNoise = ctx.createBufferSource();
    squishNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(8.5, now);
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.exponentialRampToValueAtTime(1080, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.18);

    const squishGain = ctx.createGain();
    squishGain.gain.setValueAtTime(0.24, now);
    squishGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    squishNoise.connect(filter);
    filter.connect(squishGain);
    squishGain.connect(ctx.destination);
    squishNoise.start(now);

    // 3. 果凍氣泡回彈波啵聲 (Bubble Blip)
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(390, now + 0.055);
    popOsc.frequency.exponentialRampToValueAtTime(760, now + 0.125);
    popGain.gain.setValueAtTime(0.09, now + 0.055);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    popOsc.connect(popGain);
    popGain.connect(ctx.destination);
    popOsc.start(now + 0.055);
    popOsc.stop(now + 0.135);
  }
}
