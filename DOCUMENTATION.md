# IMAGYNE - WebAR Experience Platform

**IMAGYNE** is a high-performance Progressive Web App (PWA) for marker-based Augmented Reality (Image Recognition). It leverages **Supabase** for a scalable, serverless backend architecture.

**Version:** `IMAGYNE V.1.05 - Serverless Migration`

---

## 🚀 Key Features

*   **Serverless Architecture**: Logic handled by Supabase (Auth, DB, Storage) & Vercel. No custom backend server to maintain.
*   **Sticky Playback**: AR content "sticks" to the screen and persists even if tracking is lost, ensuring uninterrupted viewing.
*   **Zero-Latency Switching**: Instantly swaps content when a new target is detected using background JIT (Just-In-Time) loading.
*   **Performance First**:
    *   **OpenCV WASM**: Local, privacy-first image recognition.
    *   **Orbbec Features**: Optimized downsampling (VGA) and feature limiting (800 keypoints) for mobile FPS.
    *   **PWA**: Installable on iOS/Android.

---

## 🛠 Technology Stack

### Client (Frontend)
*   **Framework**: React 19 + TypeScript + Vite
*   **AR Engine**: OpenCV.js (WebAssembly)
*   **Backend as a Service**: **Supabase**
    *   **Auth**: Email/Password authentication.
    *   **Database**: PostgreSQL with Row Level Security (RLS).
    *   **Storage**: Asset bucketing for Targets/Content.
*   **Hosting**: Vercel (Recommended).

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Supabase Project (Free Tier is sufficient)

### 1. Environment Setup
1.  Clone repo:
    ```bash
    git clone <repo-url>
    cd IMAGYNE/client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure `src/supabaseClient.ts` with your credentials:
    ```typescript
    const SUPABASE_URL = 'https://your-project.supabase.co';
    const SUPABASE_ANON_KEY = 'your-anon-key';
    ```

### 2. Run Locally
```bash
# In /client directory
npm run dev
# Opens https://localhost:8080
```

---

## ☁️ Deployment (Vercel)

This project is optimized for Vercel.

1.  Push code to GitHub.
2.  Import project in Vercel.
3.  **Build Settings**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `client`
    *   **Build Command**: `vite build` (or `npm run build`)
    *   **Output Directory**: `dist`
4.  Deploy!

---

## 🏛 System Architecture

### Recognition Pipleline
1.  **Capture**: Video stream (480p/720p).
2.  **Process**: Downscale to 640px internal canvas -> Grayscale -> CLAHE.
3.  **Detect**: ORB Feature extraction (Max 800 features).
4.  **Match**: Hamming Distance (KNN) against loaded targets from Supabase.
5.  **Verify**: RANSAC Homography check (Stability Counter > 3 frames).

### Data Flow
*   **Admin**: React Admin -> Supabase Storage (Upload) -> `targets` Table (Insert URL).
*   **Scanner**: Fetch `targets` -> Preload Logic -> OpenCV Engine -> Overlay UI.

---

## 📝 Version History

*   **V.1.00**: Initial Prototype (Node.js Server).
*   **V.1.02**: Performance Patch (Blob Caching).
*   **V.1.04**: Stability Update (Sticky Playback).
*   **V.1.05**: Supabase Migration (Current).

---

## 📁 Project Structure

```
/
├── client/                 # Application Root
│   ├── src/
│   │   ├── pages/          # Scanner, Admin, Login
│   │   ├── recognition.ts  # Computer Vision Core
│   │   ├── supabaseClient.ts # DB Connection
│   │   ├── ...
│   ├── vite.config.ts      # Build Config
│   └── index.html          # Entry Point
│
└── DOCUMENTATION.md        # This file
```
