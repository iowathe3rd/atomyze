# 🌟 Particle Weaver

A powerful, intuitive TypeScript library for creating, animating and interacting with particle clouds in 3D space using Three.js.

[![npm version](https://badge.fury.io/js/particle-weaver.svg)](https://badge.fury.io/js/particle-weaver)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

## ✨ Features

- 🎨 **Multiple Particle Shapes**: Soft, sharp, and square particle rendering
- 🔗 **Dynamic Connections**: Customizable connections between particles with color control
- 🎭 **3D Model Support**: Generate particles from glTF/GLB models
- 🌊 **Fluid Animations**: Floating particle animations with customizable parameters
- 🖱️ **Mouse Interaction**: Real-time particle response to mouse movement
- 📐 **Geometric Shapes**: Built-in generators for spheres, cubes, torus, and more
- 🎯 **TypeScript**: Full type safety and excellent IDE support
- ⚡ **Performance Optimized**: Efficient WebGL rendering with Three.js
- 🎛️ **Highly Configurable**: Extensive customization options

## 🚀 Quick Start

### Installation

```bash
npm install particle-weaver
```

### Basic Usage

```typescript
import { ParticleWeaver } from 'particle-weaver'

// Create a simple sphere of particles
const weaver = new ParticleWeaver({
  target: document.getElementById('canvas-container'),
  shape: {
    type: 'sphere',
    count: 5000,
    params: { radius: 2 }
  },
  particle: {
    size: 1.0,
    color: '#4fc3f7'
  }
})
```

### Loading 3D Models (Key Feature)

```typescript
// Generate particles from a 3D model
const weaver = new ParticleWeaver({
  target: document.getElementById('canvas-container'),
  model: {
    url: 'path/to/your/model.glb',
    scale: 1.0
  },
  particle: {
    size: 0.8,
    color: '#ff6b6b'
  }
})
```

## 📖 API Documentation

### ParticleWeaver Constructor

```typescript
new ParticleWeaver(options: ParticleWeaverOptions)
```

#### ParticleWeaverOptions

| Property | Type | Description |
|----------|------|-------------|
| `target` | `HTMLElement` | DOM element to attach the canvas |
| `shape?` | `ShapeOptions` | Shape generation configuration |
| `model?` | `ModelOptions` | 3D model loading configuration |
| `particle?` | `ParticleOptions` | Particle appearance settings |
| `camera?` | `CameraOptions` | Camera configuration |
| `renderer?` | `RendererOptions` | Renderer settings |

### Shape Generation

#### Sphere
```typescript
shape: {
  type: 'sphere',
  count: 5000,
  params: {
    radius: 2
  }
}
```

#### Cube
```typescript
shape: {
  type: 'cube',
  count: 5000,
  params: {
    width: 2,
    height: 2,
    depth: 2
  }
}
```

#### Torus
```typescript
shape: {
  type: 'torus',
  count: 5000,
  params: {
    radius: 2,
    tubeRadius: 0.5,
    segments: 32
  }
}
```

### 3D Model Loading

```typescript
model: {
  url: 'https://example.com/model.glb',
  scale: 1.0,
  particleCount: 10000 // Optional: resample to specific count
}
```

Supported formats:
- glTF (.gltf)
- Binary glTF (.glb)

### Particle Customization

```typescript
particle: {
  size: 1.0,           // Base particle size
  color: '#ffffff',    // Base color (hex, rgb, or THREE.Color)
  opacity: 1.0,        // Transparency (0-1)
  sizeVariation: 0.2,  // Size randomness (0-1)
  colorVariation: 0.1  // Color randomness (0-1)
}
```

### Methods

#### `getScene(): THREE.Scene`
Returns the Three.js scene for advanced manipulation.

#### `getCamera(): THREE.PerspectiveCamera`
Returns the camera instance.

#### `getRenderer(): THREE.WebGLRenderer`
Returns the WebGL renderer.

#### `dispose(): void`
Cleans up resources and stops the animation loop.

## 🎨 Examples

### Basic Sphere with Custom Colors

```typescript
const weaver = new ParticleWeaver({
  target: document.getElementById('container'),
  shape: { type: 'sphere', count: 3000 },
  particle: {
    size: 1.2,
    color: '#ff6b6b',
    sizeVariation: 0.3,
    colorVariation: 0.2
  }
})
```

### Loading a Character Model

```typescript
const weaver = new ParticleWeaver({
  target: document.getElementById('container'),
  model: {
    url: './assets/character.glb',
    scale: 2.0
  },
  particle: {
    size: 0.5,
    color: '#4ecdc4',
    opacity: 0.8
  },
  camera: {
    position: new THREE.Vector3(0, 2, 8)
  }
})
```

### Multiple Particle Systems

```typescript
// Create multiple particle systems
const sphere = new ParticleWeaver({
  target: container1,
  shape: { type: 'sphere', count: 2000 }
})

const cube = new ParticleWeaver({
  target: container2,
  shape: { type: 'cube', count: 3000 }
})
```

## 🔧 Advanced Usage

### Custom Camera Controls

```typescript
const weaver = new ParticleWeaver(options)
const camera = weaver.getCamera()

// Add orbit controls or custom camera movement
camera.position.set(0, 5, 10)
camera.lookAt(0, 0, 0)
```

### Accessing Three.js Scene

```typescript
const weaver = new ParticleWeaver(options)
const scene = weaver.getScene()

// Add additional objects to the scene
const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
scene.add(ambientLight)
```

## 🎯 Performance Tips

1. **Particle Count**: Start with 1000-5000 particles and adjust based on performance
2. **Model Complexity**: Simpler models with fewer vertices load faster
3. **Size Variation**: Use `sizeVariation` instead of individual particle sizes
4. **GPU Memory**: Monitor memory usage with large particle counts

## 🛠️ Development

### Building from Source

```bash
git clone https://github.com/your-org/particle-weaver
cd particle-weaver
npm install
npm run build
```

### Running the Demo

```bash
npm run dev
```

Open `demo.html` in your browser to see the interactive demo.

### Project Structure

```
src/
├── core/
│   ├── ParticleWeaver.ts      # Main class
│   └── ParticleSystem.ts      # Particle rendering system
├── generators/
│   ├── SphereGenerator.ts     # Sphere particle generation
│   ├── ModelGenerator.ts      # 3D model particle generation
│   └── ...                    # Other shape generators
├── types/
│   └── index.ts               # TypeScript definitions
└── index.ts                   # Main export file
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/)
- Inspired by various particle system libraries
- Thanks to all contributors and beta testers

## 📞 Support

- 📧 Email: support@particle-weaver.dev
- 💬 Discord: [Join our community](https://discord.gg/particle-weaver)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/particle-weaver/issues)

---

Made with ❤️ by [iowathe3rd](https://github.com/iowathe3rd)
