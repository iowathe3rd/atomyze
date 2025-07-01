/**
 * Main ParticleWeaver class - the entry point for creating particle clouds
 * 
 * @version 0.1.0
 * @author iowathe3rd (bbeglerov@icloud.com)
 * @license MIT
 */

import * as THREE from 'three'
import { ParticleData, ParticleWeaverOptions } from '../types'

import { ModelGenerator } from '../generators/ModelGenerator'
import { SphereGenerator } from '../generators/SphereGenerator'
import { ParticleSystem } from './ParticleSystem'


/**
 * ParticleWeaver - Main class for creating and managing particle clouds
 * 
 * ARCHITECTURE NOTES:
 * - Uses composition pattern with ParticleSystem
 * - Implements proper resource management with dispose()
 * - Supports both sync (shapes) and async (models) particle generation
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Uses RAF for smooth 60fps animation
 * - GPU-accelerated rendering with WebGL
 * - Efficient buffer management for large particle counts
 * 
 * @example
 * ```typescript
 * const weaver = new ParticleWeaver({
 *   target: document.getElementById('canvas-container'),
 *   shape: { type: 'sphere', count: 5000 }
 * })
 * 
 * // Always call dispose when done to prevent memory leaks
 * weaver.dispose()
 * ```
 */
export class ParticleWeaver {
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private particleSystem: ParticleSystem | null = null
  private animationId: number | null = null
  private clock: THREE.Clock
  private readonly options: ParticleWeaverOptions
  
  // Animation and interaction
  private isDisposed: boolean = false
  private mouse = new THREE.Vector2()
  private isMouseTracking = false
  
  constructor(options: ParticleWeaverOptions) {
    this.validateOptions(options)
    this.options = this.mergeDefaultOptions(options)
    this.clock = new THREE.Clock()
    
    try {
      this.initScene()
      this.initCamera()
      this.initRenderer()
      this.setupEventListeners()
      
      // Start the render loop
      this.animate()
      
      // Initialize particles if configuration is provided
      if (this.options.shape) {
        this.createParticlesFromShape()
      } else if (this.options.model) {
        this.createParticlesFromModel()
      }
    } catch (error) {
      console.error('Failed to initialize ParticleWeaver:', error)
      throw new Error(`ParticleWeaver initialization failed: ${error}`)
    }
  }
  
  /**
   * Validate constructor options
   * REVIEW: Critical - prevents runtime errors from invalid inputs
   */
  private validateOptions(options: ParticleWeaverOptions): void {
    if (!options.target) {
      throw new Error('ParticleWeaver: target element is required')
    }
    
    if (!(options.target instanceof HTMLElement)) {
      throw new Error('ParticleWeaver: target must be a valid HTMLElement')
    }
    
    if (!options.target.clientWidth || !options.target.clientHeight) {
      console.warn('ParticleWeaver: target element has zero dimensions')
    }
    
    // REVIEW: Add WebGL capability detection
    if (!this.isWebGLSupported()) {
      throw new Error('ParticleWeaver: WebGL is not supported in this browser')
    }
  }
  
