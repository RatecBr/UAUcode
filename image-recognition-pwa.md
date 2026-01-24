# UAU: Image Recognition PWA

## Project Overview
A web-based (PWA) image recognition application using OpenCV.js (WASM) for local device detection of target images to trigger multimedia overlays (Video, Audio, 3D).

## Tech Stack
- **Frontend**: React (Vite), TypeScript, OpenCV.js (WASM), Three.js
- **Backend**: Node.js + Express (File Storage)
- **Architecture**: Local recognition loop (2-5 FPS), minimal server dependence.

## Implementation Phases

### Phase 1: Project Scaffolding
- [ ] Create directory structure (`client`, `server`)
- [ ] Initialize `server/package.json` with dependencies (`express`, `multer`, `cors`, `typescript`)
- [ ] Initialize `client` with Vite (React + TS)
- [ ] Configure `client/vite.config.ts` for PWA and Proxy

### Phase 2: Backend Implementation
- [ ] Implement `server/index.ts` (API Endpoints: /upload/target, /upload/content)
- [ ] Configure `multer` for file storage
- [ ] Serve static files from `storage`

### Phase 3: Frontend Core - Infrastructure
- [ ] Setup `public/opencv.js` and load mechanism
- [ ] Create `src/camera.ts` (Camera stream handling)
- [ ] Create `src/recognition.ts` (OpenCV logic: ORB, Matcher, Homography)

### Phase 4: Frontend Core - Overlays
- [ ] Implement `src/overlayVideo.ts`
- [ ] Implement `src/overlayAudio.ts`
- [ ] Implement `src/overlay3D.ts` (Three.js Scene)

### Phase 5: UI & Integration
- [ ] Build `src/App.tsx` (Upload UI, Start/Stop Logic, Detection State)
- [ ] Style application (`src/styles.css`) - Premium Mobile-First aesthetics
- [ ] PWA Configuration (Manifest, Service Worker)

### Phase 6: Final Polish
- [ ] Testing (Camera permissions, Detection tuning)
- [ ] README.md generation
