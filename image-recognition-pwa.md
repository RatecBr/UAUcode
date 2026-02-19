# UAU Code: Image Recognition PWA

## Project Overview

A web-based (PWA) image recognition application using OpenCV.js (WASM) for local device detection of target images to trigger multimedia overlays (Video, Audio, 3D). Now with a premium "Neon Revolution" aesthetic.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, OpenCV.js (WASM), Three.js
- **Backend/DB**: Supabase (Auth, Storage, Postgres)
- **Architecture**: Local recognition loop (marker-based), Supabase RLS policies.

## Implementation Phases

### Phase 1: Branding & Migration (New)

- [x] Migrated from MAIPIX to UAU Code.
- [x] Implement the "Neon Revolution" design system.
- [x] Migrate Supabase project to dedicated `UAU-CODE` environment.

### Phase 2: Core Engine

- [x] Configure OpenCV.js WASM bridge.
- [x] Implement ORB Keypoint extraction and KNN matching.
- [x] Add Homography-based validation for detection stable.

### Phase 3: Content Overlays

- [x] Video Overlay (support for transparent/standard videos).
- [x] Audio Overlay (Accessibility mode).
- [x] 3D Model Overlay (Google Model Viewer / Three.js).

### Phase 4: UI/UX Neon

- [x] Landing Page with marketing hooks.
- [x] Modern Dashboard for managing AR experiences.
- [x] Secure Login/Auth via Supabase.

### Phase 5: Final Polish

- [x] PWA support (Manifest, Icons).
- [x] Systematic Testing on Mobile (iOS/Android).
- [x] Comprehensive technical documentation.