  /**
   * Check WebGL support
   * REVIEW: Essential for graceful degradation
   */
  private isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }
  
  /**
   * Merge user options with default values
   * REVIEW: Consider using deep merge for nested objects to prevent reference issues
   * REVIEW: Add validation for numeric ranges (fov: 1-179, near > 0, etc.)
   */
  private mergeDefaultOptions(options: ParticleWeaverOptions): ParticleWeaverOptions {
    // REVIEW: Validate camera parameters
    const cameraDefaults = {
      fov: 75, // REVIEW: Should be between 1-179 degrees
      near: 0.1, // REVIEW: Must be > 0
      far: 1000, // REVIEW: Must be > near
      position: new THREE.Vector3(0, 0, 5)
    }
    
    // REVIEW: Validate renderer parameters
    const rendererDefaults = {
      antialias: true, // REVIEW: May impact performance on mobile
      backgroundColor: 0x000000,
      alpha: false // REVIEW: Set to true if transparency needed
    }
    
    // REVIEW: Validate particle parameters
    const particleDefaults = {
      size: 1.0, // REVIEW: Should be > 0
      color: 0xffffff,
      opacity: 1.0, // REVIEW: Should be 0-1
      sizeVariation: 0.0, // REVIEW: Should be 0-1
      colorVariation: 0.0 // REVIEW: Should be 0-1
    }
    
    return {
      camera: { ...cameraDefaults, ...options.camera },
      renderer: { ...rendererDefaults, ...options.renderer },
      particle: { ...particleDefaults, ...options.particle },
      ...options
    }
  }
  
  /**
   * Initialize THREE.js scene
   */
  private initScene(): void {
    this.scene = new THREE.Scene()
  }
  
  /**
   * Initialize camera
   */
  private initCamera(): void {
    const { target } = this.options
    const { fov, near, far, position } = this.options.camera!
    
    const aspect = target.clientWidth / target.clientHeight
    this.camera = new THREE.PerspectiveCamera(fov!, aspect, near!, far!)
    this.camera.position.copy(position!)
  }
  
  /**
   * Initialize WebGL renderer
   */
  private initRenderer(): void {
    const { target } = this.options
    const { antialias, backgroundColor, alpha } = this.options.renderer!
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: antialias!,
      alpha: alpha!
    })
    
    this.renderer.setSize(target.clientWidth, target.clientHeight)
    this.renderer.setClearColor(backgroundColor!, alpha ? 0 : 1)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    target.appendChild(this.renderer.domElement)
    
    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this))
  }
  
  /**
   * Handle window resize
   */
  private handleResize(): void {
    const { target } = this.options
    
    this.camera.aspect = target.clientWidth / target.clientHeight
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(target.clientWidth, target.clientHeight)
  }
  
  /**
   * Create particles from shape configuration
   */
  private createParticlesFromShape(): void {
    if (!this.options.shape) return
    
    const generator = new SphereGenerator()
    const positions = generator.generate(this.options.shape)
    
    this.createParticleSystem(positions)
  }
  
  /**
   * Create particles from 3D model
   */
  private async createParticlesFromModel(): Promise<void> {
    if (!this.options.model) return
    
    try {
      const generator = new ModelGenerator()
      const positions = await generator.generate(this.options.model)
      
      this.createParticleSystem(positions)
    } catch (error) {
      console.error('Failed to load model:', error)
    }
  }
  
  /**
   * Create and initialize particle system
   * REVIEW: Add memory usage estimation for large particle counts
   * REVIEW: Consider progressive loading for very large datasets
   */
  private createParticleSystem(positions: Float32Array): void {
    const particleCount = positions.length / 3
    
    // REVIEW: Warn about performance implications for large particle counts
    if (particleCount > 50000) {
      console.warn(`ParticleWeaver: Large particle count (${particleCount}). Performance may be affected.`)
    }
    
    // REVIEW: Estimate memory usage
    const estimatedMemoryMB = (positions.length * 4 * 4) / (1024 * 1024) // 4 arrays × 4 bytes per float
    if (estimatedMemoryMB > 100) {
      console.warn(`ParticleWeaver: High memory usage estimated: ${estimatedMemoryMB.toFixed(1)}MB`)
    }
    
    // Create particle data structure
    const particleData: ParticleData = {
      originalPositions: positions.slice(), // REVIEW: Copy for morphing - doubles memory usage
      positions: positions,
      velocities: new Float32Array(positions.length), // REVIEW: Initialize to zero vectors
      colors: new Float32Array(particleCount * 3), // REVIEW: RGB format
      sizes: new Float32Array(particleCount), // REVIEW: Per-particle size
      count: particleCount
    }
    
    // Initialize colors and sizes
    this.initializeParticleProperties(particleData)
    
    // REVIEW: Wrap in try-catch for WebGL context errors
    try {
      // Ensure particle options are properly initialized
      const particleOptions = this.options.particle || {}
      this.particleSystem = new ParticleSystem(particleData, particleOptions)
      // Add particle system to scene
      const renderableObjects = this.particleSystem.getRenderableObjects()
      renderableObjects.forEach((obj: THREE.Object3D) => this.scene.add(obj))
    } catch (error) {
      console.error('Failed to create particle system:', error)
      throw new Error('WebGL context creation failed')
    }
  }
  
  /**
   * Initialize particle colors and sizes
   * REVIEW: Consider using workers for CPU-intensive initialization
   * REVIEW: Add deterministic random seed option for reproducible results
   */
  private initializeParticleProperties(data: ParticleData): void {
    const { color, size, colorVariation, sizeVariation } = this.options.particle!
    
    const baseColor = new THREE.Color(color!)
    
    // REVIEW: Use batch processing for large particle counts to avoid blocking
    const batchSize = 10000
    const processBatch = (startIndex: number, endIndex: number) => {
      for (let i = startIndex; i < endIndex; i++) {
        // Set colors
        const colorOffset = i * 3
        let particleColor = baseColor.clone()
        
        if (colorVariation! > 0) {
          // REVIEW: Use deterministic random for reproducible results
          particleColor = particleColor.offsetHSL(
            (Math.random() - 0.5) * colorVariation!,
            (Math.random() - 0.5) * colorVariation!,
            (Math.random() - 0.5) * colorVariation!
          )
        }
        
        data.colors[colorOffset] = particleColor.r
        data.colors[colorOffset + 1] = particleColor.g
        data.colors[colorOffset + 2] = particleColor.b
        
        // Set sizes - REVIEW: Clamp to prevent negative values
        data.sizes[i] = Math.max(0.01, size! + (Math.random() - 0.5) * sizeVariation!)
      }
    }
    
    // REVIEW: Process in batches to prevent UI blocking
    if (data.count > batchSize) {
      for (let start = 0; start < data.count; start += batchSize) {
        const end = Math.min(start + batchSize, data.count)
        processBatch(start, end)
      }
    } else {
      processBatch(0, data.count)
    }
  }
  
  /**
   * Setup event listeners for interactivity
   */
  private setupEventListeners(): void {
    const canvas = this.renderer.domElement
    
    // Mouse move tracking
    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      this.mouse.x = event.clientX - rect.left
      this.mouse.y = event.clientY - rect.top
      this.isMouseTracking = true
    }
    
    const onMouseLeave = () => {
      this.isMouseTracking = false
    }
    
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    
    // Handle window resize
    const onResize = () => {
      const { target } = this.options
      const width = target.clientWidth
      const height = target.clientHeight
      
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    }
    
    window.addEventListener('resize', onResize)
  }
  
  /**
   * Main animation loop with enhanced interactivity
   */
  private animate(): void {
    if (this.isDisposed) return
    
    this.animationId = requestAnimationFrame(this.animate.bind(this))
    
    const deltaTime = this.clock.getDelta()
    
    // Update particle system with mouse interaction
    if (this.particleSystem) {
      const mousePos = this.isMouseTracking ? this.mouse : undefined
      this.particleSystem.update(deltaTime, mousePos, this.camera)
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera)
  }
  
  /**
   * Get the Three.js scene (for advanced users)
   */
  public getScene(): THREE.Scene {
    return this.scene
  }
  
  /**
   * Get the camera (for advanced users)
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }
  
  /**
   * Get the renderer (for advanced users)
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }
  
  /**
   * Dispose of resources and stop animation
   */
  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    
    if (this.particleSystem) {
      this.particleSystem.dispose()
    }
    
    this.renderer.dispose()
    window.removeEventListener('resize', this.handleResize.bind(this))
    
    // Remove canvas from DOM
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
    }
  }
}
