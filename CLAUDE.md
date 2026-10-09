# CLAUDE.md

## Project overview

A 3D portfolio website for Adityesh Mishra (Full Stack Developer). The landing experience is an isometric, dimly lit bedroom/workspace rendered with Three.js via React Three Fiber. Clicking the computer in the corner zooms the camera into the monitor and reveals a grid of project cards. Social links (GitHub, LinkedIn, optionally others) exist as clickable 3D objects elsewhere in the room.

The room model comes from Sketchfab ("Isometric Bedroom"): dark walls, wooden slat panel, bed, desk with laptop/computer, curtained window, armchair, bench, rug.

## Tech stack

- Vite + React + TypeScript
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `gsap` (camera tweens) or drei `CameraControls`
- Tailwind CSS for the 2D overlay UI
- `gltfjsx` for converting the GLB into a typed React component

Use React Three Fiber, not vanilla three.js. Keep UI state (zoomed in/out, active project) in React state or a small Zustand store.

## Commands

```bash
npm install
npm run dev        # Vite dev server
npm run build      # production build
npm run preview    # preview production build
npx gltfjsx models-src/room.glb --transform --types --keepnames --shadows --exportdefault   # regenerate model; move the -transformed.glb to public/models/room.glb and merge into Room.tsx (source GLB is gitignored)
```

## Directory structure

```
src/
  components/
    scene/
      Experience.tsx        # Canvas contents: camera, lights, model, effects
      Room.tsx              # gltfjsx-generated model + interaction wiring
      CameraRig.tsx         # zoom in/out animation logic
      Lights.tsx            # dim lighting setup
      SocialIcon3D.tsx      # extruded SVG icon with hover + click redirect
      Effects.tsx           # bloom etc. (disabled on mobile)
    ui/
      ProjectOverlay.tsx    # full-screen monitor-styled project grid
      ProjectCard.tsx
      TagChip.tsx
      BackButton.tsx
      LoadingScreen.tsx     # uses drei useProgress
      FallbackView.tsx      # plain 2D list for no-WebGL / low-end devices
  data/
    projects.ts             # all project data lives here
    socials.ts              # social links (name, url, svg path)
  hooks/
    useIsMobile.ts
    useResponsiveCamera.ts
  store/
    useAppStore.ts          # view state: 'room' | 'monitor'
public/
  models/                   # compressed GLB(s)
  images/projects/          # website screenshots supplied by the user
```

## Core behavior

1. **Camera:** `OrthographicCamera` at about `[10, 10, 10]` looking at the room center for a true isometric view. Zoom is computed from viewport size so the whole room fits in both portrait and landscape.
2. **Lighting:** dim scene. Low ambient (about 0.1-0.2), warm point/spot light at the window, cool glow from the monitor, `Environment preset="night"` at low intensity, soft contact shadows, subtle bloom on the monitor and window. If the model has baked lighting, keep realtime lights subtle to avoid double-lighting.
3. **Monitor click:** the monitor mesh has `onClick`. It animates the camera position, target and zoom to the screen, sets store view to `'monitor'`, disables orbit/rotation, then fades in `ProjectOverlay`.
4. **Back:** a back button and the Esc key reverse the animation and return to `'room'`.
5. **Project overlay:** regular DOM, not in-canvas HTML (sharper, scrollable, accessible, works on mobile). Styled like a monitor UI. Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
6. **Social icons:** 3D objects in the room built from extruded SVGs (`SVGLoader` + `ExtrudeGeometry` or drei `<Svg>`). Pointer over scales/glows, `useCursor` for pointer cursor, click calls `window.open(url, '_blank', 'noopener,noreferrer')`.

## Data shapes

```ts
// src/data/projects.ts
export type Project = {
  id: string;
  title: string;
  description?: string;
  image: string;        // path under /images/projects/
  tags: string[];       // technologies used, e.g. ['ASP.NET Core', 'React']
  url: string;          // live site
};

// src/data/socials.ts
export type Social = {
  id: string;           // 'github' | 'linkedin' | ...
  label: string;
  url: string;
  position: [number, number, number];
};
```

Adding a project means editing `projects.ts` and dropping the screenshot in `public/images/projects/`. No component changes should be required.

## Mobile requirements

- Responsive camera zoom based on viewport aspect ratio.
- Larger hit areas for the monitor and social objects on touch devices; add an idle pulse/glow as a tap hint since hover does not exist.
- Detect mobile with `matchMedia('(pointer: coarse)')` or width < 768. On mobile: disable bloom and soft shadows, cap `dpr` at 1-1.5, lock or limit camera rotation.
- Overlay is single-column with native scrolling.
- Target GLB under about 3 MB on mobile (1K textures, KTX2 where possible).
- If WebGL is unavailable or the device is low-end, render `FallbackView` (plain list of projects and social links).

## Performance rules

- Always compress models (`gltfjsx --transform`: Draco/meshopt). Keep the GLB under about 5 MB.
- Wrap the scene in `<Suspense>` with a `useProgress` loading screen.
- `dpr={[1, 2]}` on the Canvas. Use `frameloop="demand"` if the scene is mostly static and invalidate on interaction.
- Do not create objects, materials or geometries inside `useFrame` or on every render. Memoize.
- Dispose of anything manually created.

## Code conventions

- TypeScript strict mode, no `any`.
- Function components and hooks only. One component per file, PascalCase filenames.
- Keep 3D code in `components/scene/` and DOM UI in `components/ui/`. Scene components never import UI components and vice versa; they communicate through the store.
- Hardcode no project or social data in components; read from `data/`.
- Tailwind for DOM styling. No inline styles except for dynamic values.
- Accessibility: all interactive DOM elements keyboard reachable, visible focus states, alt text on project images, project list rendered as real DOM for SEO.

## Build order

1. Scaffold Vite + R3F, load the model with `Suspense`, orthographic camera.
2. Responsive camera fitting.
3. Lighting and effects tuning.
4. Monitor click and camera zoom, back button and Esc.
5. `ProjectOverlay`, `ProjectCard`, `TagChip` with sample data.
6. Social icons as 3D objects with redirects.
7. Mobile pass: touch targets, reduced effects, fallback view.
8. Optimization, SEO meta tags, deploy (Vercel or Netlify).

## Notes for Claude

- Verify the monitor screen is a separate mesh in the model before wiring click logic. If not, add an invisible plane over the screen.
- Ask before adding new dependencies beyond the stack above.
- When changing camera positions or light intensities, state the old and new values so they are easy to tune.
- Run `npm run build` after structural changes to catch type errors.
