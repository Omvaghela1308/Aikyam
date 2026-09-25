// Web Audio API Sound Synthesizer for Emergency Alarms & Industrial Telemetry

class SoundEffectsManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a high-priority loud dual-tone emergency alarm / siren
   */
  public playEmergencyAlarm(durationSeconds: number = 1.2) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      const now = ctx.currentTime;
      // Oscillate frequency like an emergency mine siren
      osc1.frequency.setValueAtTime(850, now);
      osc1.frequency.linearRampToValueAtTime(1200, now + 0.3);
      osc1.frequency.linearRampToValueAtTime(850, now + 0.6);
      osc1.frequency.linearRampToValueAtTime(1200, now + 0.9);
      osc1.frequency.linearRampToValueAtTime(850, now + durationSeconds);

      osc2.frequency.setValueAtTime(425, now);
      osc2.frequency.linearRampToValueAtTime(600, now + 0.3);
      osc2.frequency.linearRampToValueAtTime(425, now + 0.6);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSeconds);
      osc2.stop(now + durationSeconds);
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  /**
   * Plays warning pulses (shorter alert tone)
   */
  public playWarningBeep() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(650, now + i * 0.18);

        gain.gain.setValueAtTime(0.2, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.18 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.12);
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  /**
   * Plays a pleasant safety acknowledgment chime
   */
  public playAcknowledgeChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }
}

export const soundManager = new SoundEffectsManager();
