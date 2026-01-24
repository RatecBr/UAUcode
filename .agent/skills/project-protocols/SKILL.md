---
name: project-protocols
description: Mandatory project standards for IMAGYNE (WebAR, Versioning, Supabase, GitHub Deploy) and Context Memory guidelines.
---

# Project Protocols & Standards

> **CRITICAL:** Start every session by reading `.agent/memory/SESSION_LOG.md` to restore context.

## 1. Context Retention Protocol (Memory)
- **Objective:** Maintain continuity across sessions (Application Restarts).
- **Action:** Before ending a turn or closing a major task, ALWAYS update the `.agent/memory/SESSION_LOG.md` file with a summary of the last 2 major interactions.
- **Reading:** Upon activation, ALWAYS check the last entries of `SESSION_LOG.md`.

## 2. Versioning Standard
- **Format:** `IMAGYNE V.1.XX - "KEYWORD"`
- **Example:** `IMAGYNE V.1.05 - SUPABASE`
- **Rule:** Every significant deployment or architecture change must increment the version and update `DOCUMENTATION.md`.

## 3. WebAR Architecture (Immutable)
- **Engine:** OpenCV.js (WASM) + ORB (800 Features) + VGA Processing.
- **Backend:** Serverless (Supabase Only). NO Node.js custom servers.
- **UX Pattern:** 
  - **Sticky Playback:** Media plays until explicit close or NEW target confirmed.
  - **Debounce:** 3-frame stability check for new targets.
  - **JIT Loading:** Background fetch (Blob) while current media plays.

## 4. Deploy Protocol (GitHub → Vercel)

### Prerequisites
- GitHub repository with Vercel integration configured
- Supabase project with all tables/buckets created

### Deployment Flow

```
1. LOCAL DEVELOPMENT
   └── npm run dev (localhost:8080)

2. PRE-DEPLOY CHECKS
   └── npm run build (must pass without errors)

3. COMMIT & PUSH
   └── git add .
   └── git commit -m "v1.XX - DESCRIPTION"
   └── git push origin main

4. AUTOMATIC DEPLOY
   └── Vercel detects push and deploys automatically
   └── Preview URL generated for review

5. PRODUCTION PROMOTION
   └── Merge to main branch → Auto-deploy to production
```

### GitHub Commit Convention

```
Format: "IMAGYNE vX.XX - KEYWORD: description"

Examples:
- "IMAGYNE v1.06 - AUTH: Fixed login flow with single Supabase client"
- "IMAGYNE v1.07 - SCANNER: Added debug mode for AR tracking"
```

### Environment Variables (Vercel Dashboard)

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://anzxgurkbpyegcibebfu.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key) |

### Rollback Procedure

```bash
# Via Git
git revert HEAD
git push origin main

# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"
```

## 5. Supabase Configuration

### Required Tables

| Table | Columns | Purpose |
|-------|---------|---------|
| `profiles` | id (uuid), email, role | User roles (admin/user) |
| `targets` | id, name, target_url, content_url, content_type | AR experiences |

### Required Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `target-images` | Reference images for recognition |
| `content-files` | Video, audio, 3D files |

### RLS Policies
- `profiles`: Users can read/update own profile (role changes require admin)
- `targets`: Public read, admin insert/update/delete

## 6. Authentication Architecture

### Single Client Pattern (CRITICAL)
- **ONE** Supabase client instance in `AuthContext.tsx`
- All components import `supabase` from `AuthContext`
- **NEVER** create `createClient()` in individual components

```typescript
// CORRECT: Import from AuthContext
import { supabase, useAuth } from '../AuthContext';

// WRONG: Creating new client
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(...); // DON'T DO THIS
```

---

> **Remember:** Always commit to GitHub, never deploy directly to Vercel CLI.
