# Session Memory Log

> **System Instruction:** Read the last 2 entries of this file at the start of every session to establish context. Update this file when closing significant tasks.

## [2026-01-23] Session 1: Migration & Optimization
**Goal:** Optimize performance and migrate to Serverless.

1.  **Performance Overhaul:**
    *   Implemented OpenCV.js ORB with **800 max features** (down from 2500).
    *   Added **Internal VGA Downsampling** (640px wide) for recognition loop, keeping display HD.
    *   Result: Recognition is now instant and CPU efficient.

2.  **UX Improvements (Sticky Playback):**
    *   Implemented "Sticky" logic: Video continues playing if target is lost.
    *   Added "Debounce": Requires **3 consecutive frames** to confirm a NEW target before switching.
    *   **JIT Loading**: New content downloads in background (Blob) while old content plays. Zero black screens.

3.  **Architecture Migration (Supabase):**
    *   **DELETED** Node.js `server/` folder.
    *   Migrated Auth, Database (Targets), and Storage (Assets) to **Supabase**.
    *   Updated `Scanner`, `Admin`, and `Login` to use `supabase-js`.
    *   Verified `UAU V.1.05 - Supabase Migration` complete.

## [2026-01-25] Session 2: Rebranding & Protocol Update
**Goal:** Rebrand to MAIPIX and established strict deployment/versioning protocols.

1.  **Rebranding complete:**
    *   Moved from "UAU" to "MAIPIX" (Slogan: "Imagens que falam").
    *   Updated Landing page, SEO metadata, PWA manifest, and documentation.
    *   Unified UI style with `#00ff9d` primary color and glassmorphism.

2.  **Protocol Update (SKILL: project-protocols):**
    *   **Deployment Rule:** NEVER deploy automatically. Only push/deploy when explicitly requested by user.
    *   **Versioning Standard:** `MAIPIX V.1.X (Keyword)`.
    *   **Current Version:** 1.1.0/1.2.0 (To be finalized on next deploy).

**Next Steps / Context for Next Session:**
- Wait for user's signal to deploy.
- Next deploy should be named `MAIPIX V.1.2 (REBRAND)`.
- Continue monitoring scanner performance and "Sticky Playback" stability.
