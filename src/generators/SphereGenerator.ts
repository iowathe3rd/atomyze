/**
 * SphereGenerator - Generates particle positions on a sphere surface
 */

import { IParticleGenerator, ShapeOptions } from '../types'

/**
 * Generates particles distributed on a sphere surface
 */
export class SphereGenerator implements IParticleGenerator {
  
  /**
   * Generate particle positions distributed on sphere surface
   * Uses Fibonacci sphere algorithm for even distribution
   * 
   * @param options Shape configuration options
   * @returns Float32Array with xyz coordinates for each particle
   */
  public generate(options: ShapeOptions): Float32Array {
    const count = options.count || 1000
    const radius = options.params?.radius || 1
    
    const positions = new Float32Array(count * 3)
    
    // Fibonacci sphere algorithm for even distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians
    
    for (let i = 0; i < count; i++) {
      // Calculate spherical coordinates
      const y = 1 - (i / (count - 1)) * 2 // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y) // radius at current y level
      
      const theta = goldenAngle * i // Golden angle increment
      
      // Convert to Cartesian coordinates
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      
      // Apply radius scaling and store positions
      const index = i * 3
      positions[index] = x * radius
      positions[index + 1] = y * radius
      positions[index + 2] = z * radius
    }
    
    return positions
  }
  
  /**
   * Generate particles with random distribution inside sphere
   * 
   * @param options Shape configuration options
   * @returns Float32Array with xyz coordinates for each particle
   */
  public generateVolume(options: ShapeOptions): Float32Array {
    const count = options.count || 1000
    const radius = options.params?.radius || 1
    
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Generate random point in unit sphere
      let x, y, z
      do {
        x = Math.random() * 2 - 1
        y = Math.random() * 2 - 1
        z = Math.random() * 2 - 1
      } while (x * x + y * y + z * z > 1)
      
      // Apply radius scaling
      const index = i * 3
      positions[index] = x * radius
      positions[index + 1] = y * radius
      positions[index + 2] = z * radius
    }
    
    return positions
  }
}
