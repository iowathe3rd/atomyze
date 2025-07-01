import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ command }) => {
  if (command === 'build') {
    // Library build configuration
    return {
      build: {
        lib: {
          entry: resolve('src/index.ts'),
          name: 'ParticleWeaver',
          fileName: (format) => `particle-weaver.${format}.js`
        },
        rollupOptions: {
          external: ['three'],
          output: {
            globals: {
              three: 'THREE'
            }
          }
        }
      },
      plugins: [
        dts({
          insertTypesEntry: true,
        })
      ]
    }
  }
  
  // Development server configuration
  return {
    server: {
      port: 5173,
      open: true
    },
    optimizeDeps: {
      include: ['three']
    }
  }
})
