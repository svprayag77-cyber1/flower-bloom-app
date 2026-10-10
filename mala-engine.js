/**
 * ============================================================================
 * MADURAI MULLA MALA GAME ENGINE (mala-engine.js)
 * ============================================================================
 * South Indian traditional flower garland weaving experience.
 *
 * Simulates:
 *   - Physics-based hanging white thread (nool / vazhanar) with catenary sag
 *   - Drag & drop flower interaction with physics and rotation
 *   - Authentic Madurai flowers (Malligai, Roja, Kanakambaram, Sevvanthi, Vadamalli, Tulsi)
 *   - Snap-to-rope knotting with dense garland stacking
 *   - Traditional Carnatic tanpura and ghungroo knot sound synthesis
 *   - Traditional hair plait / bun (Jada / Kondai) try-on overlay
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MalaGameEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // --- AUDIO SYNTHESIZER: TEMPLE BELLS & CARNATIC CHIMES ---
  class TempleSoundSynth {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      // Carnatic Mayamalavagowla / Shankarabharanam scale notes in Hz
      this.carnaticNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    }

    init() {
      if (!this.ctx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) this.ctx = new AudioClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Gentle tactile knot sound when flower binds to string
    playKnotSound() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        // 1. Crisp thread snap / pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const note = this.carnaticNotes[Math.floor(Math.random() * this.carnaticNotes.length)];
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note * 1.5, now);
        osc.frequency.exponentialRampToValueAtTime(note * 0.9, now + 0.12);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);

        // 2. Subtle ghungroo bell harmonic
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(note * 3, now);
        bellGain.gain.setValueAtTime(0.03, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        bellOsc.connect(bellGain);
        bellGain.connect(this.ctx.destination);
        bellOsc.start(now);
        bellOsc.stop(now + 0.5);
      } catch (e) {}
    }

    // Joyous temple bell fanfare when garland completes
    playCelebrationFanfare() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 1.3);
          } catch (e) {}
        }, idx * 120);
      });
    }
  }

  // --- PROCEDURAL FLOWER RENDERERS ---
  const FlowerArt = {
    // 1. Madurai Malligai (Jasmine Bud with green stem & calyx)
    drawJasmine(ctx, size) {
      ctx.save();
      // Green stem & calyx
      ctx.fillStyle = '#2d6a4f';
      ctx.beginPath();
      ctx.roundRect(-2, size * 0.2, 4, size * 0.5, 2);
      ctx.fill();

      // Calyx sepals
      ctx.fillStyle = '#40916c';
      ctx.beginPath();
      ctx.moveTo(-6, size * 0.2);
      ctx.lineTo(0, size * 0.05);
      ctx.lineTo(6, size * 0.2);
      ctx.lineTo(0, size * 0.3);
      ctx.closePath();
      ctx.fill();

      // Pearlescent white bud petals
      const grad = ctx.createLinearGradient(0, -size * 0.7, 0, size * 0.2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#fffdfa');
      grad.addColorStop(1, '#e8f5e9');

      ctx.fillStyle = grad;
      ctx.strokeStyle = 'rgba(180, 210, 190, 0.4)';
      ctx.lineWidth = 1;

      // Petal cluster whorl
      const angles = [-0.25, 0, 0.25];
      angles.forEach((ang) => {
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, size * 0.15);
        ctx.bezierCurveTo(-size * 0.35, -size * 0.1, -size * 0.25, -size * 0.7, 0, -size * 0.75);
        ctx.bezierCurveTo(size * 0.25, -size * 0.7, size * 0.35, -size * 0.1, 0, size * 0.15);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Central folded tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, size * 0.1);
      ctx.bezierCurveTo(-size * 0.15, -size * 0.2, -size * 0.1, -size * 0.8, 0, -size * 0.85);
      ctx.bezierCurveTo(size * 0.1, -size * 0.8, size * 0.15, -size * 0.2, 0, size * 0.1);
      ctx.fill();

      ctx.restore();
    },

    // 2. Paneer Roja (Traditional Temple Rose)
    drawRose(ctx, size) {
      ctx.save();
      const r = size * 0.75;
      const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      grad.addColorStop(0, '#ff1744');
      grad.addColorStop(0.5, '#d50032');
      grad.addColorStop(1, '#880e4f');

      ctx.fillStyle = grad;
      ctx.strokeStyle = 'rgba(255, 200, 220, 0.35)';
      ctx.lineWidth = 1;

      // Outer petals
      for (let i = 0; i < 7; i++) {
        const a = (i * Math.PI * 2) / 7;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.arc(0, r * 0.55, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Middle petal swirl
      ctx.fillStyle = '#e91e63';
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 + 0.3;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.arc(0, r * 0.32, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Center spiral rosette
      ctx.fillStyle = '#ff80ab';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Yellow pollen heart
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.09, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },

    // 3. Kanakambaram (Saffron Firecracker Flower)
    drawKanakambaram(ctx, size) {
      ctx.save();
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 0.8);
      grad.addColorStop(0, '#ffcc80');
      grad.addColorStop(0.35, '#ff6d00');
      grad.addColorStop(1, '#e65100');

      ctx.fillStyle = grad;
      ctx.strokeStyle = 'rgba(255, 240, 200, 0.4)';
      ctx.lineWidth = 0.8;

      // 4 flared asymmetrical fan petals
      const fanAngles = [-0.65, -0.22, 0.22, 0.65];
      fanAngles.forEach((ang) => {
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-size * 0.25, -size * 0.3, -size * 0.4, -size * 0.8, 0, -size * 0.85);
        ctx.bezierCurveTo(size * 0.4, -size * 0.8, size * 0.25, -size * 0.3, 0, 0);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Delicate pale center tube
      ctx.fillStyle = '#fff3e0';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // Green stalk
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.rect(-2, 0, 4, size * 0.35);
      ctx.fill();

      ctx.restore();
    },

    // 4. Sevvanthi / Marigold (Golden Temple Flower)
    drawSevvanthi(ctx, size) {
      ctx.save();
      const r = size * 0.72;
      const petalCount = 14;

      // Outer golden tier
      for (let i = 0; i < petalCount; i++) {
        const a = (i * Math.PI * 2) / petalCount;
        ctx.save();
        ctx.rotate(a);
        const grad = ctx.createLinearGradient(0, 0, 0, r);
        grad.addColorStop(0, '#ff8f00');
        grad.addColorStop(1, '#ffc107');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.25, r * 0.5, 0, r);
        ctx.quadraticCurveTo(-r * 0.25, r * 0.5, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      // Inner dense fluffy tier
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI * 2) / 10 + 0.2;
        ctx.save();
        ctx.rotate(a);
        ctx.fillStyle = '#ffe082';
        ctx.beginPath();
        ctx.arc(0, r * 0.4, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Core
      ctx.fillStyle = '#ff6f00';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },

    // 5. Vadamalli (Purple Globe Amaranth)
    drawVadamalli(ctx, size) {
      ctx.save();
      const r = size * 0.65;
      const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      grad.addColorStop(0, '#e040fb');
      grad.addColorStop(0.6, '#aa00ff');
      grad.addColorStop(1, '#4a148c');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Textured papery florets
      ctx.fillStyle = '#f3e5f5';
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12;
        const dist = r * 0.65;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Green stem
      ctx.fillStyle = '#388e3c';
      ctx.fillRect(-2, r * 0.4, 4, size * 0.35);

      ctx.restore();
    },

    // 6. Sacred Tulsi / Davanam Green Leaf Sprig
    drawTulsi(ctx, size) {
      ctx.save();
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.rect(-1.5, -size * 0.7, 3, size * 1.2);
      ctx.fill();

      const leaves = [-0.4, 0, 0.4];
      leaves.forEach((yOff, idx) => {
        const side = idx % 2 === 0 ? 1 : -1;
        ctx.save();
        ctx.translate(0, yOff * size);
        ctx.rotate(0.5 * side);

        const leafGrad = ctx.createLinearGradient(0, 0, size * 0.6 * side, 0);
        leafGrad.addColorStop(0, '#2e7d32');
        leafGrad.addColorStop(1, '#66bb6a');
        ctx.fillStyle = leafGrad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(size * 0.3 * side, -size * 0.2, size * 0.5 * side, -size * 0.1, size * 0.6 * side, 0);
        ctx.bezierCurveTo(size * 0.5 * side, size * 0.1, size * 0.3 * side, size * 0.2, 0, 0);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }
  };

  // Flower Definitions
  const FLOWER_TYPES = {
    jasmine: { id: 'jasmine', name: 'Madurai Malligai (Jasmine)', size: 28, draw: FlowerArt.drawJasmine },
    rose: { id: 'rose', name: 'Paneer Roja (Rose)', size: 34, draw: FlowerArt.drawRose },
    kanakambaram: { id: 'kanakambaram', name: 'Kanakambaram (Firecracker)', size: 30, draw: FlowerArt.drawKanakambaram },
    sevvanthi: { id: 'sevvanthi', name: 'Sevvanthi (Marigold)', size: 32, draw: FlowerArt.drawSevvanthi },
    vadamalli: { id: 'vadamalli', name: 'Vadamalli (Globe Amaranth)', size: 28, draw: FlowerArt.drawVadamalli },
    tulsi: { id: 'tulsi', name: 'Sacred Tulsi (Aromatic Green)', size: 26, draw: FlowerArt.drawTulsi }
  };

  // ==========================================================================
  // MAIN GAME ENGINE CLASS
  // ==========================================================================
  class MalaGameEngine {
    constructor(canvasSelector, options = {}) {
      this.canvas = typeof canvasSelector === 'string'
        ? document.querySelector(canvasSelector)
        : canvasSelector;

      if (!this.canvas) throw new Error('[MalaGame] Canvas not found');
      this.ctx = this.canvas.getContext('2d');
      this.sound = new TempleSoundSynth();

      // Game States
      this.looseFlowers = [];     // Flowers resting on brass tray / ground
      this.strungFlowers = [];    // Flowers woven onto the rope
      this.draggedFlower = null;  // Currently held flower
      this.dragOffset = { x: 0, y: 0 };
      this.sparkles = [];

      // Hanging Rope Config
      this.rope = {
        pinLeft: { x: 0, y: 0 },
        pinRight: { x: 0, y: 0 },
        sag: 90,                  // Natural sag in middle (increases with garland weight)
        thickness: 3.5,
        color: '#fdfbf7',
        border: 'rgba(210, 190, 160, 0.7)'
      };

      // Tray Config (The brass uruli / ground zone)
      this.trayHeight = 170;

      // Hair Plait Try-on overlay state
      this.hairMode = false;

      // High DPI & Events
      this._bindEvents();
      this.resize();
      this.spawnInitialGroundFlowers();
      this._startLoop();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = window.devicePixelRatio || 1;
      this.width = rect.width || window.innerWidth;
      this.height = rect.height || window.innerHeight;

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);

      // Position the rope pins across the upper canvas
      const marginX = Math.max(40, this.width * 0.12);
      this.rope.pinLeft = { x: marginX, y: 140 };
      this.rope.pinRight = { x: this.width - marginX, y: 140 };
    }

    // Mathematical curve calculation for hanging rope
    getRopePoint(t) {
      // Catenary approximation using parabolic quadratic curve
      const p1 = this.rope.pinLeft;
      const p2 = this.rope.pinRight;
      const midX = (p1.x + p2.x) / 2;
      // Extra sag as more flowers are woven!
      const totalSag = this.rope.sag + Math.min(110, this.strungFlowers.length * 2.2);
      const midY = (p1.y + p2.y) / 2 + totalSag;

      const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * midX + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * midY + t * t * p2.y;

      // Tangent angle
      const tx = 2 * (1 - t) * (midX - p1.x) + 2 * t * (p2.x - midX);
      const ty = 2 * (1 - t) * (midY - p1.y) + 2 * t * (p2.y - midY);
      const angle = Math.atan2(ty, tx);

      return { x, y, angle };
    }

    // Spawn loose flowers on the ground / brass tray
    spawnInitialGroundFlowers() {
      this.looseFlowers = [];
      const types = Object.keys(FLOWER_TYPES);
      const groundY = this.height - this.trayHeight + 35;

      // Fill with a lush bed of 40 loose flowers
      for (let i = 0; i < 40; i++) {
        const typeKey = types[i % types.length];
        const padding = 60;
        const x = padding + Math.random() * (this.width - padding * 2);
        const y = groundY + Math.random() * (this.trayHeight - 65);

        this.looseFlowers.push({
          id: Math.random().toString(36).substr(2, 9),
          type: typeKey,
          x,
          y,
          rotation: Math.random() * Math.PI * 2,
          scale: 0.95 + Math.random() * 0.15
        });
      }
    }

    // Refill a fresh handful of flowers onto the tray
    refillBasket(typeKey = null) {
      const types = typeKey ? [typeKey] : Object.keys(FLOWER_TYPES);
      const groundY = this.height - this.trayHeight + 35;
      for (let i = 0; i < 15; i++) {
        const chosen = types[Math.floor(Math.random() * types.length)];
        const x = 60 + Math.random() * (this.width - 120);
        const y = groundY + Math.random() * (this.trayHeight - 65);
        this.looseFlowers.push({
          id: Math.random().toString(36).substr(2, 9),
          type: chosen,
          x,
          y,
          rotation: Math.random() * Math.PI * 2,
          scale: 0.95 + Math.random() * 0.15
        });
      }
      this.sound.playKnotSound();
    }

    // --- INTERACTION & DRAG-AND-DROP ---
    _bindEvents() {
      this._onResize = () => this.resize();
      window.addEventListener('resize', this._onResize);

      const getPointerPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const handlePointerDown = (pos) => {
        // Find topmost loose flower clicked
        for (let i = this.looseFlowers.length - 1; i >= 0; i--) {
          const f = this.looseFlowers[i];
          const dist = Math.hypot(pos.x - f.x, pos.y - f.y);
          if (dist < 32) {
            this.draggedFlower = f;
            this.dragOffset = { x: f.x - pos.x, y: f.y - pos.y };
            this.looseFlowers.splice(i, 1);
            this.sound.init();
            return;
          }
        }
      };

      const handlePointerMove = (pos) => {
        if (this.draggedFlower) {
          this.draggedFlower.x = pos.x + this.dragOffset.x;
          this.draggedFlower.y = pos.y + this.dragOffset.y;
        }
      };

      const handlePointerUp = (pos) => {
        if (!this.draggedFlower) return;

        // Check if dragged near the hanging white rope
        const ropeLength = Math.hypot(this.rope.pinRight.x - this.rope.pinLeft.x, this.rope.pinRight.y - this.rope.pinLeft.y);
        let bestT = -1;
        let bestDist = 99999;

        // Sample along rope curve
        const samples = 60;
        for (let i = 0; i <= samples; i++) {
          const t = i / samples;
          const pt = this.getRopePoint(t);
          const d = Math.hypot(this.draggedFlower.x - pt.x, this.draggedFlower.y - pt.y);
          if (d < bestDist) {
            bestDist = d;
            bestT = t;
          }
        }

        // Snap threshold to rope
        if (bestDist < 60 && bestT >= 0.05 && bestT <= 0.95) {
          // Knot it onto the rope!
          const flowerDef = FLOWER_TYPES[this.draggedFlower.type];
          this.strungFlowers.push({
            id: this.draggedFlower.id,
            type: this.draggedFlower.type,
            t: bestT,
            side: (this.strungFlowers.length % 2 === 0 ? 1 : -1), // alternating dense bouquet weave
            angleOffset: (Math.random() - 0.5) * 0.2,
            scale: this.draggedFlower.scale
          });

          // Sort along rope for dense garland stacking
          this.strungFlowers.sort((a, b) => a.t - b.t);

          // Audio & sparkles
          this.sound.playKnotSound();
          this.spawnKnotSparkles(this.draggedFlower.x, this.draggedFlower.y);

          if (this.onFlowerStrung) {
            this.onFlowerStrung(this.strungFlowers.length);
          }
        } else {
          // Put back on ground/tray
          this.looseFlowers.push(this.draggedFlower);
        }

        this.draggedFlower = null;
      };

      this.canvas.addEventListener('mousedown', (e) => handlePointerDown(getPointerPos(e)));
      window.addEventListener('mousemove', (e) => handlePointerMove(getPointerPos(e)));
      window.addEventListener('mouseup', (e) => handlePointerUp(getPointerPos(e)));

      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePointerDown(getPointerPos(e));
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        handlePointerMove(getPointerPos(e));
      }, { passive: false });

      window.addEventListener('touchend', (e) => {
        handlePointerUp(getPointerPos(e));
      });
    }

    spawnKnotSparkles(x, y) {
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 3.5;
        this.sparkles.push({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          color: Math.random() > 0.5 ? '#ffd54f' : '#ffffff',
          alpha: 1,
          size: 2 + Math.random() * 2
        });
      }
    }

    // --- MAIN RENDER LOOP ---
    _startLoop() {
      const render = () => {
        this._animFrame = requestAnimationFrame(render);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);

        // 1. Temple Sanctum Warm Terracotta Background
        this.drawBackground();

        // 2. Hair Mode Overlay (If user is previewing on Kondai/Plait)
        if (this.hairMode) {
          this.drawHairSilhouette();
        }

        // 3. Brass Tray / Ground zone at bottom
        this.drawGroundTray();

        // 4. White Rope / Sacred Thread (Nool)
        this.drawRope();

        // 5. Knotted / Strung Flowers on the rope
        this.drawStrungFlowers();

        // 6. Loose Flowers on the Ground / Tray
        this.drawLooseFlowers();

        // 7. Dragged Flower under cursor with shadow
        if (this.draggedFlower) {
          this.drawDraggedFlower();
        }

        // 8. Sparkles
        this.drawSparkles();
      };
      this._animFrame = requestAnimationFrame(render);
    }

    drawBackground() {
      // Atmospheric warm temple sanctum lighting
      const grad = this.ctx.createRadialGradient(
        this.width / 2, 180, 50,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.75
      );
      grad.addColorStop(0, '#2b1b17');     // Warm bronze/terracotta temple core
      grad.addColorStop(0.5, '#180e0c');   // Temple stone brown
      grad.addColorStop(1, '#090504');     // Night sanctum
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Subtle South Indian Kolam / Diya ambient motifs in background
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.03)';
      this.ctx.beginPath();
      this.ctx.arc(this.width / 2, 180, 260, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    drawGroundTray() {
      const trayY = this.height - this.trayHeight;

      // Banana Leaf / Fresh Green Silk Mat
      const leafGrad = this.ctx.createLinearGradient(0, trayY, 0, this.height);
      leafGrad.addColorStop(0, '#1b3a24');
      leafGrad.addColorStop(0.3, '#244d30');
      leafGrad.addColorStop(1, '#14291a');
      this.ctx.fillStyle = leafGrad;
      this.ctx.fillRect(0, trayY, this.width, this.trayHeight);

      // Golden Brass Border Strip
      const goldGrad = this.ctx.createLinearGradient(0, 0, this.width, 0);
      goldGrad.addColorStop(0, '#b8860b');
      goldGrad.addColorStop(0.5, '#ffd700');
      goldGrad.addColorStop(1, '#b8860b');
      this.ctx.fillStyle = goldGrad;
      this.ctx.fillRect(0, trayY - 4, this.width, 4);

      // Banana Leaf rib lines
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = 1;
      for (let x = 30; x < this.width; x += 45) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, trayY);
        this.ctx.lineTo(x + 25, this.height);
        this.ctx.stroke();
      }

      // Title on the tray
      this.ctx.fillStyle = 'rgba(255, 240, 200, 0.4)';
      this.ctx.font = '500 12px -apple-system, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🍃 Fresh Temple Flowers Tray (Pick & Knot Onto the White Rope Above) 🍃', this.width / 2, trayY + 22);
    }

    drawRope() {
      // 1. Brass Fastening Pins on the sides
      this.drawBrassPin(this.rope.pinLeft.x, this.rope.pinLeft.y);
      this.drawBrassPin(this.rope.pinRight.x, this.rope.pinRight.y);

      // 2. Hanging Sacred White Thread (Nool / Banana Fiber Vazhanar)
      this.ctx.save();
      this.ctx.strokeStyle = this.rope.color;
      this.ctx.lineWidth = this.rope.thickness;
      this.ctx.lineCap = 'round';
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      this.ctx.shadowBlur = 6;

      const p1 = this.rope.pinLeft;
      const p2 = this.rope.pinRight;
      const midX = (p1.x + p2.x) / 2;
      const totalSag = this.rope.sag + Math.min(110, this.strungFlowers.length * 2.2);
      const midY = (p1.y + p2.y) / 2 + totalSag;

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
      this.ctx.stroke();

      // Delicate thread twisted texture
      this.ctx.strokeStyle = 'rgba(180, 160, 130, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      this.ctx.restore();
    }

    drawBrassPin(x, y) {
      this.ctx.save();
      // Brass hook
      const grad = this.ctx.createRadialGradient(x, y, 2, x, y, 12);
      grad.addColorStop(0, '#fff4b8');
      grad.addColorStop(0.5, '#e6b800');
      grad.addColorStop(1, '#8a6d00');

      this.ctx.fillStyle = grad;
      this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 9, 0, Math.PI * 2);
      this.ctx.fill();

      // Pin center rivet
      this.ctx.fillStyle = '#4d3d00';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    drawStrungFlowers() {
      // Draw garland flowers densely clustered along the rope
      for (let i = 0; i < this.strungFlowers.length; i++) {
        const item = this.strungFlowers[i];
        const pt = this.getRopePoint(item.t);
        const def = FLOWER_TYPES[item.type];
        if (!def) continue;

        this.ctx.save();
        // Offset perpendicular to thread for lush traditional layered garland look
        const perpX = -Math.sin(pt.angle) * (14 * item.side);
        const perpY = Math.cos(pt.angle) * (14 * item.side);

        this.ctx.translate(pt.x + perpX, pt.y + perpY);
        // Align naturally outward like traditional stringing
        this.ctx.rotate(pt.angle + (Math.PI / 2) * item.side + item.angleOffset);
        this.ctx.scale(item.scale, item.scale);

        // Soft drop shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowBlur = 7;
        this.ctx.shadowOffsetY = 3;

        def.draw(this.ctx, def.size);

        // Draw small tying knot thread over the flower stalk
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(0, def.size * 0.25, 4, 0, Math.PI);
        this.ctx.stroke();

        this.ctx.restore();
      }
    }

    drawLooseFlowers() {
      for (let i = 0; i < this.looseFlowers.length; i++) {
        const f = this.looseFlowers[i];
        const def = FLOWER_TYPES[f.type];
        if (!def) continue;

        this.ctx.save();
        this.ctx.translate(f.x, f.y);
        this.ctx.rotate(f.rotation);
        this.ctx.scale(f.scale, f.scale);

        // Shadow on tray
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetY = 3;

        def.draw(this.ctx, def.size);
        this.ctx.restore();
      }
    }

    drawDraggedFlower() {
      const def = FLOWER_TYPES[this.draggedFlower.type];
      if (!def) return;

      this.ctx.save();
      this.ctx.translate(this.draggedFlower.x, this.draggedFlower.y);
      this.ctx.scale(1.2, 1.2); // Slightly larger when picked up!

      // Lifted shadow
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      this.ctx.shadowBlur = 18;
      this.ctx.shadowOffsetY = 12;

      def.draw(this.ctx, def.size);

      // Snap aura when near the rope
      const ropeLength = Math.hypot(this.rope.pinRight.x - this.rope.pinLeft.x, this.rope.pinRight.y - this.rope.pinLeft.y);
      let bestDist = 999;
      for (let i = 0; i <= 30; i++) {
        const pt = this.getRopePoint(i / 30);
        const d = Math.hypot(this.draggedFlower.x - pt.x, this.draggedFlower.y - pt.y);
        if (d < bestDist) bestDist = d;
      }

      if (bestDist < 60) {
        this.ctx.strokeStyle = '#ffd54f';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, def.size * 1.1, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    drawHairSilhouette() {
      this.ctx.save();
      // Graceful traditional Kondai (Hair bun) outline
      const cx = this.width / 2;
      const cy = 200;

      // Dark silky hair bun
      const hairGrad = this.ctx.createRadialGradient(cx, cy - 20, 30, cx, cy, 140);
      hairGrad.addColorStop(0, '#1a0d0a');
      hairGrad.addColorStop(0.7, '#0d0605');
      hairGrad.addColorStop(1, '#050202');
      this.ctx.fillStyle = hairGrad;

      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy - 25, 110, 85, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Golden hair broach (Nethi Chutti / Rakodi) center jewel
      const jewelGrad = this.ctx.createRadialGradient(cx, cy - 30, 2, cx, cy - 30, 18);
      jewelGrad.addColorStop(0, '#ffe57f');
      jewelGrad.addColorStop(0.5, '#ffb300');
      jewelGrad.addColorStop(1, '#b71c1c');
      this.ctx.fillStyle = jewelGrad;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy - 30, 16, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawSparkles() {
      for (let i = this.sparkles.length - 1; i >= 0; i--) {
        const p = this.sparkles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;

        if (p.alpha <= 0) {
          this.sparkles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 6;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // --- PUBLIC ACTIONS ---
    clearGarland() {
      this.strungFlowers = [];
      this.spawnInitialGroundFlowers();
      this.sound.playKnotSound();
    }

    toggleHairMode() {
      this.hairMode = !this.hairMode;
      return this.hairMode;
    }

    celebrateComplete() {
      this.sound.playCelebrationFanfare();
      // Shower of 100 golden flower petals
      for (let i = 0; i < 90; i++) {
        this.sparkles.push({
          x: Math.random() * this.width,
          y: Math.random() * (this.height * 0.4),
          vx: (Math.random() - 0.5) * 3,
          vy: 2 + Math.random() * 4,
          color: Math.random() > 0.4 ? '#ff1744' : (Math.random() > 0.5 ? '#ffd54f' : '#ffffff'),
          alpha: 1,
          size: 3 + Math.random() * 4
        });
      }
    }

    exportPNG(filename = `madurai-mulla-mala-${Date.now()}.png`) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = this.canvas.toDataURL('image/png');
      link.click();
    }
  }

  return {
    MalaGameEngine,
    FLOWER_TYPES
  };
}));
