/* eslint-disable @typescript-eslint/no-explicit-any */
// OpenCV type declaration (approximate)
declare global {
    interface Window {
        cv: any;
    }
}

export interface RecognitionResult {
    detected: boolean;
    targetId: number | null;
    confidence: number;
    homography: any | null;
}

interface StoredTarget {
    id: number;
    descriptors: any;
    keypoints: any;
}

export class ImageRecognizer {
    private orb: any;
    private bf: any;
    private targets: StoredTarget[] = [];
    private ready: boolean = false;
    private processingCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;

    constructor() {
        this.processingCanvas = document.createElement('canvas');
        this.ctx = this.processingCanvas.getContext('2d', { willReadFrequently: true });
        this.checkCv();
    }

    private checkCv() {
        if (window.cv && window.cv.ORB) {
            this.init();
        } else {
            setTimeout(() => this.checkCv(), 100);
        }
    }

    private init() {
        try {
            const cv = window.cv;
            // Simplify constructor to avoid UnboundTypeError (Signature mismatch in Wasm)
            // OPTIMIZATION: Reduce Feature Limit from 2500 -> 800
            // This drastically reduces matching time (O(N*M)) with minimal accuracy loss for distinct targets.
            this.orb = new cv.ORB(800, 1.2);

            this.bf = new cv.BFMatcher(cv.NORM_HAMMING, false);
            this.ready = true;
            console.log("OpenCV Enhanced Engine initialized (Robust ORB)");
        } catch (e) {
            console.error("OpenCV init error:", e);
        }
    }

    public isReady() {
        return this.ready;
    }

    public addTarget(id: number, imgElement: HTMLImageElement | HTMLCanvasElement) {
        if (!this.ready) return false;
        const cv = window.cv;

        try {
            const src = cv.imread(imgElement);
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            // Apply CLAHE to target as well for consistency
            const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
            const enhancedGray = new cv.Mat();
            clahe.apply(gray, enhancedGray);

            const keypoints = new cv.KeyPointVector();
            const descriptors = new cv.Mat();

            // Detect on enhanced image
            this.orb.detectAndCompute(enhancedGray, new cv.Mat(), keypoints, descriptors);

            if (!descriptors.empty()) {
                this.targets.push({
                    id,
                    descriptors, // Keep descriptors in memory
                    keypoints // Keep keypoints for geometry check
                });
                console.log(`Target ${id} loaded. Keypoints: ${keypoints.size()}`);
            }

            src.delete();
            gray.delete();
            enhancedGray.delete();
            clahe.delete();
            return true;
        } catch (e) {
            console.error(`Failed to add target ${id}`, e);
            return false;
        }
    }

    public clearTargets() {
        this.targets.forEach(t => {
            if (t.descriptors && !t.descriptors.isDeleted()) t.descriptors.delete();
            if (t.keypoints && !t.keypoints.isDeleted()) t.keypoints.delete();
        });
        this.targets = [];
    }

