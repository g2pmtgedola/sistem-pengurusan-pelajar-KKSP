import React from 'react';
import { 
  Home, 
  Users, 
  TrendingUp, 
  Award, 
  Radar, 
  DollarSign, 
  Compass, 
  BarChart3,
  Calendar,
  Activity,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Menu Utama / Ringkasan', icon: Home },
    { id: 'students', label: 'Maklumat Pelajar', icon: Users },
    { id: 'enrollment', label: 'Enrolmen Pelajar', icon: TrendingUp },
    { id: 'programs', label: 'Pelaksanaan Program', icon: Award },
    { id: 'spider', label: 'Gambaran Penglibatan (Spider Web)', icon: Radar },
    { id: 'scholarships', label: 'Urusan BKPKK & Biasiswa', icon: DollarSign },
    { id: 'clubs', label: 'Maklumat Kelab & Persatuan', icon: Compass },
    { id: 'analytics', label: 'Perincian & Potensi Pelajar', icon: BarChart3 },
    { id: 'jpp', label: 'Barisan JPP & Kepimpinan', icon: UserCheck },
    { id: 'calendar', label: 'Takwim & Jadual Bertugas', icon: Calendar },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 shadow-xl border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-lg">
          KK
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white uppercase">Sistem Aktiviti</h1>
          <p className="text-xs text-amber-400 font-medium">Kolej Komuniti Sungai Petani</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Navigasi Sistem
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20 translate-x-1'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] text-emerald-400 font-medium">Sistem Beroperasi (v2.0)</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Unit Pengurusan Pelajar (UPP) & Unit Hal Ehwal Pelajar KK Sungai Petani
        </p>
      </div>
    </aside>
  );
}

