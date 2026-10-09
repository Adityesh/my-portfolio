# CLAUDE.md

## Project overview

A 3D portfolio website for Adityesh Mishra (Full Stack Developer). The landing experience is an isometric, dimly lit late-night bedroom/workspace rendered with Three.js via React Three Fiber. Clicking the computer monitor zooms the camera into the screen and reveals a grid of project cards. GitHub and LinkedIn are neon signs on the wall that open the profiles. A neon name sign hangs above the door.

The room model is "Low Poly Isometric Room" by amurin on Sketchfab (CC BY 4.0). It is dressed with extra props and effects: wall clock, rug, mug with steam, plant, whiteboard with drawings, cat, headphones, curtains, lava lamp, string lights, LED strip under the bed, night-sky window with stars, cloud and moon, passing car headlights, a window light shaft and dust motes.

Status: all of the original build plan is done (see "History" below). The site is deployed on Vercel at `https://my-portfolio-one-rosy.vercel.app`. Current work is polish, real project content and launch.

## Tech stack

- Vite 8 + React 19 + TypeScript 6 (strict)
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` (+ `postprocessing`)
- drei `CameraControls` for camera moves (no gsap)
- Zustand for app and settings state
- Tailwind CSS 4 (`@tailwindcss/vite`) for the DOM overlay UI
- oxlint for linting
- `gltfjsx` (via `npx`, not a dependency) for converting GLBs

Use React Three Fiber, not vanilla three.js.

## Commands

```bash
npm install
npm run dev        # Vite dev server (localhost:5173)
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run preview    # preview production build
npx gltfjsx models-src/room.glb --transform --types --keepnames --shadows --exportdefault   # regenerate model; move the -transformed.glb to public/models/room.glb and merge into Room.tsx (source GLB is gitignored)
```

Node >= 20.19 (`engines` in package.json).

## Directory structure

```
src/
  App.tsx                   # picks 3D vs fallback, lazy-loads SceneCanvas, preloads room.glb, mounts DOM UI
  components/
    scene/                  # everything inside the <Canvas>
      SceneCanvas.tsx       # <Canvas> (frameloop="demand", dpr from quality level); lazy-loaded so the fallback never downloads three.js
      Experience.tsx        # camera rig, lights, room, props, contact shadows, lazy Effects
      Room.tsx              # gltfjsx-generated room model (water bottle cut out of the merged mesh and moved)
      RoomProps.tsx         # rug, mug, plant, whiteboard, headphones placement + small idle animations
      Cat.tsx               # the cat: breathing, idle glances, turns toward the pointer, hops on tap, spins on 3 quick taps
      CatHearts.tsx         # hearts floating up from the cat when tapped
      ContactBlob.tsx       # soft fake contact shadow for objects that cast no real shadow
      FittedModel.tsx       # loads a prop GLB and scales it to a real-world size
      roomLayout.ts         # world-space positions of room features (walls, desk, screen, window...)
      CameraRig.tsx         # CameraControls: fitted room view, intro ease-in, idle drift, monitor zoom, rotation limits
      Lights.tsx            # dim late-night lighting, intensities faded in by the intro
      introTimeline.ts      # intro timings (lights fade up, monitor power-on flicker)
      Effects.tsx           # EffectComposer: N8AO, bloom, tone mapping, grain (each toggled by quality level)
      ClampNegativeEffect.ts # clamps the colour grade to >= 0 so the sRGB conversions never produce NaN (white screens)
      PerformanceGovernor.tsx # frame pacing (30/60) and automatic quality stepping
      MonitorHitArea.tsx    # invisible plane over the screen that opens the projects view
      LightSwitch.tsx       # wall switch by the door: toggles the ceiling light (store roomLight), click sound, locator LED
      MonitorScreen.tsx     # canvas texture of code typing itself on the screen (text from data/screenCode.ts)
      SocialIcon3D.tsx      # neon wall sign: extruded SVG logo, hover/tap pulse, click opens url
      NeonNameSign.tsx      # name sign (self-hosted Pacifico font)
      Clock.tsx, Curtains.tsx, LavaLamp.tsx, StringLights.tsx, BedLedStrip.tsx, WhiteboardDrawing.tsx, MugSteam.tsx
      WindowBackdrop.tsx    # sky shader (gradient, moon, sun) driven by the time of day
      WindowStars.tsx, WindowCloud.tsx, WindowShaft.tsx, Headlights.tsx, DustMotes.tsx
      skyTimeline.ts        # time-of-day keyframes (sky colours, sun/moon/stars, daylight) and the shared `sky` state
      SkyClock.tsx          # writes `sky` each frame; eases (time-lapse) when the target hour jumps
      LoadingReporter.tsx   # publishes drei useProgress to the store
      SceneReady.tsx        # marks the store ready after the first frame is drawn
      DebugStats.tsx        # publishes FPS/renderer stats to the store
      assetPaths.ts         # model / Draco / HDRI paths
      geometryUtils.ts      # split a geometry by bounding box (cutting objects out of merged meshes)
    ui/                     # DOM overlay
      ProjectOverlay.tsx    # full-screen editor-styled project window; always in the DOM for SEO, inert until opened
      ProjectCard.tsx, TagChip.tsx, BackButton.tsx
      LoadingScreen.tsx     # solid -> blurred while loading, then focus-pull reveal
      FallbackView.tsx      # plain 2D page for no-WebGL / low-memory devices
      SettingsMenu.tsx      # hamburger menu: animations, frame rate, quality, camera drift, dust, time of day, room light, sound, debug, credits
      SegmentedControl.tsx, ToggleSwitch.tsx
      DebugOverlay.tsx      # FPS / renderer stats panel
      SocialLinks.tsx       # visually hidden real links (keyboard / screen readers / SEO)
      ViewProjectsButton.tsx # visually hidden keyboard route into the monitor view
  data/
    projects.ts             # all project data
    socials.ts              # social links, positions, colours, SVG paths (Simple Icons)
    profile.ts              # name and role
    credits.ts              # third-party attributions shown in the settings menu
    screenCode.ts           # code snippet typed out on the in-room monitor
  hooks/
    useIsMobile.ts, useMediaQuery.ts, useReducedMotion.ts
    useRenderMode.ts        # 'full' | 'fallback' (WebGL check, deviceMemory, ?lite / ?3d)
    useResponsiveCamera.ts  # camera angles and zoom-to-fit
    useQuality.ts           # current quality level + config with phone limits
    useSceneSettings.ts     # visitor settings with automatic defaults filled in
    usePcRgb.ts             # RGB cycling on the PC's glass panel
    useSkyHour.ts           # hour the window shows: live local time, menu preset, or ?time= override
  audio/
    sfx.ts                  # Web Audio sound effects (lazy context, preload, per-play pitch, synthesised switch click); files in public/sounds/
  store/
    useAppStore.ts          # view ('room' | 'monitor'), roomLight, transitions, loading, sceneReady, debug stats, frame cap, quality
    useSettingsStore.ts     # persisted visitor preferences (localStorage with safe fallback)
    quality.ts              # quality levels and what each turns on; ?diag= flags
    timeOfDay.ts            # time-of-day setting, preset hours, labels