    public processFrame(videoElement: HTMLVideoElement): RecognitionResult {
        if (!this.ready || this.targets.length === 0) {
            return { detected: false, targetId: null, confidence: 0, homography: null };
        }

        const cv = window.cv;
        let bestMatch: RecognitionResult = { detected: false, targetId: null, confidence: 0, homography: null };

        let src: any, gray: any, keypoints: any, descriptors: any, enhancedGray: any, clahe: any;

        try {
            const w = videoElement.videoWidth;
            const h = videoElement.videoHeight;

            if (!w || !h) return bestMatch;

            // OPTIMIZATION: Downscaling logic
            // We process at max 640px width (VGA) for speed, but display high res.
            const MAX_WIDTH = 640;
            const scale = Math.min(MAX_WIDTH / w, 1.0);
            const processW = Math.floor(w * scale);
            const processH = Math.floor(h * scale);

            if (this.processingCanvas.width !== processW || this.processingCanvas.height !== processH) {
                this.processingCanvas.width = processW;
                this.processingCanvas.height = processH;
            }

            if (this.ctx) {
                // Draw resized image directly
                this.ctx.drawImage(videoElement, 0, 0, processW, processH);
                const imgData = this.ctx.getImageData(0, 0, processW, processH);
                src = cv.matFromImageData(imgData);
            } else {
                return bestMatch;
            }

            gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            // --- MAGIC SAUCE: Contrast Enhancement (CLAHE) ---
            // This allows seeing details in bad lighting or low contrast (like metallic labels)
            clahe = new cv.CLAHE(4.0, new cv.Size(8, 8)); // ClipLimit 4.0 for strong contrast
            enhancedGray = new cv.Mat();
            clahe.apply(gray, enhancedGray);

            keypoints = new cv.KeyPointVector();
            descriptors = new cv.Mat();

            this.orb.detectAndCompute(enhancedGray, new cv.Mat(), keypoints, descriptors);

            if (!descriptors.empty() && descriptors.rows > 0) {
                for (const target of this.targets) {
                    const matches = new cv.DMatchVectorVector();
                    this.bf.knnMatch(descriptors, target.descriptors, matches, 2);

                    const goodMatches = new cv.DMatchVector();
                    for (let i = 0; i < matches.size(); ++i) {
                        const m = matches.get(i).get(0);
                        const n = matches.get(i).get(1);
                        // Strict Ratio Test (0.75) reduces noise, but CLAHE helps valid points survive
                        // Relax to 0.8 for difficult targets
                        if (m.distance < 0.8 * n.distance) {
                            goodMatches.push_back(m);
                        }
                    }

                    const confidence = goodMatches.size();

                    if (confidence >= 8 && confidence > bestMatch.confidence) {
                        const srcPoints = new cv.Mat(confidence, 1, cv.CV_32FC2);
                        const dstPoints = new cv.Mat(confidence, 1, cv.CV_32FC2);

                        for (let i = 0; i < confidence; ++i) {
                            const m = goodMatches.get(i);
                            const kpFrame = keypoints.get(m.queryIdx);
                            const kpTarget = target.keypoints.get(m.trainIdx);

                            srcPoints.data32F[i * 2] = kpTarget.pt.x;
                            srcPoints.data32F[i * 2 + 1] = kpTarget.pt.y;
                            dstPoints.data32F[i * 2] = kpFrame.pt.x;
                            dstPoints.data32F[i * 2 + 1] = kpFrame.pt.y;
                        }

                        const mask = new cv.Mat();
                        // 10.0 reprojection error threshold for tolerance
                        const homography = cv.findHomography(srcPoints, dstPoints, cv.RANSAC, 10.0, mask);

                        if (homography && !homography.empty()) {
                            let inliers = 0;
                            for (let j = 0; j < mask.rows; j++) {
                                if (mask.data[j] === 1) inliers++;
                            }

                            // Strong geometry match confirmation
                            if (inliers >= 8) {
                                if (bestMatch.homography) bestMatch.homography.delete();
                                bestMatch = {
                                    detected: true,
                                    targetId: target.id,
                                    confidence: inliers,
                                    homography: homography
                                };
                            } else {
                                homography.delete();
                            }
                        }

                        srcPoints.delete();
                        dstPoints.delete();
                        mask.delete();
                    }

                    matches.delete();
                    goodMatches.delete();
                }
            }

        } catch (error) {
            console.error("Recognition Error", error);
        } finally {
            if (src && !src.isDeleted()) src.delete();
            if (gray && !gray.isDeleted()) gray.delete();
            if (enhancedGray && !enhancedGray.isDeleted()) enhancedGray.delete();
            if (clahe && !clahe.isDeleted()) clahe.delete();
            if (keypoints && !keypoints.isDeleted()) keypoints.delete();
            if (descriptors && !descriptors.isDeleted()) descriptors.delete();
        }

        return bestMatch;
    }
}
