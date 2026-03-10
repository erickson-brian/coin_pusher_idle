export type SfxEvent = "drop" | "boost" | "buy" | "prestige";

class SfxEngine {
  private ctx: AudioContext | null = null;

  private ensureContext(): AudioContext | null {
    if (this.ctx) {
      return this.ctx;
    }
    try {
      this.ctx = new AudioContext();
      return this.ctx;
    } catch {
      return null;
    }
  }

  play(event: SfxEvent, muted: boolean): void {
    if (muted) {
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    const freq =
      event === "drop"
        ? 290
        : event === "buy"
          ? 420
          : event === "boost"
            ? 530
            : 190;

    oscillator.type = event === "prestige" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.16);
  }
}

export const sfxEngine = new SfxEngine();
