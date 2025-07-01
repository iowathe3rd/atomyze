/**
 * ParticleSystem - Enhanced system with animation, connections and interactivity
 */

import * as THREE from 'three'
import { ParticleData, ParticleOptions } from '../types'

export class ParticleSystem {
  public points!: THREE.Points
  public connections?: THREE.Line
  private geometry!: THREE.BufferGeometry
  private connectionGeometry?: THREE.BufferGeometry
  private material!: THREE.ShaderMaterial
  private connectionMaterial?: THREE.LineBasicMaterial
  private data: ParticleData
  private options: ParticleOptions
  
  // Animation properties
  private animatedPositions!: Float32Array
  private velocities!: Float32Array
  private time: number = 0
  
  // Mouse interaction
  private mouseInfluenceVector = new THREE.Vector3()
  
  constructor(data: ParticleData, options: ParticleOptions) {
    this.data = data
    this.options = {
      animated: false,
      animationSpeed: 1.0,
      animationRadius: 0.1,
      connected: false,
      connectionDistance: 1.0,
      connectionOpacity: 0.3,
      connectionColor: '#ffffff',
      interactive: false,
      mouseInfluence: 1.0,
      mouseRadius: 2.0,
      ...options
    }
    
    this.initAnimationData()
    this.initGeometry()
    this.initMaterial()
    this.initPoints()
    
    if (this.options.connected) {
      this.initConnections()
    }
  }
  
