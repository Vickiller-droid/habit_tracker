/**
 * Web Audio API synthesizer for clean, premium chiptune sounds.
 * Generates high-fidelity audio on the fly with zero network requests or assets.
 */

export const playSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First Note - G5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 (587.33Hz)
    
    // Short swell/fade envelope for tactile pop
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);
    
    // Second Note - B5 (Harmonic arpeggio, slightly delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    const startTime = ctx.currentTime + 0.06;
    osc2.frequency.setValueAtTime(783.99, startTime); // G5 (783.99Hz)
    
    // Exponential decay envelope for a gorgeous glass-like chime
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(startTime);
    osc2.stop(startTime + 0.25);
  } catch (e) {
    console.warn('Somatic audio chime playback failed:', e);
  }
};

/**
 * Play a clear, melodic notification alert sound when a habit window triggers.
 */
export const playNotificationAlertSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad chime
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  } catch (e) {
    console.warn('Notification alert sound failed:', e);
  }
};

/**
 * Play a gentle, minimalist countdown/pacing tick sound.
 */
export const playTickSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Gentle high frequency pluck
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Fail silently or log
  }
};

/**
 * Play ambient, soothing sound prompts for Inhale, Hold, Exhale, and Rest.
 */
export const playBreathPromptSound = (phase: 'inhale' | 'hold' | 'exhale' | 'rest') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle'; // Smoother tone
    
    if (phase === 'inhale') {
      // Gentle rising sweep
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 1.2);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    } else if (phase === 'hold') {
      // Soft holding note
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
    } else if (phase === 'exhale') {
      // Exhale: Gentle descending sweep
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(165, ctx.currentTime + 1.5);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 1.2);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    } else {
      // Rest: Soft low grounding tone
      osc.frequency.setValueAtTime(165, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch (e) {
    // Fail silently
  }
};

/**
 * Play a wonderful, sparkling success fanfare for the completed session.
 */
export const playBreathingCompleteSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a series of rising arpeggiated notes
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const startTime = ctx.currentTime + index * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });

    // Trigger celebration trumpet & claps along with the chime!
    playCelebrationTrumpetSound();
    playCelebrationClapSound();
  } catch (e) {
    // Fail silently
  }
};

/**
 * Synthesize a triumphant brass/trumpet fanfare sound effect using Web Audio API.
 */
export const playCelebrationTrumpetSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Triumphant trumpet fanfare sequence: G4, C5, E5, G5, high C6
    const sequence = [
      { freq: 392.00, time: 0.0,  duration: 0.12 }, // G4
      { freq: 523.25, time: 0.14, duration: 0.12 }, // C5
      { freq: 659.25, time: 0.28, duration: 0.12 }, // E5
      { freq: 783.99, time: 0.42, duration: 0.22 }, // G5
      { freq: 1046.50, time: 0.66, duration: 0.65, vibrato: true }, // C6 (Majestic climax)
    ];

    sequence.forEach(({ freq, time, duration, vibrato }) => {
      const startTime = ctx.currentTime + time;
      
      // Sawtooth wave for rich brass harmonics
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      // Optional vibrato on sustained high note
      if (vibrato) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(6.0, startTime); // 6 Hz vibrato
        lfoGain.gain.setValueAtTime(8.0, startTime);  // Depth
        lfo.connect(osc.frequency);
        lfo.start(startTime + 0.15);
        lfo.stop(startTime + duration);
      }

      // Lowpass BiquadFilter creates the dynamic "brass lip" bite
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(2.5, startTime);
      filter.frequency.setValueAtTime(600, startTime);
      filter.frequency.linearRampToValueAtTime(3200, startTime + 0.03); // Quick brass attack
      filter.frequency.exponentialRampToValueAtTime(1200, startTime + duration);

      // Volume Gain envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.setValueAtTime(0.10, startTime + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  } catch (e) {
    console.warn('Trumpet fanfare playback failed:', e);
  }
};

/**
 * Synthesize a realistic clapping / applause crowd effect using Web Audio API filtered noise bursts.
 */
export const playCelebrationClapSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Create a buffer of white noise for handclaps
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Timings for 14 handclaps simulating applause
    const clapTimings = [
      0.05, 0.18, 0.28, 0.36, 0.45, 0.53, 0.62, 0.72, 0.82, 0.94, 1.08, 1.22, 1.38, 1.55
    ];

    clapTimings.forEach((timing, index) => {
      const jitter = (Math.random() - 0.5) * 0.03;
      const startTime = ctx.currentTime + timing + jitter;

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass filter for handclap acoustic resonance
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      const centerFreq = 1200 + Math.random() * 600;
      bandpass.frequency.setValueAtTime(centerFreq, startTime);
      bandpass.Q.setValueAtTime(1.8 + Math.random() * 0.8, startTime);

      // Highpass filter to trim low end
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(600, startTime);

      // Gain envelope
      const gain = ctx.createGain();
      const volumeBase = index < 8 ? 0.08 + (index * 0.01) : 0.14 - ((index - 8) * 0.015);
      const volume = Math.max(0.02, volumeBase + (Math.random() - 0.5) * 0.03);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.06);

      whiteNoise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(startTime);
      whiteNoise.stop(startTime + 0.07);
    });
  } catch (e) {
    console.warn('Clap applause playback failed:', e);
  }
};

/**
 * Trigger both celebration trumpet fanfare and clapping applause simultaneously,
 * accompanied by a visual particle splash.
 */
export const playCelebrationFanfareAndClaps = () => {
  playCelebrationTrumpetSound();
  playCelebrationClapSound();

  try {
    const splashEvent = new CustomEvent('somatic-dopamine-splash', {
      detail: { x: window.innerWidth / 2, y: window.innerHeight / 3, pCount: 65 }
    });
    window.dispatchEvent(splashEvent);
  } catch (e) {
    // Suppress
  }
};

