"use client";

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';

type ImageItem = string | { src: string; alt?: string };

type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

const DEFAULT_IMAGES: ImageItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art'
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern sculpture'
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Digital artwork'
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Contemporary art'
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Geometric pattern'
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Textured surface'
  }
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: ImageItem[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '' }));
  }

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      return { src: image, original: image, alt: '' };
    }
    return { src: image.src || '', original: (image as any).original || image.src || '', alt: image.alt || '' };
  });

  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    original: usedImages[i].original,
    alt: usedImages[i].alt
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.8,
  minRadius = 1000,
  maxRadius = Infinity,
  maxVerticalRotationDeg = 20,
  dragSensitivity = 25,
  enlargeTransitionMs = 400,
  segments = 30, // Reduced from 45 for better performance
  openedImageWidth = '85vw',
  openedImageHeight = '85vh',
  imageBorderRadius = '24px',
  openedImageBorderRadius = '24px',
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const pointerTypeRef = useRef<'mouse' | 'pen' | 'touch'>('mouse');
  const openingRef = useRef(false);

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.style.overflow = 'hidden';
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    scrollLockedRef.current = false;
    document.body.style.overflow = '';
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
      const aspect = w / h;
      let basis = aspect >= 1.3 ? w : Math.min(w, h);
      
      let radius = basis * fit;
      radius = clamp(radius, minRadius, maxRadius);
      
      root.style.setProperty('--radius', `${Math.round(radius)}px`);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, minRadius, maxRadius, imageBorderRadius]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      let vX = clamp(vx, -1.4, 1.4) * 80;
      let vY = clamp(vy, -1.4, 1.4) * 80;
      const friction = 0.97;
      const step = () => {
        vX *= friction; vY *= friction;
        if (Math.abs(vX) < 0.01 && Math.abs(vY) < 0.01) return;
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = rotationRef.current.y + vX / 200;
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [maxVerticalRotationDeg, stopInertia]
  );

  const openItem = (el: HTMLElement) => {
    if (openingRef.current) return;
    openingRef.current = true;
    lockScroll();
    focusedElRef.current = el;

    const parent = el.parentElement as HTMLElement;
    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);

    // Smoothly rotate the dome to face the clicked image
    const targetX = -parentRot.rotateX;
    const targetY = -parentRot.rotateY;
    
    // Animate to target
    const startX = rotationRef.current.x;
    const startY = rotationRef.current.y;
    const duration = 500;
    const startTime = performance.now();

    const animateRotation = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress * (2 - progress);
      const curX = startX + (targetX - startX) * ease;
      const curY = startY + (targetY - startY) * ease;
      rotationRef.current = { x: curX, y: curY };
      applyTransform(curX, curY);
      if (progress < 1) requestAnimationFrame(animateRotation);
    };
    requestAnimationFrame(animateRotation);

    el.style.visibility = 'hidden';
    rootRef.current?.setAttribute('data-enlarging', 'true');

    const overlay = document.createElement('div');
    overlay.className = 'enlarge-overlay';
    overlay.style.cssText = `
      position: fixed; left: 50%; top: 50%;
      width: ${openedImageWidth}; height: ${openedImageHeight};
      transform: translate(-50%, -50%) scale(0.5); opacity: 0;
      z-index: 9999; border-radius: ${openedImageBorderRadius};
      overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.8);
      transition: all ${enlargeTransitionMs}ms cubic-bezier(0.19, 1, 0.22, 1);
      background: #000; display: flex; align-items: center; justify-content: center;
    `;

    const originalSrc = parent.dataset.original || (el.querySelector('img') as HTMLImageElement).src;
    const img = document.createElement('img');
    img.src = originalSrc;
    img.style.cssText = 'max-width:100%; max-height:100%; object-fit:contain;';
    overlay.appendChild(img);
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 50);
    
    overlay.onclick = () => {
      overlay.style.opacity = '0';
      overlay.style.transform = 'translate(-50%, -50%) scale(0.9)';
      setTimeout(() => {
        overlay.remove();
        if (focusedElRef.current) focusedElRef.current.style.visibility = 'visible';
        rootRef.current?.removeAttribute('data-enlarging');
        openingRef.current = false;
        unlockScroll();
      }, enlargeTransitionMs);
    };
  };

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (openingRef.current) return;
        stopInertia();
        const evt = event as PointerEvent;
        pointerTypeRef.current = (evt.pointerType as any) || 'mouse';
        draggingRef.current = true;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
      },
      onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0] }) => {
        if (openingRef.current || !draggingRef.current || !startPosRef.current) return;
        const evt = event as PointerEvent;
        const dx = evt.clientX - startPosRef.current.x;
        const dy = evt.clientY - startPosRef.current.y;
        
        const nextX = clamp(startRotRef.current.x - dy / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = startRotRef.current.y + dx / dragSensitivity;
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);

        if (last) {
          draggingRef.current = false;
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            const potential = (evt.target as Element).closest('.item__image') as HTMLElement;
            if (potential) openItem(potential);
          } else {
            startInertia(velArr[0] * dirArr[0], velArr[1] * dirArr[1]);
          }
        }
      }
    },
    { target: mainRef, eventOptions: { passive: false } }
  );

  const cssStyles = `
    .sphere-root {
      --radius: 600px;
      --circ: calc(var(--radius) * 3.14159);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
      background: transparent;
    }
    .stage {
      width: 100%; height: 100%; display: grid; place-items: center;
      position: absolute; inset: 0; perspective: calc(var(--radius) * 2.5);
      touch-action: none;
      user-select: none;
    }
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform; position: absolute; transform-style: preserve-3d;
    }
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute; top: -999px; bottom: -999px; left: -999px; right: -999px;
      margin: auto; transform-origin: 50% 50%; backface-visibility: hidden;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)))) 
                 translateZ(var(--radius));
    }
    .item__image {
      position: absolute; inset: 12px; border-radius: 20px;
      overflow: hidden; cursor: pointer; 
      will-change: transform;
      background: black;
    }
    .item__image img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .scrim {
      position: fixed; inset: 0; background: rgba(0,0,0,0.9);
      backdrop-filter: blur(10px); opacity: 0; pointer-events: none;
      transition: opacity 0.5s ease; z-index: 9998;
    }
    .sphere-root[data-enlarging="true"] .scrim { opacity: 1; pointer-events: all; }
  `;

  return (
    <div
      ref={rootRef}
      className="sphere-root relative w-full h-full overflow-hidden"
      style={{ '--segments-x': segments, '--segments-y': segments } as any}
    >
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <main ref={mainRef} className="stage">
        <div ref={sphereRef} className="sphere">
          {items.map((item, i) => (
            <div
              key={i}
              className="sphere-item"
              style={{ 
                '--offset-x': item.x, 
                '--offset-y': item.y,
                '--item-size-x': item.sizeX,
                '--item-size-y': item.sizeY
              } as any}
              data-offset-x={item.x}
              data-offset-y={item.y}
              data-size-x={item.sizeX}
              data-size-y={item.sizeY}
              data-src={item.src}
              data-original={(item as any).original}
            >
              <div className="item__image">
                <img src={item.src} alt={item.alt} loading="lazy" draggable="false" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <div className="scrim" onClick={() => (focusedElRef.current?.parentElement?.querySelector('.enlarge-overlay') as HTMLElement)?.click()} />
    </div>
  );
}
