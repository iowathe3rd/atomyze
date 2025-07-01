/**
 * Core types and interfaces for Particle Weaver library
 * 
 * CODE REVIEW NOTES:
 * ✅ Good: Comprehensive type definitions
 * ✅ Good: Optional properties with sensible defaults
 * ✅ Good: Clear documentation for each property
 * ⚠️  ISSUE: Missing validation constraints in type definitions
 * ⚠️  ISSUE: No union types for specific value ranges
 * ⚠️  ISSUE: Consider branded types for better type safety
 * 
 * TYPE SAFETY IMPROVEMENTS NEEDED:
 * - Add number range constraints (e.g., opacity: 0-1)
 * - Add enum types for predefined values
 * - Add branded types for IDs and URLs
 */

import * as THREE from 'three'

/**
 * Configuration options for ParticleWeaver instance
 * 
 * REVIEW: Consider making target required in constructor, optional elsewhere
 * REVIEW: Add validation helpers for each option group
 */
export interface ParticleWeaverOptions {
  /** Target DOM element to attach the canvas */
  target: HTMLElement
  
  /** Camera configuration */
  camera?: {
    /** Field of view in degrees (REVIEW: should be 1-179) */
    fov?: number
    /** Near clipping plane (REVIEW: must be > 0) */
    near?: number
    /** Far clipping plane (REVIEW: must be > near) */
    far?: number
    /** Initial position (REVIEW: consider using tuple type) */
    position?: THREE.Vector3
  }
  
  /** Renderer configuration */
  renderer?: {
    /** Enable antialias (REVIEW: impacts performance on mobile) */
    antialias?: boolean
    /** Background color (REVIEW: consider THREE.Color type) */
    backgroundColor?: number
    /** Alpha channel (REVIEW: affects blending behavior) */
    alpha?: boolean
  }
  
  /** Shape generation options (REVIEW: mutually exclusive with model) */
  shape?: ShapeOptions
  
  /** 3D Model loading options (REVIEW: mutually exclusive with shape) */
  model?: ModelOptions
  
  /** Particle appearance configuration */
  particle?: ParticleOptions
  
  /** Forces and behaviors (REVIEW: not yet implemented) */
  forces?: ForceOptions[]
}

/**
 * Shape generation options
 */
export interface ShapeOptions {
  /** Type of shape to generate */
  type: 'sphere' | 'cube' | 'torus' | 'cylinder' | 'plane'
  
  /** Number of particles to generate */
  count?: number
  
  /** Shape-specific parameters */
  params?: {
    /** Radius for sphere, torus */
    radius?: number
    /** Width, height, depth for cube */
    width?: number
    height?: number
    depth?: number
    /** Tube radius for torus */
    tubeRadius?: number
    /** Segments for curved shapes */
    segments?: number
  }
}

/**
 * 3D Model loading options
 */
export interface ModelOptions {
  /** URL to the 3D model file (glTF/GLB) */
  url: string
  
  /** Scale factor for the model */
  scale?: number
  
  /** Number of particles to generate (if different from vertex count) */
  particleCount?: number
}

/**
 * Particle appearance configuration
 */
export interface ParticleOptions {
  /** Base size of particles */
  size?: number
  
  /** Base color of particles */
  color?: THREE.Color | string | number
  
  /** Opacity/transparency */
  opacity?: number
  
  /** Texture for particles */
  texture?: THREE.Texture | string
  
  /** Size variation range */
  sizeVariation?: number
  
  /** Color variation */
  colorVariation?: number
  
  /** Particle shape type */
  particleShape?: 'soft' | 'sharp' | 'square'
  
  /** Animation options */
  animated?: boolean
  animationSpeed?: number
  animationRadius?: number
  
  /** Connection options */
  connected?: boolean
  connectionDistance?: number
  connectionOpacity?: number
  connectionColor?: THREE.Color | string | number
  
  /** Interactivity options */
  interactive?: boolean
  mouseInfluence?: number
  mouseRadius?: number
}

/**
 * Force/behavior configuration
 */
export interface ForceOptions {
  /** Type of force */
  type: 'gravity' | 'wind' | 'vortex' | 'mouse' | 'random'
  
  /** Force strength */
  strength?: number
  
  /** Force-specific parameters */
  params?: Record<string, any>
}

/**
 * Particle system data structure
 */
export interface ParticleData {
  /** Original positions */
  originalPositions: Float32Array
  
  /** Current positions */
  positions: Float32Array
  
  /** Velocities */
  velocities: Float32Array
  
  /** Colors */
  colors: Float32Array
  
  /** Sizes */
  sizes: Float32Array
  
  /** Number of particles */
  count: number
}

/**
 * Generator interface for creating particle positions
 */
export interface IParticleGenerator {
  /**
   * Generate particle positions based on configuration
   * Can be synchronous or asynchronous depending on the generator
   */
  generate(options: any): Float32Array | Promise<Float32Array>
}

/**
 * Behavior interface for particle forces and animations
 */
export interface IBehavior {
  /**
   * Update particle data based on this behavior
   */
  update(data: ParticleData, deltaTime: number): void
}
