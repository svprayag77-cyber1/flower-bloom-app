/**
 * ============================================================================
 * FLOWER BLOOM CORE ENGINE (flower-bloom.js)
 * ============================================================================
 * Modular, production-ready canvas botanical animation library.
 * Provides independent systems for:
 *   1. Physics & Mouse Tracking (MouseTracker)
 *   2. Harmonic Audio Synthesis (AudioSynth)
 *   3. Botanical Vines & Leaves (StemSystem)
 *   4. Generative Flower Geometry & Blooming (FlowerSystem)
 *   5. Particle & Floating Petal Drift (ParticleSystem)
 *   6. High-DPI Canvas Rendering & Pipeline (BloomEngine)
 *
 * Can be loaded via <script src="flower-bloom.js"> or as an ES/CommonJS module.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./bloom-presets'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./bloom-presets'));
  } else {
    root.BloomEngine = factory(root.BloomPresets);
  }
}(typeof self !== 'undefined' ? self : this, function (Presets) {

  // Fallback defaults if presets not loaded first
  const DefaultPresets = Presets || {
    PALETTES: {},
    SPECIES: {},
    AUDIO_SCALES: { pentatonicMajor: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] },
    DEFAULTS: { palette: 'wildflower', species: 'random', enableVines: true, enableSound: false }
  };

  // --- MATH & EASING UTILITIES ---
  const MathUtils = {
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
    rand: (min, max) => min + Math.random() * (max - min),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    easeOutBack: (x) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
    easeOutCubic: (x) => 1 - Math.pow(1 - x, 3)
  };

  // ==========================================================================
  // SYSTEM 1: AUDIO SYNTHESIZER
  // ==========================================================================
  class AudioSynth {
    constructor(scale = 'pentatonicMajor') {
      this.ctx = null;
      this.scale = DefaultPresets.AUDIO_SCALES[scale] || DefaultPresets.AUDIO_SCALES.pentatonicMajor;
      this.enabled = false;
    }

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playBloomChime(speedRatio = 1) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const noteIndex = Math.floor(Math.random() * this.scale.length);
        const freq = this.scale[noteIndex];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + 0.35);

        const baseGain = 0.05 + Math.min(0.08, speedRatio * 0.05);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(baseGain, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.7);
      } catch (e) {
        // Safe fallback if audio context blocked by browser autoplay policy
      }
    }
  }

  // ==========================================================================
  // SYSTEM 2: BOTANICAL VINES & LEAVES (StemSystem)
  // ==========================================================================
  class Stem {
    constructor(startX, startY, endX, endY, color) {
      this.startX = startX;
      this.startY = startY;
      this.endX = endX;
      this.endY = endY;
      this.color = color;
      this.progress = 0;
      this.speed = MathUtils.rand(0.07, 0.12);

      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const normalX = -dy / dist;
      const normalY = dx / dist;
      const curveOffset = (Math.random() - 0.5) * Math.min(45, dist * 0.4);

      this.cpX = (startX + endX) / 2 + normalX * curveOffset;
      this.cpY = (startY + endY) / 2 + normalY * curveOffset;
      this.thickness = MathUtils.rand(1.6, 3.2);

      this.hasLeaf = Math.random() > 0.45;
      this.leafSide = Math.random() > 0.5 ? 1 : -1;
      this.leafProgress = MathUtils.rand(0.35, 0.7);
      this.leafSize = MathUtils.rand(8, 16);
      this.leafGrowth = 0;
    }

    update() {
      if (this.progress < 1) {
        this.progress = Math.min(1, this.progress + this.speed);
      }
      if (this.hasLeaf && this.progress >= this.leafProgress && this.leafGrowth < 1) {
        this.leafGrowth = Math.min(1, this.leafGrowth + 0.06);
      }
    }

    draw(ctx) {
      if (this.progress <= 0) return;

      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();

      const t = this.progress;
      const currentEndX = (1 - t) * (1 - t) * this.startX + 2 * (1 - t) * t * this.cpX + t * t * this.endX;
      const currentEndY = (1 - t) * (1 - t) * this.startY + 2 * (1 - t) * t * this.cpY + t * t * this.endY;

      ctx.moveTo(this.startX, this.startY);
      ctx.quadraticCurveTo(
        (1 - t) * this.startX + t * this.cpX,
        (1 - t) * this.startY + t * this.cpY,
        currentEndX,
        currentEndY
      );
      ctx.stroke();

      if (this.hasLeaf && this.leafGrowth > 0) {
        const lt = this.leafProgress;
        const lx = (1 - lt) * (1 - lt) * this.startX + 2 * (1 - lt) * lt * this.cpX + lt * lt * this.endX;
        const ly = (1 - lt) * (1 - lt) * this.startY + 2 * (1 - lt) * lt * this.cpY + lt * lt * this.endY;

        const tx = 2 * (1 - lt) * (this.cpX - this.startX) + 2 * lt * (this.endX - this.cpX);
        const ty = 2 * (1 - lt) * (this.cpY - this.startY) + 2 * lt * (this.endY - this.cpY);
        const angle = Math.atan2(ty, tx) + (Math.PI / 3) * this.leafSide;

        ctx.translate(lx, ly);
        ctx.rotate(angle);
        ctx.scale(this.leafGrowth, this.leafGrowth);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(this.leafSize * 0.5, -this.leafSize * 0.4, this.leafSize, -this.leafSize * 0.2, this.leafSize * 1.2, 0);
        ctx.bezierCurveTo(this.leafSize, this.leafSize * 0.2, this.leafSize * 0.5, this.leafSize * 0.4, 0, 0);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==========================================================================
  // SYSTEM 3: GENERATIVE FLOWER ENTITY (FlowerSystem)
  // ==========================================================================
  class Flower {
    constructor(x, y, palette, speciesName = 'random', speedRatio = 1, onShedPetal = null) {
      this.x = x;
      this.y = y;
      this.palette = palette;
      this.onShedPetal = onShedPetal;

      // Species configuration lookup
      const speciesList = Object.keys(DefaultPresets.SPECIES);
      const chosenSpecies = speciesName === 'random' ? MathUtils.pick(speciesList) : speciesName;
      this.spec = DefaultPresets.SPECIES[chosenSpecies] || DefaultPresets.SPECIES.sakura;

      // Sizing calculation
      const baseR = this.spec.baseRadius || 30;
      this.maxRadius = Math.min(65, baseR * (0.85 + Math.min(1.2, speedRatio * 0.35)));
      this.currentRadius = 0;

      // Lifecycle & animation
      this.growth = 0;
      this.growthSpeed = MathUtils.rand(0.025, 0.05);
      this.fullyBloomed = false;
      this.rotation = Math.random() * Math.PI * 2;
      this.spinRate = (Math.random() - 0.5) * (this.spec.spinSpeed || 0.005);
      this.wobblePhase = Math.random() * Math.PI * 2;

      // Colors
      this.petalColors = MathUtils.pick(palette.petals);
      this.centerColor = MathUtils.pick(palette.centers);
    }

    update() {
      if (this.growth < 1) {
        this.growth = Math.min(1, this.growth + this.growthSpeed);
        this.currentRadius = this.maxRadius * MathUtils.easeOutBack(this.growth);

        if (this.growth >= 1 && !this.fullyBloomed) {
          this.fullyBloomed = true;
          if (this.onShedPetal && Math.random() > 0.4) {
            this.onShedPetal(this.x, this.y, this.petalColors);
          }
        }
      }

      this.rotation += this.spinRate;
      this.wobblePhase += 0.03;
    }

    draw(ctx) {
      if (this.currentRadius <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      const sway = Math.sin(this.wobblePhase) * 0.05;
      ctx.rotate(this.rotation + sway);

      const r = this.currentRadius;
      const layers = this.spec.layers || 1;

      // Draw layers of petals
      for (let layer = 0; layer < layers; layer++) {
        const layerScale = 1 - layer * 0.22;
        const layerCount = Math.max(4, Math.floor(this.spec.petalCount * (1 - layer * 0.15)));
        const layerOffset = (layer * Math.PI) / layerCount;

        this.drawPetalLayer(ctx, r * layerScale, layerCount, layerOffset);
      }

      // Draw center disc & stamens
      this.drawCenter(ctx, r);

      ctx.restore();
    }

    drawPetalLayer(ctx, radius, count, angleOffset) {
      const angleStep = (Math.PI * 2) / count;
      const c1 = this.petalColors[0];
      const c2 = this.petalColors[1] || c1;
      const c3 = this.petalColors[2] || '#ffffff';

      for (let i = 0; i < count; i++) {
        ctx.save();
        ctx.rotate(i * angleStep + angleOffset);

        const grad = ctx.createRadialGradient(0, radius * 0.2, 2, 0, radius * 0.7, radius);
        grad.addColorStop(0, c1);
        grad.addColorStop(0.65, c2);
        grad.addColorStop(1, c3);

        ctx.fillStyle = grad;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 0.7;

        ctx.beginPath();
        ctx.moveTo(0, 0);

        const pw = radius * (this.spec.petalRoundness || 0.5);
        const pl = radius;

        if (this.spec.hasNotch) {
          ctx.bezierCurveTo(-pw, pl * 0.35, -pw * 0.85, pl * 0.85, -pw * 0.25, pl);
          ctx.lineTo(0, pl * 0.88);
          ctx.lineTo(pw * 0.25, pl);
          ctx.bezierCurveTo(pw * 0.85, pl * 0.85, pw, pl * 0.35, 0, 0);
        } else {
          ctx.bezierCurveTo(-pw, pl * 0.35, -pw * 0.9, pl * 0.9, 0, pl);
          ctx.bezierCurveTo(pw * 0.9, pl * 0.9, pw, pl * 0.35, 0, 0);
        }

        ctx.fill();
        ctx.stroke();

        // Delicate vein
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 0.5;
        ctx.moveTo(0, radius * 0.15);
        ctx.lineTo(0, radius * 0.75);
        ctx.stroke();

        ctx.restore();
      }
    }

    drawCenter(ctx, radius) {
      const centerR = radius * (this.spec.centerRadiusRatio || 0.25);

      // Radial halo
      const halo = ctx.createRadialGradient(0, 0, centerR * 0.2, 0, 0, centerR * 2.2);
      halo.addColorStop(0, 'rgba(255, 240, 160, 0.5)');
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, centerR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = this.centerColor;
      ctx.beginPath();
      ctx.arc(0, 0, centerR, 0, Math.PI * 2);
      ctx.fill();

      // Stamens
      const stamens = 8;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < stamens; i++) {
        const a = (i * Math.PI * 2) / stamens;
        const sx = Math.cos(a) * (centerR * 0.65);
        const sy = Math.sin(a) * (centerR * 0.65);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ==========================================================================
  // SYSTEM 4: MASTER BLOOM ENGINE (Orchestrator)
  // ==========================================================================
  class BloomEngine {
    constructor(canvasSelectorOrElement, customConfig = {}) {
      this.canvas = typeof canvasSelectorOrElement === 'string'
        ? document.querySelector(canvasSelectorOrElement)
        : canvasSelectorOrElement;

      if (!this.canvas) {
        throw new Error(`[BloomEngine] Canvas element not found: ${canvasSelectorOrElement}`);
      }

      this.ctx = this.canvas.getContext('2d');
      this.config = Object.assign({}, DefaultPresets.DEFAULTS, customConfig);

      // Current active states
      this.palette = DefaultPresets.PALETTES[this.config.palette] || Object.values(DefaultPresets.PALETTES)[0];
      this.species = this.config.species;
      this.enableVines = this.config.enableVines;
      this.enableSound = this.config.enableSound;

      // Entities
      this.flowers = [];
      this.stems = [];
      this.particles = [];
      this.floatingPetals = [];

      // Mouse State
      this.mouse = {
        x: null,
        y: null,
        speed: 0,
        lastTime: 0
      };
      this.lastSpawnPoint = { x: 0, y: 0 };
      this.lastStemPoint = null;

      // Subsystems
      this.audio = new AudioSynth(this.config.audioScale);
      this.audio.enabled = this.enableSound;

      // Auto Demo
      this.isAutoDemo = false;
      this.autoAngle = 0;

      // Listeners & Lifecycle
      this._bindEvents();
      this.resize();
      this._startLoop();
    }

    // --- High DPI Resolution handler ---
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = window.devicePixelRatio || 1;
      this.width = rect.width || window.innerWidth;
      this.height = rect.height || window.innerHeight;

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }

    _bindEvents() {
      this._onResize = () => this.resize();
      window.addEventListener('resize', this._onResize);

      this._onMouseMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.handlePointer(e.clientX - rect.left, e.clientY - rect.top);
      };
      this.canvas.addEventListener('mousemove', this._onMouseMove);

      this._onTouchMove = (e) => {
        if (e.touches.length > 0) {
          const rect = this.canvas.getBoundingClientRect();
          this.handlePointer(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
        }
      };
      this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: true });

      this._onTouchStart = (e) => {
        if (e.touches.length > 0) {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.touches[0].clientX - rect.left;
          this.mouse.y = e.touches[0].clientY - rect.top;
          this.lastStemPoint = null;
        }
      };
      this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    }

    handlePointer(x, y) {
      const now = performance.now();
      const dt = Math.max(1, now - this.mouse.lastTime);
      const dx = x - (this.mouse.x ?? x);
      const dy = y - (this.mouse.y ?? y);
      const dist = Math.hypot(dx, dy);

      this.mouse.speed = (dist / dt) * 1000;
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.lastTime = now;

      // Dynamic spawn threshold based on velocity
      const cfg = this.config.sensitivity;
      const threshold = Math.max(cfg.minSpawnDist, cfg.maxSpawnDist - Math.min(38, this.mouse.speed * cfg.speedFactor));
      const distFromLast = Math.hypot(x - this.lastSpawnPoint.x, y - this.lastSpawnPoint.y);

      if (distFromLast >= threshold) {
        this.spawn(x, y, this.mouse.speed);
        this.lastSpawnPoint = { x, y };
      }
    }

    spawn(x, y, speed = 200) {
      const speedRatio = Math.min(3, speed / 300);

      // 1. Sprout stem if enabled
      if (this.enableVines) {
        if (this.lastStemPoint) {
          const stemDist = Math.hypot(x - this.lastStemPoint.x, y - this.lastStemPoint.y);
          if (stemDist < 180) {
            const stemColor = MathUtils.pick(this.palette.stemColors);
            this.stems.push(new Stem(this.lastStemPoint.x, this.lastStemPoint.y, x, y, stemColor));
            if (this.stems.length > this.config.maxStems) this.stems.shift();
          }
        }
        this.lastStemPoint = { x, y };
      }

      // 2. Sprout flower
      const flower = new Flower(
        x,
        y,
        this.palette,
        this.species,
        speedRatio,
        (px, py, colors) => this.spawnFloatingPetal(px, py, colors)
      );
      this.flowers.push(flower);

      // 3. Sprout pollen sparkle particles
      this.spawnSparkles(x, y, flower.petalColors);

      // 4. Play audio chime
      if (this.enableSound) {
        this.audio.playBloomChime(speedRatio);
      }

      // Capacity limits
      if (this.flowers.length > this.config.maxFlowers) {
        this.flowers.shift();
      }

      // Dispatch event
      if (typeof this.onBloom === 'function') {
        this.onBloom({ count: this.flowers.length, speed: Math.round(speed) });
      }
    }

    spawnSparkles(x, y, colors) {
      const count = MathUtils.rand(6, 12);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = MathUtils.rand(1.2, 3.5);
        this.particles.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          radius: MathUtils.rand(1.5, 3),
          color: MathUtils.pick(colors),
          alpha: 1,
          decay: MathUtils.rand(0.02, 0.04)
        });
      }
    }

    spawnFloatingPetal(x, y, colors) {
      if (this.floatingPetals.length >= this.config.maxPetals) return;
      this.floatingPetals.push({
        x: x + MathUtils.rand(-15, 15),
        y: y + MathUtils.rand(-15, 15),
        vx: MathUtils.rand(0.3, 0.9),
        vy: MathUtils.rand(0.2, 0.8),
        rotation: Math.random() * Math.PI * 2,
        vRot: MathUtils.rand(-0.04, 0.04),
        size: MathUtils.rand(7, 13),
        colors,
        alpha: 0.85,
        life: 1
      });
    }

    // --- MAIN RENDER PIPELINE ---
    _startLoop() {
      const render = (ts) => {
        this._animationFrame = requestAnimationFrame(render);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);

        // Background Gradient
        const grad = this.ctx.createRadialGradient(
          this.width / 2, this.height / 2, 40,
          this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8
        );
        grad.addColorStop(0, this.palette.backgroundGradient[0]);
        grad.addColorStop(1, this.palette.backgroundGradient[1]);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Auto Demo step
        if (this.isAutoDemo && this.width > 0) {
          this.autoAngle += 0.042;
          const rx = Math.min(this.width * 0.38, 380);
          const ry = Math.min(this.height * 0.35, 260);
          const ax = this.width / 2 + Math.sin(this.autoAngle) * rx + Math.cos(this.autoAngle * 2.3) * 50;
          const ay = this.height / 2 + Math.cos(this.autoAngle * 1.5) * ry + Math.sin(this.autoAngle * 3) * 35;
          this.handlePointer(ax, ay);
        }

        // Draw Stems
        for (let i = 0; i < this.stems.length; i++) {
          this.stems[i].update();
          this.stems[i].draw(this.ctx);
        }

        // Draw Flowers
        for (let i = 0; i < this.flowers.length; i++) {
          this.flowers[i].update();
          this.flowers[i].draw(this.ctx);
        }

        // Draw Floating Petals
        for (let i = this.floatingPetals.length - 1; i >= 0; i--) {
          const p = this.floatingPetals[i];
          p.x += p.vx + Math.sin(ts * 0.002 + i) * 0.5;
          p.y += p.vy;
          p.rotation += p.vRot;
          p.life -= 0.003;

          if (p.life <= 0 || p.y > this.height + 50 || p.x > this.width + 50) {
            this.floatingPetals.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.globalAlpha = p.life * p.alpha;
          this.ctx.fillStyle = p.colors[0];
          this.ctx.beginPath();
          this.ctx.moveTo(0, -p.size);
          this.ctx.quadraticCurveTo(p.size * 0.7, 0, 0, p.size);
          this.ctx.quadraticCurveTo(-p.size * 0.7, 0, 0, -p.size);
          this.ctx.fill();
          this.ctx.restore();
        }

        // Draw Sparkle Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const pt = this.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vx *= 0.94;
          pt.vy *= 0.94;
          pt.alpha -= pt.decay;

          if (pt.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.globalAlpha = pt.alpha;
          this.ctx.fillStyle = pt.color;
          this.ctx.shadowColor = pt.color;
          this.ctx.shadowBlur = 8;
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }

        // Smooth speed decay
        this.mouse.speed *= 0.92;
      };

      this._animationFrame = requestAnimationFrame(render);
    }

    // ========================================================================
    // PUBLIC API METHODS
    // ========================================================================
    setPalette(paletteKeyOrObject) {
      if (typeof paletteKeyOrObject === 'string') {
        const found = DefaultPresets.PALETTES[paletteKeyOrObject];
        if (found) this.palette = found;
      } else if (typeof paletteKeyOrObject === 'object') {
        this.palette = paletteKeyOrObject;
      }
    }

    setSpecies(speciesKey) {
      this.species = speciesKey;
    }

    setVines(enabled) {
      this.enableVines = !!enabled;
      this.lastStemPoint = null;
    }

    setSound(enabled) {
      this.enableSound = !!enabled;
      this.audio.enabled = this.enableSound;
      if (this.enableSound) {
        this.audio.init();
      }
    }

    toggleAutoDemo() {
      this.isAutoDemo = !this.isAutoDemo;
      if (this.isAutoDemo) {
        this.autoAngle = 0;
      }
      return this.isAutoDemo;
    }

    clear() {
      this.flowers.length = 0;
      this.stems.length = 0;
      this.particles.length = 0;
      this.floatingPetals.length = 0;
      this.lastStemPoint = null;
    }

    exportPNG(filename = `bloom-canvas-${Date.now()}.png`) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = this.canvas.toDataURL('image/png');
      link.click();
    }

    destroy() {
      if (this._animationFrame) {
        cancelAnimationFrame(this._animationFrame);
      }
      window.removeEventListener('resize', this._onResize);
      this.canvas.removeEventListener('mousemove', this._onMouseMove);
      this.canvas.removeEventListener('touchmove', this._onTouchMove);
      this.canvas.removeEventListener('touchstart', this._onTouchStart);
    }
  }

  // Attach Presets as static property for easy inspection
  BloomEngine.Presets = DefaultPresets;

  return BloomEngine;
}));
