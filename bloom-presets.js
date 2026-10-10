/**
 * ============================================================================
 * BLOOM CANVAS SYSTEM PRESETS & CONFIGURATION
 * ============================================================================
 * Central registry for color palettes, flower species geometry, and sound modes.
 * Edit this file to customize colors, species, and defaults without touching
 * the core engine logic.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BloomPresets = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // --- 1. COLOR PALETTES REGISTRY ---
  const PALETTES = {
    wildflower: {
      name: 'Wildflower Dream',
      backgroundGradient: ['#0d1424', '#060a12'],
      petals: [
        ['#ff4b8b', '#ff8da9', '#ffffff'],
        ['#9d4edd', '#e0aaff', '#ffffff'],
        ['#ff9e00', '#ffd166', '#ffffff'],
        ['#06d6a0', '#9bf6ff', '#ffffff'],
        ['#f72585', '#7209b7', '#ffd6ff']
      ],
      centers: ['#ffee32', '#ffd000', '#ffb703'],
      stemColors: ['#386641', '#2d6a4f', '#52b788'],
      sparkleGlow: '#ffb4db'
    },

    cherry: {
      name: 'Cherry Sakura',
      backgroundGradient: ['#170e17', '#090509'],
      petals: [
        ['#f72585', '#ff758f', '#ffccd5'],
        ['#ff4d6d', '#ff8fa3', '#fff0f3'],
        ['#c9184a', '#ff758f', '#ffffff'],
        ['#ffb3c6', '#ffe5ec', '#ffffff']
      ],
      centers: ['#ffb703', '#ffd166', '#fb8500'],
      stemColors: ['#402a2c', '#5e3036', '#4a4036'],
      sparkleGlow: '#ffd0df'
    },

    sunset: {
      name: 'Sunset Meadow',
      backgroundGradient: ['#1b0d1e', '#0b060d'],
      petals: [
        ['#ff5400', '#ff9e00', '#ffe6a7'],
        ['#f72585', '#b5179e', '#f72585'],
        ['#d81159', '#ff5400', '#ffdc5e'],
        ['#8f2d56', '#d81159', '#ffbc42']
      ],
      centers: ['#ffee32', '#ffbe0b', '#fb5607'],
      stemColors: ['#384c2f', '#465c36', '#2d3b24'],
      sparkleGlow: '#ffd480'
    },

    aurora: {
      name: 'Cosmic Aurora',
      backgroundGradient: ['#04121e', '#01060b'],
      petals: [
        ['#4cc9f0', '#72efdd', '#cbf3f0'],
        ['#4361ee', '#4cc9f0', '#caf0f8'],
        ['#3a0ca3', '#7209b7', '#f72585'],
        ['#06d6a0', '#2ec4b6', '#cbf3f0']
      ],
      centers: ['#bbf7d0', '#67e8f9', '#ffffff'],
      stemColors: ['#164e63', '#155e75', '#0f766e'],
      sparkleGlow: '#a5f3fc'
    },

    golden: {
      name: 'Golden Sunburst',
      backgroundGradient: ['#141108', '#080703'],
      petals: [
        ['#d4af37', '#f4d06f', '#fff3b0'],
        ['#ff9f1c', '#ffbf69', '#ffffff'],
        ['#e0a96d', '#ebc49f', '#fffcf2'],
        ['#ffbe0b', '#ffd166', '#fffae5']
      ],
      centers: ['#ff8800', '#cc5500', '#ffffff'],
      stemColors: ['#3e432e', '#4f5d2f', '#6b705c'],
      sparkleGlow: '#fef08a'
    },

    neonCyber: {
      name: 'Neon Cyberpunk',
      backgroundGradient: ['#0d021f', '#030008'],
      petals: [
        ['#ff007f', '#ff54b0', '#ffffff'],
        ['#00f0ff', '#70f8ff', '#ffffff'],
        ['#39ff14', '#a1ff8f', '#ffffff'],
        ['#ffe600', '#fff37a', '#ffffff']
      ],
      centers: ['#ff00ff', '#00ffff'],
      stemColors: ['#05ffa1', '#00f0ff'],
      sparkleGlow: '#00f0ff'
    },

    lavenderMist: {
      name: 'Lavender Mist',
      backgroundGradient: ['#100e1e', '#07060d'],
      petals: [
        ['#7b2cbf', '#9d4edd', '#e0aaff'],
        ['#5a189a', '#7b2cbf', '#c77dff'],
        ['#9d4edd', '#c77dff', '#ffffff']
      ],
      centers: ['#fde047', '#fed7aa'],
      stemColors: ['#2e4057', '#3f587a'],
      sparkleGlow: '#e9d5ff'
    }
  };

  // --- 2. BOTANICAL SPECIES GEOMETRY REGISTRY ---
  const SPECIES = {
    sakura: {
      name: 'Sakura (Cherry Blossom)',
      petalCount: 5,
      petalRoundness: 0.65,
      hasNotch: true,
      layers: 1,
      centerRadiusRatio: 0.22,
      baseRadius: 28,
      spinSpeed: 0.004
    },

    lotus: {
      name: 'Lotus Water-Lily',
      petalCount: 12,
      petalRoundness: 0.35,
      hasNotch: false,
      layers: 2,
      centerRadiusRatio: 0.26,
      baseRadius: 36,
      spinSpeed: 0.003
    },

    peony: {
      name: 'Peony & Rose',
      petalCount: 16,
      petalRoundness: 0.82,
      hasNotch: false,
      layers: 3,
      centerRadiusRatio: 0.28,
      baseRadius: 34,
      spinSpeed: 0.005
    },

    daisy: {
      name: 'Star Daisy',
      petalCount: 18,
      petalRoundness: 0.26,
      hasNotch: false,
      layers: 1,
      centerRadiusRatio: 0.35,
      baseRadius: 30,
      spinSpeed: 0.002
    },

    cosmos: {
      name: 'Cosmos Glow',
      petalCount: 8,
      petalRoundness: 0.52,
      hasNotch: true,
      layers: 1,
      centerRadiusRatio: 0.25,
      baseRadius: 30,
      spinSpeed: 0.003
    },

    sunflower: {
      name: 'Radiant Sunflower',
      petalCount: 22,
      petalRoundness: 0.30,
      hasNotch: false,
      layers: 2,
      centerRadiusRatio: 0.42,
      baseRadius: 38,
      spinSpeed: 0.002
    }
  };

  // --- 3. AUDIO TUNING PRESETS ---
  const AUDIO_SCALES = {
    pentatonicMajor: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00],
    pentatonicMinor: [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 622.25, 698.46, 783.99, 932.33],
    zenBell: [196.00, 246.94, 293.66, 392.00, 493.88, 587.33, 783.99]
  };

  // --- 4. ENGINE DEFAULT CONFIGURATION ---
  const DEFAULTS = {
    palette: 'wildflower',
    species: 'random',
    enableVines: true,
    enableSound: false,
    enableParticles: true,
    enablePetalDrift: true,
    audioScale: 'pentatonicMajor',
    maxFlowers: 180,
    maxStems: 200,
    maxParticles: 150,
    maxPetals: 60,
    sensitivity: {
      minSpawnDist: 22,
      maxSpawnDist: 60,
      speedFactor: 0.03
    }
  };

  return {
    PALETTES,
    SPECIES,
    AUDIO_SCALES,
    DEFAULTS
  };
}));
