'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const SESSION_STORAGE_KEY = 'pixelverse_loader_shown';
// CYCLE_SEC_AT_50 is 3.45s in MetalFrameCross, so 3500ms allows the full animation cycle to showcase
const DEFAULT_MIN_DISPLAY_TIME = 3500;
const FADE_DURATION = 500;

// WebGL animated metal cube loaded client-side only (ssr: false) to prevent hydration mismatches
const MetalFrameCross = dynamic(
  () => import('@/components/MetalFrameCross'),
  { ssr: false }
);

export interface LoadingScreenProps {
  /** Force the loader to stay visible indefinitely (for debugging/previewing) */
  forceVisible?: boolean;
  /** Custom minimum duration in milliseconds (default: 3500ms for full cycle) */
  minDisplayTime?: number;
}

export function LoadingScreen({
  forceVisible = false,
  minDisplayTime = DEFAULT_MIN_DISPLAY_TIME,
}: LoadingScreenProps) {
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [shouldRenderWebGL, setShouldRenderWebGL] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Inspect URL parameters for preview, freeze, or custom duration
    let isPreview = forceVisible;
    let isFrozen = false;
    let targetDuration = minDisplayTime;

    try {
      const sp = new URLSearchParams(window.location.search);
      const loaderParam = sp.get('loader');
      const previewParam = sp.get('preview_loader');
      const customDuration = Number(sp.get('duration'));

      if (customDuration && !isNaN(customDuration) && customDuration > 0) {
        targetDuration = customDuration;
      }
      if (loaderParam === 'preview' || previewParam === 'true') {
        isPreview = true;
      }
      if (loaderParam === 'freeze' || sp.get('freeze_loader') === 'true') {
        isPreview = true;
        isFrozen = true;
      }
    } catch {
      // In case searchParams parsing fails
    }

    // 2. Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && !isPreview) {
      setIsMounted(false);
      return;
    }

    // 3. Check sessionStorage flag (wrapped in try/catch)
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    } catch {
      // Protected browsing or cookies disabled
    }

    if (alreadyShown && !isPreview) {
      setIsMounted(false);
      return;
    }

    // 4. Client is ready to display the loader
    setShouldRenderWebGL(true);

    if (isFrozen) {
      // Frozen preview mode: stay visible indefinitely until dismissed manually
      return;
    }

    const startTime = Date.now();

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, targetDuration - elapsed);

      timerRef.current = setTimeout(() => {
        setIsFadingOut(true);

        timerRef.current = setTimeout(() => {
          setIsMounted(false);
          try {
            if (!isPreview) {
              sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
            }
          } catch {
            // ignore
          }
        }, FADE_DURATION);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      const handleLoad = () => {
        finishLoading();
      };
      window.addEventListener('load', handleLoad);
      // Fallback safeguard in case window.load hangs
      const fallbackTimer = setTimeout(finishLoading, Math.max(6000, targetDuration + 2000));

      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(fallbackTimer);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [forceVisible]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      id="pv-loading-screen"
      role="status"
      aria-label="Loading Pixelverse"
      aria-live="polite"
      className={`pv-loader-overlay fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#06070b] select-none transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        transitionDuration: `${FADE_DURATION}ms`,
      }}
    >
      {/* 
        WebGL Cube Container: 
        Override MetalFrameCross's built-in minWidth: 1200 / minHeight: 800
        by passing style={{ minWidth: 0, minHeight: 0, width: '100%', height: '100%' }}
        and constraining the parent container to responsive viewport-safe bounds.
      */}
      <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-[400px] md:h-[400px] max-w-[88vw] max-h-[50vh] flex items-center justify-center">
        {shouldRenderWebGL && (
          <MetalFrameCross
            speed={50}
            baseColor="#C0C0C0"
            distance={30}
            background="transparent"
            style={{
              minWidth: 0,
              minHeight: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </div>

      {/* Brand logo & loading line under the cube */}
      <div className="flex flex-col items-center gap-2 mt-2 sm:mt-4 text-center px-4">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gradient wordmark">
          Pixelverse
        </h1>
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#a9e9df)] animate-pulse" />
          <span>Loading games...</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