public/
  models/                   # compressed GLBs (room ~1.5 MB, props ~220 KB total)
  images/projects/          # project screenshots (.webp, 16:10 works best)
  draco/                    # self-hosted Draco decoder
  hdri/night_256.hdr        # self-hosted environment map
  fonts/                    # Pacifico (SIL OFL)
  sounds/                   # sound effects (meow.mp3; sources in sounds/CREDITS.txt)
  og-image.jpg, favicon.svg, robots.txt
.env.development / .env.production  # VITE_SITE_URL, used in index.html for canonical, Open Graph and JSON-LD
vercel.json                 # cache and security headers
```

## Core behavior

1. **Camera:** orthographic, driven by drei `CameraControls` in `CameraRig.tsx`. It views the room's open corner (azimuth 45°). Zoom is computed from viewport size so the room fits in portrait and landscape (`useResponsiveCamera.ts`). Rotation and zoom are limited so the cut-away sides always face the camera. On load the camera eases in from a rotated, zoomed-out pose. After inactivity it drifts gently (this can be turned off in settings).
2. **Lighting:** late-night mood where the monitor is the main light source. Lights include ambient, monitor area/fill/backlight, a window spotlight with shadows, a window glow, a desk lamp and a desk underglow. The environment uses a self-hosted HDRI at low intensity. Final intensities live in `INTENSITY` in `Lights.tsx`, and the intro fades them up from 0. Bloomable elements (neon, string lights, screen) use unlit, non-tone-mapped materials with values above 1. The wall switch by the door (or "Room light" in the settings menu) fades in a warm ceiling light plus extra ambient/environment (`ROOM_LIGHT` in `Lights.tsx`); that light is always mounted at 0 so toggling never changes the light count or recompiles shaders. The wall clock shows the visitor's local time.
   **Time of day:** the window follows the visitor's local hour (or a Dawn/Day/Dusk/Night preset from the menu, or `?time=14.5` to preview any hour). `skyTimeline.ts` blends keyframes into a shared `sky` object (written by `SkyClock`, read in frame callbacks by the window, stars, cloud, beam, headlights and `Lights.tsx`); readers compare `sky.version` so they only update when it changes. `sky.daylight` drives the daylight lift in `DAYLIGHT` in `Lights.tsx` and the window light colour; the night keyframe is the original late-night look.
3. **Monitor click:** `MonitorHitArea` (an invisible plane, larger on touch devices) calls `openMonitor()`. A drag doesn't count as a click. `CameraRig` animates to face the screen head-on, then `ProjectOverlay` fades in.
4. **Back:** `BackButton` and the Esc key call `closeMonitor()`, which reverses the animation to `'room'`.
5. **Project overlay:** regular DOM, not in-canvas HTML. It is styled like the editor on the in-room screen so the zoom flows into it. Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. The whole card links to `url`, and a separate "Code" link goes to `source`.
6. **Social signs:** `SocialIcon3D` is a neon sign on the window wall. It has hover glow, an idle pulse as a tap hint, `useCursor`, and click calls `window.open(url, '_blank', 'noopener,noreferrer')`. `SocialLinks` provides hidden real links for accessibility.
7. **Render mode:** `?lite` forces the fallback page and `?3d` forces the room. Without WebGL or with `deviceMemory <= 1`, the fallback page is shown. Losing the WebGL context at runtime also drops to the fallback.

## Rendering quality and performance system

- Levels in `store/quality.ts`: `minimal` < `low` < `medium` < `high`, plus `auto`. Each level sets dpr, bloom, AO, grain, contact shadows, the full or lite light set, shadow maps, and dust density.
- `PerformanceGovernor` paces frames at a 30 or 60 cap and measures in 2.5 s windows. In Auto it drops 60 to 30 first, then lowers quality one level at a time. After about 10 s of headroom it tries a step up, and reverts that step (and stops trying) if it struggles. The level Auto settles on is remembered per device (`learnedQuality`). A safety net switches to `low` if frames drop below 6 fps, even when the visitor picked the level.
- Phones: never AO; dpr is capped at 2 on High and 1.5 below. Post-processing always uses 4x MSAA.
- `?diag=nobloom,nograin,noao,nocontact,nolights,noshadows` turns individual features off for debugging device-specific bugs.
- The settings menu toggles a debug overlay that shows FPS and renderer stats.

## Data shapes

```ts
// src/data/projects.ts
export type Project = {
  id: string
  title: string
  description?: string
  image: string                    // path under /images/projects/
  imageFit?: 'cover' | 'contain'   // 'contain' for tall phone screenshots
  tags: string[]                   // technologies used
  url: string                      // live site or demo (the card's main link)
  urlLabel?: string                // default "Live site" (e.g. "Watch demo")
  source?: string                  // source code, shown as a separate "Code" link
}

