(function () {
  "use strict";

  let enabled = true;
  let context = null;

  const PATTERNS = {
    correct: [
      [523.25, 0, 0.11],
      [659.25, 0.09, 0.13],
      [783.99, 0.2, 0.18],
    ],
    wrong: [
      [220, 0, 0.14],
      [164.81, 0.13, 0.22],
    ],
    complete: [
      [523.25, 0, 0.13],
      [659.25, 0.11, 0.13],
      [783.99, 0.22, 0.13],
      [1046.5, 0.34, 0.28],
    ],
  };

  function ensureContext() {
    if (!enabled) return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!context) context = new AudioContext();
    if (context.state === "suspended") context.resume().catch(() => {});
    return context;
  }

  function play(kind) {
    if (!enabled) return;
    const notes = PATTERNS[kind] || PATTERNS.correct;
    const audio = ensureContext();
    if (!audio) return;
    const start = audio.currentTime + 0.015;
    notes.forEach(([frequency, delay, duration]) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = kind === "wrong" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start + delay);
      gain.gain.setValueAtTime(0.0001, start + delay);
      gain.gain.exponentialRampToValueAtTime(kind === "wrong" ? 0.055 : 0.07, start + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + delay + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start + delay);
      oscillator.stop(start + delay + duration + 0.02);
    });
  }

  window.SoundFX = {
    play,
    setEnabled(value) {
      enabled = Boolean(value);
    },
    isEnabled() {
      return enabled;
    },
  };
})();
