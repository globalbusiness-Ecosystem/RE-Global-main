/**
 * Device Media Service for Aladdin AI
 * Handles camera, microphone, and image processing
 * Supports iOS, Android, and desktop browsers
 */

export interface DeviceMediaConfig {
  enableCamera?: boolean;
  enableMicrophone?: boolean;
  imageQuality?: number; // 0.1 - 1.0
  maxImageSize?: number; // bytes
}

export interface CapturedMedia {
  type: 'camera' | 'gallery' | 'audio';
  data: Blob;
  url: string;
  timestamp: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size: number;
  };
}

export interface MediaError {
  code: string;
  message: string;
  recoveryHint?: string;
}

class DeviceMediaService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private isIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  private isAndroid = typeof window !== 'undefined' && /Android/.test(navigator.userAgent);

  /**
   * Request camera access
   */
  async requestCameraAccess(videoElement: HTMLVideoElement): Promise<MediaStream> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported on this device');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;
      this.videoElement = videoElement;

      return this.stream;
    } catch (error: any) {
      const mediaError: MediaError = {
        code: error.name || 'CAMERA_ERROR',
        message: this.getCameraErrorMessage(error),
        recoveryHint: this.getCameraRecoveryHint(error),
      };
      throw mediaError;
    }
  }

  /**
   * Request microphone access only
   */
  async requestMicrophoneAccess(): Promise<MediaStream> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access not supported');
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error: any) {
      const mediaError: MediaError = {
        code: error.name || 'MIC_ERROR',
        message: this.getMicErrorMessage(error),
      };
      throw mediaError;
    }
  }

  /**
   * Capture photo from camera
   */
  async capturePhoto(quality: number = 0.8): Promise<CapturedMedia> {
    try {
      if (!this.videoElement || !this.stream) {
        throw new Error('Camera not initialized');
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');

      const video = this.videoElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Convert to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) reject(new Error('Failed to capture photo'));
            else {
              resolve({
                type: 'camera',
                data: blob,
                url: URL.createObjectURL(blob),
                timestamp: new Date(),
                metadata: {
                  width: canvas.width,
                  height: canvas.height,
                  size: blob.size,
                },
              });
            }
          },
          'image/jpeg',
          quality
        );
      });
    } catch (error: any) {
      throw {
        code: 'PHOTO_CAPTURE_ERROR',
        message: error.message,
      };
    }
  }

  /**
   * Open gallery and select image
   */
  async selectFromGallery(): Promise<CapturedMedia> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) {
          reject({ code: 'NO_FILE', message: 'No image selected' });
          return;
        }

        try {
          // Validate file
          if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
          }

          const maxSize = 10 * 1024 * 1024; // 10MB
          if (file.size > maxSize) {
            throw new Error('Image size exceeds 10MB limit');
          }

          // Get image dimensions
          const img = new Image();
          img.onload = () => {
            resolve({
              type: 'gallery',
              data: file,
              url: URL.createObjectURL(file),
              timestamp: new Date(),
              metadata: {
                width: img.width,
                height: img.height,
                size: file.size,
              },
            });
          };
          img.src = URL.createObjectURL(file);
        } catch (error: any) {
          reject({
            code: 'FILE_VALIDATION_ERROR',
            message: error.message,
          });
        }
      };

      input.click();
    });
  }

  /**
   * Upload media to server
   */
  async uploadMedia(media: CapturedMedia, endpoint: string = '/api/upload-media'): Promise<{ url: string; id: string }> {
    try {
      const formData = new FormData();
      formData.append('file', media.data);
      formData.append('type', media.type);
      formData.append('metadata', JSON.stringify(media.metadata));

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        url: result.url,
        id: result.id,
      };
    } catch (error: any) {
      throw {
        code: 'UPLOAD_ERROR',
        message: error.message,
      };
    }
  }

  /**
   * Process image for property analysis
   */
  async analyzePropertyImage(imageUrl: string): Promise<any> {
    try {
      const response = await fetch('/api/analyze-property-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      return await response.json();
    } catch (error: any) {
      throw {
        code: 'ANALYSIS_ERROR',
        message: error.message,
      };
    }
  }

  /**
   * Stop camera stream
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.videoElement = null;
    }
  }

  /**
   * Check device capabilities
   */
  getDeviceCapabilities() {
    return {
      hasCameraSupport: !!navigator.mediaDevices?.getUserMedia,
      hasMicrophoneSupport: !!navigator.mediaDevices?.getUserMedia,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      canAccessCamera: !this.isIOS || this.isIOS, // iOS has limited access
    };
  }

  /**
   * Helper: Get camera error message in user language
   */
  private getCameraErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Camera permission denied. Please enable camera access in settings.';
    }
    if (error.name === 'NotFoundError') {
      return 'No camera found on this device.';
    }
    if (error.name === 'NotSupportedError') {
      return 'Camera access not supported in this browser.';
    }
    return 'Failed to access camera. Please try again.';
  }

  /**
   * Helper: Get microphone error message
   */
  private getMicErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError') {
      return 'Microphone permission denied.';
    }
    if (error.name === 'NotFoundError') {
      return 'No microphone found on this device.';
    }
    return 'Failed to access microphone.';
  }

  /**
   * Helper: Get recovery hint for camera errors
   */
  private getCameraRecoveryHint(error: any): string {
    if (error.name === 'NotAllowedError') {
      return 'iOS users: Go to Settings > [Your App] > Camera and enable access';
    }
    if (error.name === 'NotFoundError') {
      return 'Try using a device with a built-in camera';
    }
    return 'Try restarting the app or your device';
  }
}

// Export singleton instance
export const deviceMediaService = new DeviceMediaService();
