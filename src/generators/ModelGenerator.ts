/**
 * ModelGenerator - Generates particle positions from 3D model vertices
 * This is a key feature that allows creating particle clouds from any 3D model
 * 
 * CODE REVIEW NOTES:
 * ✅ Good: Async loading with proper error handling
 * ✅ Good: Support for model transformation and scaling
 * ✅ Good: Vertex extraction from complex model hierarchies
 * ⚠️  ISSUE: No caching mechanism for loaded models
 * ⚠️  ISSUE: Large models could cause memory issues
 * ⚠️  ISSUE: No progress feedback for large file downloads
 * ⚠️  ISSUE: No validation for supported file formats
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Model loading is async and non-blocking
 * - Memory usage scales with model complexity
 * - Consider streaming for very large models
 * - Vertex deduplication could reduce memory usage
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { IParticleGenerator, ModelOptions } from '../types'

/**
 * Generates particles from 3D model vertices
 * Supports glTF/GLB format models
 * 
 * ARCHITECTURE NOTES:
 * - Uses GLTFLoader for industry-standard format support
 * - Traverses entire model hierarchy to extract all vertices
 * - Applies world transformations for accurate positioning
 * - Supports resampling for performance optimization
 */
export class ModelGenerator implements IParticleGenerator {
  private loader: GLTFLoader
  
  // REVIEW: Add model cache to prevent re-downloading
  private static modelCache = new Map<string, THREE.Object3D>()
  
  constructor() {
    this.loader = new GLTFLoader()
    
    // REVIEW: Configure loader for better performance
    // Consider adding DRACOLoader for compressed models
    // this.loader.setDRACOLoader(dracoLoader)
  }
  
  /**
   * Generate particle positions from 3D model vertices
   * 
   * REVIEW: Add model caching to improve performance on repeated loads
   * REVIEW: Consider adding progress callbacks for large models
   * REVIEW: Add file format validation
   * 
   * @param options Model loading options
   * @returns Promise<Float32Array> with xyz coordinates for each particle
   */
  public async generate(options: ModelOptions): Promise<Float32Array> {
    // REVIEW: Validate model URL format
    if (!this.isValidModelUrl(options.url)) {
      throw new Error(`Invalid model URL or unsupported format: ${options.url}`)
    }
    
    try {
      // REVIEW: Check cache first to avoid re-downloading
      let scene = ModelGenerator.modelCache.get(options.url)
      if (!scene) {
        scene = await this.loadModel(options.url)
        // REVIEW: Cache with size limit to prevent memory leaks
        if (ModelGenerator.modelCache.size < 10) {
          ModelGenerator.modelCache.set(options.url, scene.clone())
        }
      }
      
      const positions = this.extractVertices(scene, options)
      
      // REVIEW: Validate output data
      if (positions.length === 0) {
        throw new Error('No vertices found in the model')
      }
      
      return positions
    } catch (error) {
      console.error('Failed to generate particles from model:', error)
      throw error
    }
  }
  
  /**
   * Validate model URL and format
   * REVIEW: Add support for more formats (OBJ, FBX, etc.)
   */
  private isValidModelUrl(url: string): boolean {
    const supportedFormats = ['.gltf', '.glb']
    return supportedFormats.some(format => 
      url.toLowerCase().includes(format)
    )
  }
  
