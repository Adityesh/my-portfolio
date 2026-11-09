import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { about } from './src/data/about.ts'
import { profile } from './src/data/profile.ts'
import { socials } from './src/data/socials.ts'

const titleCase = (text: string) => text.replace(/\b\w/g, (letter) => letter.toUpperCase())
const escapeAttribute = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Fills the page's search/preview text and structured data (index.html) from src/data, so they always match what the
 * site shows: %SEO_DESCRIPTION% and <!-- seo:structured-data --> (a schema.org ProfilePage about a Person).
 */
function seo(siteUrl: string): Plugin {
  const url = `${siteUrl}/`
  const role = titleCase(profile.role)
  const description = `${profile.name}, ${profile.role} (${about.keySkills.join(', ')}). Explore my 3D room: projects on the monitor, about me on the whiteboard.`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${url}#website`, url, name: profile.name, inLanguage: 'en' },
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name: `${profile.name} | ${role}`,
        description,
        isPartOf: { '@id': `${url}#website` },
        mainEntity: { '@id': `${url}#person` },
        primaryImageOfPage: `${url}og-image.jpg`,
      },
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: profile.name,
        jobTitle: role,
        description: about.headline,
        url,
        knowsAbout: about.skills.flatMap((group) => group.skills),
        alumniOf: { '@type': 'CollegeOrUniversity', name: about.education.school },
        sameAs: socials.map((social) => social.url),
      },
    ],
  }
  // Escape '<' so nothing in the data can close the script tag.
  const json = JSON.stringify(structuredData, null, 2).replace(/</g, '\\u003c')
  return {
    name: 'seo-from-data',
    transformIndexHtml: (html) =>
      html
        .replaceAll('%SEO_DESCRIPTION%', escapeAttribute(description))
        .replace('<!-- seo:structured-data -->', `<script type="application/ld+json">\n${json}\n    </script>`),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), seo(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL)],
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
}))
