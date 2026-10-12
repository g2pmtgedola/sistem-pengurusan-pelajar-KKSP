import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function InteractiveLogo({ size = 'md', className = '' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [transparentSrc, setTransparentSrc] = useState(null);

  // Remove white background dynamically using canvas so logo is 100% transparent and unclipped
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/logo-kksp.png';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Convert near-white background pixels to transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 230 && g > 230 && b > 230) {
            data[i + 3] = 0; // Alpha to 0
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setTransparentSrc(canvas.toDataURL('image/png'));
      } catch (e) {
        // Fallback to direct image
        setTransparentSrc('/logo-kksp.png');
      }
    };
    img.onerror = () => {
      setTransparentSrc('/logo-kksp.png');
    };
  }, []);

  const handleClick = (e) => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 800);

    // Fire cute micro confetti on click
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 35,
        spread: 65,
        origin: { x, y },
        colors: ['#f59e0b', '#1e3a8a', '#3b82f6', '#10b981', '#ef4444'],
        scalar: 0.75,
        ticks: 120
      });
    } catch (err) {
      // safe fallback
    }
  };

  // Dimensions adjusted so full orange and blue brackets are never cut off
  const dimensions = {
    sm: { container: 'h-9 px-3 py-1', img: 'h-6' },
    md: { container: 'h-12 px-3.5 py-1.5', img: 'h-8 sm:h-9' },
    lg: { container: 'h-16 px-5 py-2', img: 'h-11 sm:h-12' }
  }[size] || { container: 'h-12 px-3.5 py-1.5', img: 'h-8 sm:h-9' };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Klik untuk animasi interaktif Kolej Komuniti Sungai Petani!"
      className={`group relative select-none cursor-pointer inline-flex items-center gap-2.5 rounded-2xl bg-white/95 transition-all duration-300 ${dimensions.container} ${className} ${
        isHovered
          ? 'scale-105 shadow-[0_10px_25px_-5px_rgba(30,58,138,0.25),0_0_18px_rgba(245,158,11,0.45)] border-amber-400'
          : 'shadow-[4px_4px_12px_rgba(160,175,195,0.35),-4px_-4px_12px_rgba(255,255,255,0.95)] border-slate-200'
      } border`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Full Official Logo Image with no clipping */}
      <div
        className={`relative flex items-center justify-center transition-transform duration-500 ease-out ${
          isRotating ? 'rotate-[360deg] scale-110' : isHovered ? 'rotate-1 scale-105' : ''
        }`}
      >
        <img
          src={transparentSrc || '/logo-kksp.png'}
          alt="Kolej Komuniti Sungai Petani"
          className={`${dimensions.img} w-auto object-contain transition-all duration-300 ${
            !transparentSrc ? 'mix-blend-multiply' : ''
          }`}
          style={{
            maxWidth: 'none',
            display: 'block'
          }}
        />

        {/* Floating Sparkle on Hover */}
        {isHovered && (
          <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping pointer-events-none" />
        )}
      </div>

      {/* Interactive Pulse Dot Indicator */}
      <div className="flex items-center gap-1 pl-0.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </div>
  );
}
