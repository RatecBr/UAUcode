# IMAGYNE - WebAR Experience Platform

**IMAGYNE** is a high-performance Progressive Web App (PWA) for marker-based Augmented Reality (Image Recognition) directly in the browser. It allows users to scan physical images (posters, cards, labels) and instantly trigger rich media overlays (Video, Audio, 3D Models) without installing native apps.

---

## 🚀 Key Features

*   **Web-Based AR**: Runs 100% in the browser (Chrome, Safari, Edge) using OpenCV.js (WASM).
*   **Sticky Playback**: Content continues playing even if the camera loses track of the target, ensuring a seamless user experience.
*   **Zero-Latency Switching**: Uses Just-In-Time (JIT) Blob fetching to preload new content in the background while the current content plays, swapping instantly when ready.
*   **Admin Console**: Built-in dashboard to upload, manage, edit, and delete AR experiences.
*   **Performance Optimized**:
    *   **ORB Feature Limiting**: Restricts computationally expensive feature matching to the top 800 keypoints.
    *   **Internal Downsampling**: Processes camera feed at max 640px (VGA) width internally for speed, while displaying high-res video to the user.
    *   **Memory Management**: Reusable Canvas buffers to prevent Garbage Collection stutters.

---

## 🛠 Technology Stack

### Client (Frontend)
*   **Framework**: React 19 + TypeScript + Vite
*   **Computer Vision**: OpenCV.js (WebAssembly) with custom ORB implementation.
*   **UI/Styling**: CSS Modules (Glassmorphism design), Lucide React (Icons).
*   **3D Rendering**: Three.js (for GLB model overlays).

### Server (Backend)
*   **Runtime**: Node.js + Express
*   **Database**: SQLite (via `better-sqlite3`) - Zero config, file-based.
*   **Authentication**: JWT (JSON Web Tokens).
*   **Storage**: Local filesystem storage (`/storage` folder) for images and media assets.

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### 1. Clone & Install
```bash
# Install root dependencies (if any)
npm install

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 2. Run Development Environment
You need to run **both** the server and the client terminals.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Runs on localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Runs on https://localhost:8080 (HTTPS required for Camera)
```

> **Note on HTTPS:** The client uses `@vitejs/plugin-basic-ssl` to create a self-signed certificate. You will see a "Not Secure" warning in the browser. Click "Advanced" -> "Proceed to localhost" to accept it.

---

## 📱 Usage Guide

### 1. Admin Console (CMS)
Access `/admin` (e.g., `https://localhost:8080/admin`).
*   **Login**: Default credentials are `admin` / `admin123`.
*   **Create Experience**:
    *   **Name**: Title of the experience.
    *   **Target Image**: The physical image to be recognized (JPG/PNG). High contrast images work best.
    *   **Content File**: The media to play (MP4 Video, MP3 Audio, or GLB 3D Model).
*   **Edit/Delete**: Use the buttons in the list to manage existing experiences.

### 2. Scanner App
Access `/scanner` or click "Open Scanner" from dashboard.
*   **Permissions**: Allow Camera access when prompted.
*   **Detection**: Point camera at a target image upload in the Admin.
*   **Interaction**:
    *   Once detected, content plays automatically.
    *   Content remains active ("Sticky") even if you move the camera away.
    *   To stop, click "Close Experience" or simply point the camera at a **different** target to switch instantly.

---

## 🏛 System Architecture

### Image Recognition Pipeline (`processingFrame`)
1.  **Capture**: Video frame is captured from the `<video>` element.
2.  **Downsample**: Frame is drawn to an internal 640px Canvas.
3.  **Preprocessing**: Converted to Grayscale + CLAHE (Contrast Limited Adaptive Histogram Equalization) to improve detection in poor lighting.
4.  **Feature Extraction**: OpenCV ORB detects keypoints (Corners, edges) and descriptors.
5.  **Matching**: Descriptors are compared against the database of loaded targets using a brute-force Hamming distance matcher (KNN).
6.  **Geometry Check (RANSAC)**: If matches are found, `findHomography` checks if the points form a valid geometric plane (rejects random noise).
7.  **Result**: If 8+ inliers are found, it's a match.

### Smart Asset Loading (`launchContent`)
*   **Standard**: Old school AR loads content via URL, causing buffering.
*   **IMAGYNE Approach**:
    1.  User sees Target A -> System requests Target A Video as `Blob`.
    2.  Target A Video is completely downloaded to memory.
    3.  Video plays directly from memory (Instant seek, no buffer).
    4.  If User points at Target B:
    5.  Target A continues playing.
    6.  System downloads Target B in background.
    7.  Once B is ready -> A stops, B starts instantly.

---

## ⚡ Performance Tips for Targets

For the best AR experience, your Target Images should have:
1.  **High Contrast**: Sharp edges and distinct color transitions.
2.  **Asymmetry**: The image should not look the same if rotated 180 degrees.
3.  **Complexity**: Avoid simple geometric shapes or plain text. Use rich photos or complex illustrations.
4.  **Lighting**: Avoid glossy surfaces that create reflections (glare blinds the computer vision).

---

## 📂 Project Structure

```
/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/          # Scanner, Admin, Login
│   │   ├── recognition.ts  # OpenCV Logic Core
│   │   ├── overlayVideo.ts # Video Player Class
│   │   ├── ...
│   └── vite.config.ts      # HTTPS & Proxy Config
│
├── server/                 # Express Backend
│   ├── index.ts            # API Routes & DB
│   ├── storage/            # Uploaded Files
│   └── database.sqlite     # SQLite DB File
│
└── README.md
```
