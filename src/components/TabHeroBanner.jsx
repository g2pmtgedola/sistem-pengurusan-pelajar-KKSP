import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TabHeroBanner({
  badge = 'KOLEJ KOMUNITI SUNGAI PETANI',
  title,
  subtitle,
  children,
  badgeIcon: BadgeIcon = Sparkles
}) {
  return (
    <div className="clay-hero-dark p-6 sm:p-8 relative overflow-hidden mb-6">
      <div className="relative z-10 max-w-4xl">
        {/* Top Yellow Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-[#f59e0b] text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-md border border-amber-400">
          <BadgeIcon className="w-3.5 h-3.5 text-slate-950 fill-current" />
          <span>{badge}</span>
        </div>

        {/* Title Matching Screenshot Size Exactly */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-sm uppercase">
          {title}
        </h1>

        {/* Subtitle with High-Contrast Off-White Text */}
        {subtitle && (
          <p className="text-slate-200 text-xs sm:text-sm mt-3 font-medium leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}

        {/* Action Buttons with Glowing Clay/Neon Styles */}
        {children && (
          <div className="flex flex-wrap items-center gap-3.5 mt-6">
            {children}
          </div>
        )}
      </div>

      {/* Ambient subtle decorative shape */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute right-20 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}
