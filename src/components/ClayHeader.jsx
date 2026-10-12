import React from 'react';
import InteractiveLogo from './InteractiveLogo';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap,
  Layers,
  LogOut
} from 'lucide-react';

export default function ClayHeader({ 
  totalStudents, 
  currentEnrollment, 
  activeLayout, 
  setActiveLayout,
  currentUser,
  onLogout
}) {
  const isAdmin = currentUser?.role === 'admin';
  const userInitials = currentUser?.nama 
    ? currentUser.nama.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'KK';

  return (
    <header className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Kolej Info */}
      <div className="flex items-center gap-4">
        <InteractiveLogo size="md" />

        <div className="hidden sm:block text-xs font-black text-slate-700 uppercase tracking-tight">
          SISTEM PENGURUSAN AKTIVITI & MAKLUMAT PELAJAR
        </div>
      </div>

      {/* Center / Right: Layout Switcher, Live Counter Pill, and User Info */}
      <div className="flex items-center gap-3">
        {/* Dual Layout Switcher (Windows Display vs Phone / Tablet Display) */}
        <div className="clay-card-pill p-1.5 flex items-center gap-1.5">
          <button
            onClick={() => setActiveLayout('windows')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeLayout === 'windows'
                ? 'clay-btn-active text-indigo-700 font-extrabold shadow-inner'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Paparan Windows</span>
          </button>

          <button
            onClick={() => setActiveLayout('phone')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeLayout === 'phone'
                ? 'clay-btn-active text-amber-600 font-extrabold shadow-inner'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Paparan Phone / Tablet</span>
          </button>
        </div>

        {/* Total Students Pill with 3D Badge */}
        <div className="clay-card-pill px-3.5 py-1.5 flex items-center gap-2.5">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">
              {!isAdmin && currentUser?.assignedClass && currentUser.assignedClass !== 'Semua Kelas'
                ? `Pelajar (${currentUser.assignedClass})`
                : 'Pelajar'}
            </span>
            <span className="text-xs font-black text-slate-800">
              {totalStudents} <span className="text-[10px] font-medium text-slate-500">Orang</span>
            </span>
          </div>
          <div className="w-6 h-6 rounded-full clay-badge-green text-white font-bold text-[10px] flex items-center justify-center">
            ✓
          </div>
        </div>

        {/* Current User Pill & Logout */}
        {currentUser && (
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-300">
            <div className="clay-card-pill px-3 py-1.5 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                isAdmin ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300' : 'bg-indigo-600 text-white'
              }`}>
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-black text-slate-900 block truncate max-w-[130px]">
                  {currentUser.nama}
                </span>
                <span className="text-[9px] font-bold text-slate-500 block">
                  {isAdmin ? 'Admin UPP' : `Pensyarah (${currentUser?.assignedClass || 'Umum'})`}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Log Keluar Sistem"
                className="clay-btn w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

