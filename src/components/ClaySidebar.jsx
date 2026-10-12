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
  Layers, 
  ChevronRight, 
  ShieldCheck,
  UserCog,
  LogOut,
  GraduationCap
} from 'lucide-react';
import InteractiveLogo from './InteractiveLogo';

export default function ClaySidebar({ activeTab, setActiveTab, counts, currentUser, onLogout }) {
  const isAdmin = currentUser?.role === 'admin';

  // Base menu items
  const allMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Menu Utama', 
      sublabel: 'Ringkasan Sistem',
      icon: Home,
      badge: 'PRO',
      badgeColor: 'clay-badge-blue'
    },
    { 
      id: 'students', 
      label: 'Maklumat Pelajar', 
      sublabel: 'Profil, Rumah & Carian',
      icon: Users,
      badge: counts?.students || 20,
      subBadge: 'A',
      badgeColor: 'clay-badge-green'
    },
    { 
      id: 'academic', 
      label: 'Pengurusan Akademik', 
      sublabel: 'Rekod CGPA Semester Siswa',
      icon: GraduationCap,
      badge: 'CGPA',
      badgeColor: 'clay-badge-blue'
    },
    { 
      id: 'enrollment', 
      label: 'Enrolmen Tahunan', 
      sublabel: 'Statistik 2015-2026',
      icon: TrendingUp,
      badge: counts?.enrollment || 72,
      subBadge: '1',
      badgeColor: 'clay-badge-red'
    },
    { 
      id: 'programs', 
      label: 'Pelaksanaan Program', 
      sublabel: 'Kolej ke Antarabangsa',
      icon: Award,
      badge: counts?.programs || 8,
      subBadge: '2',
      badgeColor: 'clay-badge-orange'
    },
    { 
      id: 'spider', 
      label: 'Spider Web Graph', 
      sublabel: '6-Dimensi Holistik',
      icon: Radar,
      badge: '6D',
      badgeColor: 'clay-badge-blue'
    },
    { 
      id: 'scholarships', 
      label: 'BKPKK & Biasiswa', 
      sublabel: 'Elaun Sara Hidup KPT',
      icon: DollarSign,
      badge: counts?.scholarships || 6,
      badgeColor: 'clay-badge-green'
    },
    { 
      id: 'clubs', 
      label: 'Kelab & Persatuan', 
      sublabel: 'Aktiviti Siswa & JPP',
      icon: Compass,
      badge: counts?.clubs || 5,
      badgeColor: 'clay-badge-orange'
    },
    { 
      id: 'analytics', 
      label: 'Potensi & Pencapaian', 
      sublabel: 'Penarafan Pelajar Terbaik',
      icon: BarChart3,
      badge: 'TOP',
      badgeColor: 'clay-badge-red'
    },
    { 
      id: 'calendar', 
      label: 'Takwim & Jadual JPP', 
      sublabel: 'Giliran Bertugas Harian',
      icon: Calendar,
      badge: '5H',
      badgeColor: 'clay-badge-blue'
    },
  ];

  // Pensyarah kelas tidak perlu view Enrolmen Tahunan dan JPP
  const menuItems = allMenuItems.filter(item => {
    if (!isAdmin) {
      if (item.id === 'enrollment' || item.id === 'calendar') {
        return false;
      }
    }
    return true;
  });

  // TAB KHUSUS ADMIN: Pengurusan Ahli (Boleh edit, delete dan reset password)
  if (isAdmin) {
    menuItems.push({
      id: 'users',
      label: 'Pengurusan Ahli',
      sublabel: 'Kakitangan & Kata Laluan',
      icon: UserCog,
      badge: 'ADMIN',
      badgeColor: 'clay-badge-orange'
    });
  }

  const userInitials = currentUser?.nama 
    ? currentUser.nama.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'KK';

  return (
    <aside className="w-80 p-5 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Card with Interactive Logo */}
      <div className="clay-card p-4 mb-5 border border-white/80">
        <div className="flex flex-col items-center gap-2">
          <InteractiveLogo size="lg" className="w-full justify-center" />
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-600 font-bold tracking-tight">UPP • Portal Rasmi KKSP</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills (Identical to reference mockup clay pills) */}
      <nav className="flex-1 space-y-3 overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          <span>MENU SISTEM</span>
          {isAdmin && (
            <span className="text-[9px] text-amber-700 bg-amber-100 font-black px-2 py-0.5 rounded-full border border-amber-300">
              MOD PENTADBIR
            </span>
          )}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group text-left px-4 py-3.5 rounded-2xl transition-all flex items-center justify-between cursor-pointer ${
                isActive
                  ? 'clay-card-pill border-2 border-amber-300 ring-2 ring-amber-400/20 translate-x-1'
                  : 'clay-btn'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-white/80 text-slate-600 group-hover:text-amber-600 shadow-xs'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-slate-900 font-black' : 'text-slate-700'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {/* Claymorphic 3D Round Badge with optional nested mini badge */}
              <div className="relative flex-shrink-0 ml-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white ${item.badgeColor}`}
                >
                  {item.badge}
                </div>
                {item.subBadge && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white font-extrabold text-[8px] flex items-center justify-center border-2 border-white shadow-xs">
                    {item.subBadge}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom User / Info Pill */}
      <div className="mt-4 pt-3 border-t border-slate-200/60">
        <div className="clay-card-sm p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs shrink-0 ${
                isAdmin ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300' : 'bg-indigo-600 text-white'
              }`}>
                {userInitials}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-800 block truncate">
                  {currentUser?.nama || 'Pengguna Sistem'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block truncate">
                  {isAdmin ? 'Pentadbir Sistem (Admin)' : `Pensyarah (${currentUser?.assignedClass || 'Umum'})`}
                </span>
              </div>
            </div>

            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
              Aktif
            </span>
          </div>

          {/* Logout Action Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-black text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 hover:border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Keluar Sistem</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

