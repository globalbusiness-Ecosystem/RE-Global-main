'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Maximize2, Minimize2, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { panoramaLoader, debounce, throttle, getOptimalCanvasResolution } from '@/lib/vr-tour-utils';

interface UltraPanormicViewerProps {
  panoramaUrl: string;
  title: string;
  onClose: () => void;
  quality?: '4k' | '2k' | '1080p';
}

interface ViewerState {
  yaw: number;
  pitch: number;
  zoom: number;
  isDragging: boolean;
  startX: number;
  startY: number;
}

export const UltraPanormicViewer = ({
  panoramaUrl,
  title,
  onClose,
  quality = '2k',
}: UltraPanormicViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number>();
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);
  const stateRef = useRef<ViewerState>({
    yaw: 0, pitch: 0, zoom: 1, isDragging: false, startX: 0, startY: 0,
  });
  const metricsRef = useRef({ frameCount: 0, lastTime: Date.now() });

  useEffect(() => {
    const loadImage = async () => {
      try {
        const img = await panoramaLoader.loadImage(panoramaUrl);
        imageRef.current = img;
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load panorama:', error);
        setIsLoading(false);
      }
    };
    loadImage();
  }, [panoramaUrl]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height, pixelRatio } = getOptimalCanvasResolution();
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width / pixelRatio}px`;
    canvas.style.height = `${height / pixelRatio}px`;
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
      contextRef.current = ctx;
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const img = imageRef.current;
    if (!canvas || !ctx || !img) return;
    const { yaw, pitch, zoom } = stateRef.current;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    const centerX = w / 2;
    const centerY = h / 2;
    const scale = Math.min(w, h) * zoom * 0.4;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - centerX) / scale;
        const dy = (y - centerY) / scale;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 1) continue;
        const theta = Math.asin(distance);
        const phi = Math.atan2(dy, dx);
        const rotatedLon = phi + yaw;
        const rotatedLat = Math.atan2(Math.sin(theta) * Math.sin(pitch), Math.cos(theta)) + pitch;
        const u = ((rotatedLon / Math.PI) + 1) / 2;
        const v = (Math.asin(Math.sin(rotatedLat)) / Math.PI) + 0.5;
        const px = (u * img.width) % img.width;
        const py = (v * img.height) % img.height;
        const ix = Math.floor(px);
        const iy = Math.floor(py);
        const fx = px - ix;
        const fy = py - iy;
        const imgData = ctx.getImageData(ix, iy, 2, 2);
        const data = imgData.data;
        const r = Math.floor((1 - fx) * (1 - fy) * data[0] + fx * (1 - fy) * data[4] + (1 - fx) * fy * data[8 * 4] + fx * fy * data[12 * 4]);
        ctx.fillStyle = `rgb(${r}, ${r}, ${r})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    metricsRef.current.frameCount++;
    const now = Date.now();
    if (now - metricsRef.current.lastTime >= 1000) {
      setFps(metricsRef.current.frameCount);
      metricsRef.current.frameCount = 0;
      metricsRef.current.lastTime = now;
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    setupCanvas();
    const loop = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isLoading, setupCanvas, render]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    stateRef.current.isDragging = true;
    stateRef.current.startX = e.clientX;
    stateRef.current.startY = e.clientY;
  }, []);

  const handleMouseMove = useCallback(
    throttle((e: React.MouseEvent) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.startX;
      const dy = e.clientY - stateRef.current.startY;
      stateRef.current.yaw -= dx * 0.01;
      stateRef.current.pitch += dy * 0.01;
      stateRef.current.startX = e.clientX;
      stateRef.current.startY = e.clientY;
    }, 16), []
  );

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  const handleWheel = useCallback(
    debounce((e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.zoom += (e.deltaY > 0 ? -0.1 : 0.1);
      stateRef.current.zoom = Math.max(0.5, Math.min(4, stateRef.current.zoom));
    }, 50), []
  );

  const handleReset = useCallback(() => {
    stateRef.current = { yaw: 0, pitch: 0, zoom: 1, isDragging: false, startX: 0, startY: 0 };
  }, []);

  const handleFullscreen = useCallback(() => {
    const elem = canvasRef.current;
    if (!elem) return;
    if (!isFullscreen) {
      elem.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Zap className="w-12 h-12 text-yellow-400" />
          </div>
          <p className="text-white text-lg">{title}</p>
          <p className="text-gray-400 text-sm mt-2">Loading 360° panorama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <h2 className="text-white font-bold text-lg">{title}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleReset} title="Reset view">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleFullscreen} title="Fullscreen">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={onClose} title="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-gray-400 text-xs bg-black bg-opacity-50 p-2 rounded">
        <p>FPS: {fps}</p>
        <p>Zoom: {stateRef.current.zoom.toFixed(1)}x</p>
      </div>
    </div>
  );
};

export default UltraPanormicViewer;
