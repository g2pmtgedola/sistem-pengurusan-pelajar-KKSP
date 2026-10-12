import React, { useMemo } from 'react';
import { 
  Users, 
  Award, 
  DollarSign, 
  TrendingUp, 
  Compass, 
  Sparkles,
  ChevronRight,
  Monitor,
  Smartphone
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function MainDashboard({ 
  students, 
  enrollmentData, 
  programs, 
  scholarships, 
  clubs,
  setActiveTab,
  setActiveLayout,
  currentUser
}) {
  const totalStudents = students.length;
  const currentYearEnrollment = enrollmentData[enrollmentData.length - 1]?.count || 72;
  const totalPrograms = programs.length;
  const totalScholarshipFund = scholarships.reduce((acc, c) => acc + (Number(c.jumlah) || 0), 0);
  const totalClubs = clubs.length;

  const categoryCount = useMemo(() => {
    const counts = { PENGETAHUAN: 0, KEPIMPINAN: 0, KECERGASAN: 0, KEROHANIAN: 0 };
    programs.forEach(p => {
      if (counts[p.kategori] !== undefined) counts[p.kategori]++;
    });
    return counts;
  }, [programs]);

  const categoryChartData = {
    labels: ['Kecergasan', 'Kepimpinan', 'Kerohanian', 'Pengetahuan'],
    datasets: [
      {
        data: [
          categoryCount.KECERGASAN,
          categoryCount.KEPIMPINAN,
          categoryCount.KEROHANIAN,
          categoryCount.PENGETAHUAN
        ],
        backgroundColor: ['#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner (Deep Dark Navy with Glowing Buttons matching User Screenshot) */}
      <div className="clay-hero-dark p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          {/* Top Yellow Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-[#f59e0b] text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-md border border-amber-400">
            <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" /> KOLEJ KOMUNITI SUNGAI PETANI @ PROGRESS
          </div>

          {/* Bold White Title Matching Screenshot Size Exactly */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-sm uppercase">
            SISTEM MAKLUMAT & PENGURUSAN AKTIVITI PELAJAR
          </h1>

          {/* Subtitle with High-Contrast Off-White text */}
          <p className="text-slate-200 text-xs sm:text-sm mt-3 font-medium leading-relaxed max-w-2xl">
            Pusat sehenti pengurusan maklumat rekod siswa, enrolmen tahunan, pendaftaran program, analisis spider web, dan bantuan biasiswa dengan kemudahan dwi-paparan: **Desktop Windows** & **Mobile/Tablet**.
          </p>

          {/* Glowing Action Buttons (Exact replica of user screenshot) */}
          <div className="flex flex-wrap items-center gap-3.5 mt-6">
            <button
              onClick={() => setActiveTab('students')}
              className="px-4 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95"
            >
              <Users className="w-4 h-4 text-slate-950" /> Senarai Pelajar
            </button>

            <button
              onClick={() => setActiveTab('spider')}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_12px_rgba(255,255,255,0.25)] border border-slate-500/80 active:scale-95 backdrop-blur-xs"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" /> Analisis Spider Web
            </button>

            <button
              onClick={() => setActiveLayout('phone')}
              className="px-4 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-300 active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-slate-950" /> Uji Paparan Phone / Tablet
            </button>
          </div>
        </div>

        {/* Ambient subtle decorative shape */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      </div>

      {/* 5 Claymorphic Pill KPI Cards (Matching reference style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Pelajar */}
        <div 
          onClick={() => setActiveTab('students')}
          className="clay-card p-4 transition-transform hover:-translate-y-1 cursor-pointer flex items-center justify-between"
        >
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
              PELAJAR
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 truncate">{totalStudents}</div>
            <span className="text-[10px] text-emerald-600 font-bold block truncate">Rekod Berdaftar</span>
          </div>
          <div className="w-10 h-10 rounded-full clay-badge-green text-white font-black text-xs flex items-center justify-center flex-shrink-0">
            {totalStudents}
          </div>
        </div>

        {/* KPI 2: Enrolmen (Admin) ATAU Kelas Ditugaskan (Pensyarah) */}
        {currentUser?.role === 'pensyarah' ? (
          <div 
            onClick={() => setActiveTab('students')}
            className="clay-card p-4 transition-transform hover:-translate-y-1 cursor-pointer flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block truncate">
                KELAS ANDA
              </span>
              <div className="text-xl font-black text-slate-900 mt-1 truncate">
                {currentUser?.assignedClass || 'SPK 1A'}
              </div>
              <span className="text-[10px] text-indigo-600 font-bold block truncate">Pensyarah Kelas</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
              ✓
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setActiveTab('enrollment')}
            className="clay-card p-4 transition-transform hover:-translate-y-1 cursor-pointer flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
                ENROLMEN
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1 truncate">{currentYearEnrollment}</div>
              <span className="text-[10px] text-rose-600 font-bold block truncate">Tahun Semasa</span>
            </div>
            <div className="w-10 h-10 rounded-full clay-badge-red text-white font-black text-xs flex items-center justify-center flex-shrink-0">
              {currentYearEnrollment}
            </div>
          </div>
        )}

        {/* KPI 3: Program */}
        <div 
          onClick={() => setActiveTab('programs')}
          className="clay-card p-4 transition-transform hover:-translate-y-1 cursor-pointer flex items-center justify-between"
        >
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
              PROGRAM
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 truncate">{totalPrograms}</div>
            <span className="text-[10px] text-amber-600 font-bold block truncate">Aktiviti Siswa</span>
          </div>
          <div className="w-10 h-10 rounded-full clay-badge-orange text-white font-black text-xs flex items-center justify-center flex-shrink-0">
            {totalPrograms}
          </div>
        </div>

        {/* KPI 4: BKPKK */}
        <div 
          onClick={() => setActiveTab('scholarships')}
          className="clay-card p-4 transition-transform hover:-translate-y-1 cursor-pointer flex items-center justify-between"
        >
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
              BKPKK
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1 truncate">RM {(totalScholarshipFund / 1000).toFixed(1)}k</div>
            <span className="text-[10px] text-emerald-600 font-bold block truncate">Bantuan KPT</span>
          </div>
          <div className="w-10 h-10 rounded-full clay-badge-green text-white font-black text-xs flex items-center justify-center flex-shrink-0">
            {scholarships.length}
          </div>
        </div>

        {/* KPI 5: Kelab */}
        <div 
          onClick={() => setActiveTab('clubs')}
          className="clay-card p-4 transition-transform hover:-translate-y-1 cursor-pointer flex items-center justify-between"
        >
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
              KELAB
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 truncate">{totalClubs}</div>
            <span className="text-[10px] text-indigo-600 font-bold block truncate">JPP & Persatuan</span>
          </div>
          <div className="w-10 h-10 rounded-full clay-badge-blue text-white font-black text-xs flex items-center justify-center flex-shrink-0">
            {totalClubs}
          </div>
        </div>
      </div>

      {/* Middle Section: Doughnut breakdown and quick programs list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="clay-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block pb-2 border-b border-slate-200">
              Pecahan 4 Kategori Aktiviti
            </span>
            <div className="h-52 mt-4 flex items-center justify-center">
              <Doughnut 
                data={categoryChartData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-xs">
            <div className="clay-card-sm p-2 text-center">
              <span className="text-[9px] text-cyan-700 font-bold uppercase block">Kecergasan</span>
              <span className="font-black text-slate-800">{categoryCount.KECERGASAN}</span>
            </div>
            <div className="clay-card-sm p-2 text-center">
              <span className="text-[9px] text-blue-700 font-bold uppercase block">Kepimpinan</span>
              <span className="font-black text-slate-800">{categoryCount.KEPIMPINAN}</span>
            </div>
            <div className="clay-card-sm p-2 text-center">
              <span className="text-[9px] text-amber-700 font-bold uppercase block">Kerohanian</span>
              <span className="font-black text-slate-800">{categoryCount.KEROHANIAN}</span>
            </div>
            <div className="clay-card-sm p-2 text-center">
              <span className="text-[9px] text-purple-700 font-bold uppercase block">Pengetahuan</span>
              <span className="font-black text-slate-800">{categoryCount.PENGETAHUAN}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 clay-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Program & Pencapaian Siswa Terkini
              </span>
              <button
                onClick={() => setActiveTab('programs')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Lihat Semua ({programs.length}) →
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {programs.slice(0, 4).map((prog) => (
                <div key={prog.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-xs text-slate-900 block truncate" title={prog.namaProgram}>
                      {prog.namaProgram}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block truncate">
                      {prog.peringkat} • {prog.kategori} • {prog.peserta.length} Peserta
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap flex-shrink-0">
                    {prog.pencapaian.length > 22 ? prog.pencapaian.slice(0, 20) + '...' : prog.pencapaian}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Reka bentuk bersih tanpa pertindihan teks</span>
            <button
              onClick={() => setActiveTab('analytics')}
              className="font-extrabold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              Calon Tokoh Pelajar Terbaik →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