  /**
   * Load 3D model using GLTFLoader
   * 
   * @param url URL to the model file
   * @returns Promise<GLTF> loaded model data
   */
  private loadModel(url: string): Promise<THREE.Object3D> {
    // REVIEW: Check cache first
    const cachedModel = ModelGenerator.modelCache.get(url)
    if (cachedModel) {
      return Promise.resolve(cachedModel.clone())
    }
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          // REVIEW: Cache the loaded model
          ModelGenerator.modelCache.set(url, gltf.scene)
          
          resolve(gltf.scene)
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
        },
        (error) => {
          reject(error)
        }
      )
    })
  }
  
  /**
   * Extract vertex positions from loaded model
   * 
   * @param scene Loaded model scene
   * @param options Model options
   * @returns Float32Array with vertex positions
   */
  private extractVertices(scene: THREE.Object3D, options: ModelOptions): Float32Array {
    const vertices: number[] = []
    const scale = options.scale || 1
    const maxVertices = 15000 // Строже ограничиваем максимальное количество вершин
    let totalVertexCount = 0
    
    // First pass: count total vertices
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const positionAttribute = child.geometry.getAttribute('position')
        if (positionAttribute) {
          totalVertexCount += positionAttribute.count
        }
      }
    })
    
    console.log(`Total vertices in model: ${totalVertexCount}`)
    
    // Calculate sampling step to ensure we don't exceed maxVertices
    const samplingStep = Math.max(1, Math.ceil(totalVertexCount / maxVertices))
    console.log(`Using sampling step: ${samplingStep}`)
    
    // Second pass: extract vertices with sampling
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geometry = child.geometry
        const positionAttribute = geometry.getAttribute('position')
        
        if (positionAttribute) {
          const matrix = child.matrixWorld
          const vertex = new THREE.Vector3()
          
          // Extract vertices with sampling
          for (let i = 0; i < positionAttribute.count; i += samplingStep) {
            // Строго проверяем лимит
            if (vertices.length / 3 >= maxVertices) break
            
            vertex.fromBufferAttribute(positionAttribute, i)
            vertex.applyMatrix4(matrix)
            vertex.multiplyScalar(scale)
            
            vertices.push(vertex.x, vertex.y, vertex.z)
          }
        }
      }
    })
    
    const extractedParticleCount = Math.floor(vertices.length / 3)
    console.log(`Extracted ${extractedParticleCount} particles from model`)
    
    // Убеждаемся, что длина массива кратна 3
    const validLength = extractedParticleCount * 3
    if (vertices.length !== validLength) {
      console.warn(`Adjusting array length from ${vertices.length} to ${validLength}`)
      vertices.length = validLength
    }
    
    // Validate array size before creating Float32Array
    if (validLength > 60000) { // 20000 particles * 3 coordinates
      throw new Error(`Too many vertices: ${validLength}. Maximum allowed: 60000`)
    }
    
    // Apply additional particle count limit if specified
    const targetParticleCount = options.particleCount ? 
      Math.min(options.particleCount, maxVertices) : 
      extractedParticleCount
      
    // Если нужно ресэмплировать
    if (targetParticleCount !== extractedParticleCount) {
      return this.resampleVertices(new Float32Array(vertices), targetParticleCount)
    }
    
    return new Float32Array(vertices)
  }
   /**
   * Resample vertices to match desired particle count
   * 
   * @param originalVertices Original vertex array
   * @param targetCount Desired number of particles
   * @returns Float32Array with resampled vertices
   */
  private resampleVertices(originalVertices: Float32Array, targetCount: number): Float32Array {
    // Строго ограничиваем максимальное количество частиц
    const maxParticles = 1000;
    const safeTargetCount = Math.min(targetCount, maxParticles)
    
    // Убеждаемся, что safeTargetCount целое число
    const finalTargetCount = Math.floor(safeTargetCount)
    
    // Validate target count
    if (finalTargetCount * 3 > 50000) {
      throw new Error(`Target array size too large: ${finalTargetCount * 3}`)
    }
    
    const originalCount = Math.floor(originalVertices.length / 3)
    
    console.log(`Resampling from ${originalCount} to ${finalTargetCount} particles`)
    
    try {
      const newVertices = new Float32Array(finalTargetCount * 3)
      
      if (finalTargetCount <= originalCount) {
        // Sample from original vertices
        const step = originalCount / finalTargetCount
        
        for (let i = 0; i < finalTargetCount; i++) {
          const sourceIndex = Math.floor(i * step) * 3
          const targetIndex = i * 3
          
          // Убеждаемся, что индексы в допустимых границах
          if (sourceIndex + 2 < originalVertices.length && targetIndex + 2 < newVertices.length) {
            newVertices[targetIndex] = originalVertices[sourceIndex]
            newVertices[targetIndex + 1] = originalVertices[sourceIndex + 1]
            newVertices[targetIndex + 2] = originalVertices[sourceIndex + 2]
          }
        }
      } else {
        // Duplicate and interpolate vertices
        for (let i = 0; i < finalTargetCount; i++) {
          const sourceIndex = (i % originalCount) * 3
          const targetIndex = i * 3
          
          // Add small random offset to avoid exact duplicates
          const offset = (Math.random() - 0.5) * 0.01
          
          // Убеждаемся, что индексы в допустимых границах
          if (sourceIndex + 2 < originalVertices.length && targetIndex + 2 < newVertices.length) {
            newVertices[targetIndex] = originalVertices[sourceIndex] + offset
            newVertices[targetIndex + 1] = originalVertices[sourceIndex + 1] + offset
            newVertices[targetIndex + 2] = originalVertices[sourceIndex + 2] + offset
          }
        }
      }
      
      if (finalTargetCount < targetCount) {
        console.warn(`ModelGenerator: Reduced particle count from ${targetCount} to ${finalTargetCount} for performance`)
      }
      
      return newVertices
    } catch (error) {
      console.error('Failed to create resampled vertex array:', error)
      throw new Error(`Array creation failed for size ${finalTargetCount * 3}`)
    }
  }
  
  
  /**
   * Generate particles on model surface (alternative method)
   * Uses raycasting to place particles on mesh surface
   * 
   * @param options Model options
   * @returns Promise<Float32Array> with surface positions
   */
  public async generateOnSurface(options: ModelOptions & { count: number }): Promise<Float32Array> {
    const scene = await this.loadModel(options.url)
    const count = options.count || 1000
    const scale = options.scale || 1
    
    const positions = new Float32Array(count * 3)
    const meshes: THREE.Mesh[] = []
    
    // Collect all meshes
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child)
      }
    })
    
    if (meshes.length === 0) {
      throw new Error('No meshes found in the model')
    }
    
    // Calculate bounding box for the entire model
    const box = new THREE.Box3()
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        box.expandByObject(child)
      }
    })
    
    const raycaster = new THREE.Raycaster()
    const directions = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1)
    ]
    
    let placed = 0
    let attempts = 0
    const maxAttempts = count * 10
    
    while (placed < count && attempts < maxAttempts) {
      // Generate random point in bounding box
      const point = new THREE.Vector3(
        THREE.MathUtils.lerp(box.min.x, box.max.x, Math.random()),
        THREE.MathUtils.lerp(box.min.y, box.max.y, Math.random()),
        THREE.MathUtils.lerp(box.min.z, box.max.z, Math.random())
      )
      
      // Try raycasting in different directions
      const direction = directions[Math.floor(Math.random() * directions.length)]
      raycaster.set(point, direction)
      
      const intersects = raycaster.intersectObjects(meshes)
      
      if (intersects.length > 0) {
        const intersection = intersects[0].point
        intersection.multiplyScalar(scale)
        
        const index = placed * 3
        positions[index] = intersection.x
        positions[index + 1] = intersection.y
        positions[index + 2] = intersection.z
        
        placed++
      }
      
      attempts++
    }
    
    // Fill remaining positions with random vertices if needed
    if (placed < count) {
      const vertices = this.extractVertices(scene, options)
      const vertexCount = vertices.length / 3
      
      for (let i = placed; i < count; i++) {
        const sourceIndex = Math.floor(Math.random() * vertexCount) * 3
        const targetIndex = i * 3
        
        positions[targetIndex] = vertices[sourceIndex]
        positions[targetIndex + 1] = vertices[sourceIndex + 1]
        positions[targetIndex + 2] = vertices[sourceIndex + 2]
      }
    }
    
    return positions
  }
}