// src/data/socials.ts
export type Social = {
  id: string
  label: string
  url: string
  position: [number, number, number] // sign centre, on the wall right of the window
  color: string                      // neon colour
  iconPath: string                   // SVG path data in a 24x24 viewBox
}
```

Adding a project means editing `projects.ts` and dropping the screenshot in `public/images/projects/`. No component changes should be required. There are currently 6 projects: movie-app, pension-calculator, random-meal-generator, book-manager, wally and markdown-previewer.

## Mobile requirements

- Responsive camera zoom based on viewport aspect ratio.
- Larger hit areas for the monitor and social signs on touch devices, with an idle pulse/glow as a tap hint.
- `useIsMobile`: `(pointer: coarse)` or width < 768. Phone limits are applied in `configFor()` in `quality.ts`. Bloom is allowed on phones; earlier white flashes were NaN pixels in the window shaft shader, now fixed.
- Overlay is single-column with native scrolling.
- Keep total model download under about 3 MB.
- `FallbackView` for no-WebGL / low-memory devices.

## Performance rules

- Always compress models (`gltfjsx --transform`: Draco/meshopt). Keep the GLB under about 5 MB.
- Three.js, the scene and post-processing are lazy-loaded. Keep the fallback path free of 3D imports.
- `frameloop="demand"`: the governor requests frames while animations run. Call `invalidate()` after any change when nothing is animating.
- Do not create objects, materials or geometries inside `useFrame` or on every render. Memoize.
- Dispose of anything manually created.
- Switching lights or shadows recompiles shaders (a visible hitch), so the governor changes those last.

## Code conventions

- TypeScript strict mode, no `any`. Imports use explicit `.ts` / `.tsx` extensions.
- Function components and hooks only. One component per file, PascalCase filenames.
- Keep 3D code in `components/scene/` and DOM UI in `components/ui/`. Scene components never import UI components and vice versa; they communicate through the stores.
- Hardcode no project, social or profile data in components; read from `data/`. Room positions go in `roomLayout.ts`.
- Tailwind for DOM styling. No inline styles except for dynamic values.
- Tunable constants sit at the top of the file with a short comment explaining them.
- Respect `prefers-reduced-motion` (`useReducedMotion`) and the animations setting.
- Accessibility: all interactive DOM elements keyboard reachable, visible focus states, alt text on project images, project list rendered as real DOM for SEO.

## History

The original build order (all done, 22 commits on `feat/3d-portfolio`):

1. Scaffold, compressed room model, responsive isometric camera.
2. Late-night lighting, bloom, self-hosted HDRI and Draco.
3. Night-sky window, monitor zoom, projects overlay.
4. Neon social signs, props, clock, curtains, string lights, name sign.
5. Mobile pass and fallback view, settings menu, loading/SEO/deploy config.
6. Adaptive frame rate and quality, debug overlay, lava lamp, LED strip, loading reveal, phone rendering fixes.
7. Real project data, Vercel production URL.

`feat/3d-portfolio` does not share history with `feat/v2-rewrite` (the previous 2D portfolio). Decide how to combine them before opening a PR.

## Notes for Claude

- Ask before adding new dependencies beyond the stack above.
- When changing camera positions or light intensities, state the old and new values so they are easy to tune.
- Run `npm run build` (and `npm run lint`) after structural changes to catch type errors.
- If the production URL changes, update `.env.production`.
- Third-party models: room (CC BY 4.0, amurin; credited in `data/credits.ts`, shown in the settings menu), wall clock (Sketchfab Standard, hitheredearjohn), and CC0 props (rug, mug, plant, whiteboard, cat, headphones, curtains, lava lamp; no credit needed). Sound: `public/sounds/meow.mp3`, supplied by the owner; **open item:** record its source and license in `public/sounds/CREDITS.txt` before deploying. **Open item:** the owner must confirm that the clock's license allows serving the GLB on a public site. The site is already deployed. Source files live in `models-src/` (gitignored, not present in this checkout).
