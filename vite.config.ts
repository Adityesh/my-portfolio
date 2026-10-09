import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // three.js alone is ~1 MB minified (~300 KB gzipped); it's lazy-loaded and cached, so don't warn about it.
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        // Stable vendor chunks: they change rarely, so returning visitors keep them cached when app code changes.
        codeSplitting: {
          // Higher priority wins a module first. Groups also take their dependencies, so three.js and React
          // go first (otherwise the post-processing chunk would swallow parts of three and be needed up front).
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 5 },
            // Shared by the app's own stores and by R3F; keep it out of the 3D chunks so the main bundle stays light.
            { name: 'zustand', test: /node_modules[\\/]zustand[\\/]/, priority: 5 },
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 5 },
            { name: 'r3f', test: /node_modules[\\/](@react-three[\\/](fiber|drei)|three-stdlib|troika-[^\\/]+|camera-controls|@monogrid|maath|meshline|stats-gl|suspend-react|its-fine|bidi-js|webgl-sdf-generator)[\\/]/, priority: 4 },
            { name: 'postprocessing', test: /node_modules[\\/](postprocessing|n8ao|@react-three[\\/]postprocessing)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
