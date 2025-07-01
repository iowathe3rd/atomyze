/**
 * Particle Weaver - A powerful TypeScript library for creating, animating and interacting with particle clouds
 * 
 * @fileoverview Main entry point for the Particle Weaver library
 * @version 0.1.0
 * @author iowathe3rd (bbeglerov@icloud.com)
 * @license MIT
 * 
 * @example
 * ```typescript
 * import { ParticleWeaver } from 'particle-weaver'
 * 
 * const weaver = new ParticleWeaver({
 *   target: document.getElementById('container'),
 *   shape: {
 *     type: 'sphere',
 *     count: 5000,
 *     params: { radius: 2 }
 *   },
 *   particle: {
 *     size: 1,
 *     color: '#4fc3f7',
 *     animated: true,
 *     connected: true
 *   }
 * })
 * ```
 */

// Core exports - main classes for library users
export { ParticleSystem } from './core/ParticleSystem'
export { ParticleWeaver } from './core/ParticleWeaver'

// Generator exports - for creating custom particle distributions
export { ModelGenerator } from './generators/ModelGenerator'
export { SphereGenerator } from './generators/SphereGenerator'

// Type exports - for TypeScript users
export type {
    ForceOptions, IBehavior, IParticleGenerator, ModelOptions,
    ParticleData, ParticleOptions, ParticleWeaverOptions, ShapeOptions
} from './types'

// Library metadata
export const VERSION = '0.1.0'
export const AUTHOR = 'iowathe3rd'

/**
 * Default configuration values used throughout the library
 */
export const DEFAULTS = {
  /** Default particle count for shapes */
  PARTICLE_COUNT: 5000,
  /** Default particle size */
  PARTICLE_SIZE: 1.0,
  /** Default particle color */
  PARTICLE_COLOR: '#4fc3f7',
  /** Default particle opacity */
  PARTICLE_OPACITY: 0.8,
  /** Default camera position */
  CAMERA_POSITION: { x: 0, y: 0, z: 8 },
  /** Default sphere radius */
  SPHERE_RADIUS: 2.0,
  /** Default animation speed */
  ANIMATION_SPEED: 1.0,
  /** Default connection distance */
  CONNECTION_DISTANCE: 1.0,
  /** Default connection opacity */
  CONNECTION_OPACITY: 0.3,
  /** Maximum particles for performance */
  MAX_PARTICLES: 15000
} as const

// Default export for convenience
export { ParticleWeaver as default } from './core/ParticleWeaver'
