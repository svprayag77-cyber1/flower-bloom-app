# 🌸 Enchanted Bloom Canvas

An interactive, generative botanical web canvas where flowers bloom, vines curl, and crystal chimes ring as your cursor sweeps across the screen.

![Preview](favicon.svg)

## ✨ Live Demo & Features

* **Interactive Cursor Blooming**: Moves or sweeps across the canvas sprout dynamic blossoming flowers.
* **Velocity Physics**: Fast sweeps trigger cascades of multi-layered petals and sparkling pollen explosions.
* **Botanical Vines & Leaves**: Organic quadratic Bézier curves connect floral trails with unfolding leafy stems.
* **Multiple Flower Species**: Sakura (Cherry Blossom), Lotus, Peony & Rose, Star Daisy, Cosmos Glow, and Radiant Sunflowers.
* **7 Color Themes**: Wildflower, Cherry Sakura, Sunset, Cosmic Aurora, Golden Sunburst, Neon Cyberpunk, and Lavender Mist.
* **Harmonic Web Audio Chimes**: Pentatonic bell chimes synthesized in real-time on bloom.
* **PWA (Progressive Web App)**: Installable directly on mobile (iOS/Android) and desktop browsers.
* **Snapshot Export**: One-click high-resolution PNG download.

## 🚀 Structure

```
├── index.html         # Application shell & interactive UI controls
├── flower-bloom.js    # Core BloomEngine animation & physics library
├── bloom-presets.js   # Color palettes, species geometries & sound scales
├── manifest.json      # PWA application manifest
└── favicon.svg        # Vector app icon
```

## 🛠️ Usage

Simply open `index.html` in any modern web browser or embed the engine:

```html
<script src="bloom-presets.js"></script>
<script src="flower-bloom.js"></script>

<canvas id="canvas"></canvas>
<script>
  const engine = new BloomEngine('#canvas', {
    palette: 'cherry',
    species: 'sakura',
    enableVines: true,
    enableSound: true
  });
</script>
```