  /**
   * Initialize animation data
   */
  private initAnimationData(): void {
    const particleCount = this.data.count
    
    // Create animated positions copy
    this.animatedPositions = new Float32Array(this.data.positions)
    
    // Initialize random velocities for floating effect
    this.velocities = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i++) {
      this.velocities[i] = (Math.random() - 0.5) * 0.02
    }
  }
  
  /**
   * Initialize buffer geometry with particle data
   * REVIEW: Consider using instanced rendering for better performance with large counts
   * REVIEW: Add vertex attribute validation
   */
  private initGeometry(): void {
    this.geometry = new THREE.BufferGeometry()
    
    // REVIEW: Validate data arrays before creating attributes
    if (this.data.positions.length % 3 !== 0) {
      throw new Error('Position data must be divisible by 3 (x,y,z components)')
    }
    
    if (this.data.colors.length !== this.data.count * 3) {
      throw new Error('Color data length mismatch')
    }
    
    if (this.data.sizes.length !== this.data.count) {
      throw new Error('Size data length mismatch')
    }
    
    try {
      // Set position attribute - REVIEW: Most critical for rendering
      this.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(this.animatedPositions, 3)
      )
      
      // Set color attribute - REVIEW: RGB format, consider RGBA for transparency
      this.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(this.data.colors, 3)
      )
      
      // Set size attribute - REVIEW: Per-particle sizing for variety
      this.geometry.setAttribute(
        'aSize',
        new THREE.BufferAttribute(this.data.sizes, 1)
      )
      
      // REVIEW: Compute bounding sphere for frustum culling optimization
      this.geometry.computeBoundingSphere()
      
    } catch (error) {
      throw new Error(`Failed to create buffer attributes: ${error}`)
    }
  }
  
  /**
   * Initialize particle material with enhanced shaders
   */
  private initMaterial(): void {
    const opacity = Number(this.options.opacity || 1.0)
    const particleShape = this.options.particleShape || 'soft'
    
    const vertexShader = `
      attribute float aSize;
      varying vec3 vColor;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `
    
    // Generate fragment shader based on particle shape
    let fragmentShader = ''
    
    switch (particleShape) {
      case 'sharp':
        fragmentShader = `
          varying vec3 vColor;
          
          void main() {
            float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
            float alpha = step(distanceToCenter, 0.5);
            alpha *= ${opacity === 1 ? '1.0' : opacity.toFixed(2)};
            
            gl_FragColor = vec4(vColor, alpha);
          }
        `
        break
        
      case 'square':
        fragmentShader = `
          varying vec3 vColor;
          
          void main() {
            float alpha = ${opacity === 1 ? '1.0' : opacity.toFixed(2)};
            gl_FragColor = vec4(vColor, alpha);
          }
        `
        break
        
      default: // 'soft'
        fragmentShader = `
          varying vec3 vColor;
          
          void main() {
            float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
            float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
            alpha *= ${opacity === 1 ? '1.0' : opacity.toFixed(2)};
            
            gl_FragColor = vec4(vColor, alpha);
          }
        `
        break
    }
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    })
  }
  
  /**
   * Initialize THREE.Points object
   */
  private initPoints(): void {
    this.points = new THREE.Points(this.geometry, this.material)
  }
  
  /**
   * Initialize connection lines between particles
   */
  private initConnections(): void {
    if (!this.options.connected) return
    
    const positions: number[] = []
    const particleCount = this.data.count
    const maxDistance = this.options.connectionDistance || 1.0
    
    // Generate connections between nearby particles
    for (let i = 0; i < particleCount; i++) {
      const x1 = this.data.positions[i * 3]
      const y1 = this.data.positions[i * 3 + 1]
      const z1 = this.data.positions[i * 3 + 2]
      
      for (let j = i + 1; j < particleCount; j++) {
        const x2 = this.data.positions[j * 3]
        const y2 = this.data.positions[j * 3 + 1]
        const z2 = this.data.positions[j * 3 + 2]
        
        const distance = Math.sqrt(
          Math.pow(x2 - x1, 2) + 
          Math.pow(y2 - y1, 2) + 
          Math.pow(z2 - z1, 2)
        )
        
        if (distance <= maxDistance) {
          positions.push(x1, y1, z1, x2, y2, z2)
        }
      }
    }
    
    if (positions.length > 0) {
      this.connectionGeometry = new THREE.BufferGeometry()
      this.connectionGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      )
      
      const connectionColor = new THREE.Color(this.options.connectionColor || '#ffffff')
      this.connectionMaterial = new THREE.LineBasicMaterial({
        color: connectionColor,
        opacity: this.options.connectionOpacity || 0.3,
        transparent: true
      })
      
      this.connections = new THREE.LineSegments(this.connectionGeometry, this.connectionMaterial)
    }
  }
  
  /**
   * Update particle animations and interactions
   */
  public update(deltaTime: number, mousePosition?: THREE.Vector2, camera?: THREE.Camera): void {
    if (!this.options.animated && !this.options.interactive) return
    
    this.time += deltaTime * (this.options.animationSpeed || 1.0)
    
    const positionAttribute = this.geometry.getAttribute('position') as THREE.BufferAttribute
    const particleCount = this.data.count
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Get original position
      const originalX = this.data.positions[i3]
      const originalY = this.data.positions[i3 + 1]
      const originalZ = this.data.positions[i3 + 2]
      
      let newX = originalX
      let newY = originalY
      let newZ = originalZ
      
      // Apply floating animation
      if (this.options.animated) {
        const animRadius = this.options.animationRadius || 0.1
        newX += Math.sin(this.time + i * 0.1) * animRadius
        newY += Math.cos(this.time + i * 0.15) * animRadius * 0.5
        newZ += Math.sin(this.time + i * 0.2) * animRadius * 0.3
      }
      
      // Apply mouse interaction
      if (this.options.interactive && mousePosition && camera) {
        const mouseInfluence = this.options.mouseInfluence || 1.0
        const mouseRadius = this.options.mouseRadius || 2.0
        
        // Convert mouse position to world coordinates
        this.mouseInfluenceVector.set(
          (mousePosition.x / window.innerWidth) * 2 - 1,
          -(mousePosition.y / window.innerHeight) * 2 + 1,
          0.5
        )
        
        this.mouseInfluenceVector.unproject(camera)
        
        // Calculate distance to mouse
        const distance = Math.sqrt(
          Math.pow(newX - this.mouseInfluenceVector.x, 2) +
          Math.pow(newY - this.mouseInfluenceVector.y, 2) +
          Math.pow(newZ - this.mouseInfluenceVector.z, 2)
        )
        
        if (distance < mouseRadius) {
          const force = (1 - distance / mouseRadius) * mouseInfluence * 0.1
          const dirX = (newX - this.mouseInfluenceVector.x) / distance
          const dirY = (newY - this.mouseInfluenceVector.y) / distance
          const dirZ = (newZ - this.mouseInfluenceVector.z) / distance
          
          newX += dirX * force
          newY += dirY * force
          newZ += dirZ * force
        }
      }
      
      // Update positions
      positionAttribute.setXYZ(i, newX, newY, newZ)
    }
    
    positionAttribute.needsUpdate = true
  }
  
  /**
   * Update particle positions
   */
  public updatePositions(newPositions: Float32Array): void {
    this.data.positions = newPositions
    const positionAttribute = this.geometry.getAttribute('position') as THREE.BufferAttribute
    positionAttribute.array = newPositions
    positionAttribute.needsUpdate = true
  }
  
  /**
   * Update particle colors
   */
  public updateColors(newColors: Float32Array): void {
    this.data.colors = newColors
    const colorAttribute = this.geometry.getAttribute('color') as THREE.BufferAttribute
    colorAttribute.array = newColors
    colorAttribute.needsUpdate = true
  }
  
  /**
   * Update particle sizes
   */
  public updateSizes(newSizes: Float32Array): void {
    this.data.sizes = newSizes
    const sizeAttribute = this.geometry.getAttribute('aSize') as THREE.BufferAttribute
    sizeAttribute.array = newSizes
    sizeAttribute.needsUpdate = true
  }
  
  /**
   * Get particle data
   */
  public getData(): ParticleData {
    return this.data
  }
  
  /**
   * Get all renderable objects (points + connections)
   */
  public getRenderableObjects(): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [this.points]
    if (this.connections) {
      objects.push(this.connections)
    }
    return objects
  }
  
  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
    
    if (this.connectionGeometry) {
      this.connectionGeometry.dispose()
    }
    
    if (this.connectionMaterial) {
      this.connectionMaterial.dispose()
    }
  }
}
