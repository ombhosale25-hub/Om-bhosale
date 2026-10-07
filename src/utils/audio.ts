// Web Audio API synthesizer for zero-dependency sound effects

let audioCtx: AudioContext | null = null;
let ambientGain: GainNode | null = null;
let ambientSource: AudioNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a gentle harmonic bell chime (perfect for break completion, focus start/stop)
 */
export function playHarmonicChime(type: 'success' | 'alert' | 'click' | 'break' = 'success') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      clickGain.gain.setValueAtTime(0.04, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(clickGain);
      clickGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    if (type === 'alert') {
      const freqs = [350, 420];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.08, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
      return;
    }

    // Peaceful meditative singing bowl / chime chord (C5, E5, G5, B5)
    const notes = type === 'break' ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      const noteStart = now + index * 0.08;
      gain.gain.setValueAtTime(0.07, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(noteStart);
      osc.stop(noteStart + 1.3);
    });
  } catch {
    // Audio context may be restricted by autoplay policy until user gesture
  }
}

/**
 * Toggle synthesized soothing pink noise / soft rain stream for focus mode
 */
export function toggleAmbientSound(enable: boolean) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!enable) {
      if (ambientSource) {
        try {
          ambientSource.disconnect();
        } catch {}
        ambientSource = null;
      }
      return;
    }

    if (ambientSource) return; // already active

    // Create 3 seconds looping buffer of low-pass filtered noise (rain / air ambience)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.1) * 0.12;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to soft rain sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.04, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    whiteNoise.start();
    ambientSource = whiteNoise;
  } catch {
    // Audio might fail in silent contexts
  }
}
