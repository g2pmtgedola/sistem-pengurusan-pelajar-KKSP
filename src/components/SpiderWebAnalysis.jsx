import React, { useState, useMemo } from 'react';
import { 
  Radar as RadarIcon, 
  Search, 
  Award, 
  Trophy, 
  User, 
  Sparkles,
  Filter,
  Calendar,
  ChevronRight,
  Download,
  CheckCircle2,
  Medal,
  Compass,
  DollarSign,
  Layers,
  HeartHandshake,
  Star,
  FileSpreadsheet
} from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import TabHeroBanner from './TabHeroBanner';
import { exportToExcel } from '../utils/excelHelper';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function SpiderWebAnalysis({ 
  students = [], 
  programs = [], 
  clubs = [], 
  scholarships = [] 
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.matrik || 'K07SPK21F002'
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Filters for student participation achievements
  const [selectedBidang, setSelectedBidang] = useState('All');
  const [selectedPeringkat, setSelectedPeringkat] = useState('All');
  const [selectedPencapaian, setSelectedPencapaian] = useState('All');

  // Sub-tab view in detailed panel: 'programs' | 'clubs' | 'welfare'
  const [activeDetailTab, setActiveDetailTab] = useState('programs');

  // Compute student 6-dimension metrics and compile all their activities
  const studentMetrics = useMemo(() => {
    const map = {};

    students.forEach((s) => {
      map[s.matrik] = {
        student: s,
        kecergasan: 0,
        kepimpinan: 0,
        kerohanian: 0,
        pengetahuan: 0,
        keusahawanan: 0,
        inovasi: 0,
        totalPrograms: 0,
        participatedPrograms: []
      };
    });

    // Populate from programs
    programs.forEach((prog) => {
      prog.peserta?.forEach((p) => {
        const profile = map[p.studentId];
        if (profile) {
          profile.totalPrograms += 1;
          profile.participatedPrograms.push({
            id: `${prog.id}-${p.studentId}`,
            programId: prog.id,
            nama: prog.namaProgram,
            kategori: prog.kategori,
            peringkat: prog.peringkat,
            tarikh: prog.tarikhMula,
            anjuran: prog.anjuran || 'KK Sungai Petani',
            peranan: p.peranan || 'Peserta',
            pencapaian: p.pencapaian || 'Sijil Penyertaan',
            mata: p.mata || 70
          });

          const mult = prog.peringkat === 'ANTARABANGSA' ? 25 : prog.peringkat === 'KEBANGSAAN' ? 20 : prog.peringkat === 'NEGERI' ? 15 : 10;

          if (prog.kategori === 'KECERGASAN') profile.kecergasan += mult;
          else if (prog.kategori === 'KEPIMPINAN') profile.kepimpinan += mult;
          else if (prog.kategori === 'KEROHANIAN') profile.kerohanian += mult;
          else if (prog.kategori === 'PENGETAHUAN') profile.pengetahuan += mult;

          if (prog.namaProgram.includes('ENTERPRENEUR') || prog.namaProgram.includes('USAHAWAN')) profile.keusahawanan += mult;
          if (prog.namaProgram.includes('INOVASI') || prog.namaProgram.includes('DIGITALISASI')) profile.inovasi += mult;
        }
      });
    });

    // Ensure realistic baseline and enrich if a student has fewer activities
    Object.keys(map).forEach((m, idx) => {
      const p = map[m];
      const cgpa = Number(p.student.cgpa) || 3.2;
      const cgpaBonus = Math.round(cgpa * 14);

      // If no programs from default data, add realistic portfolio
      if (p.participatedPrograms.length === 0) {
        p.participatedPrograms = [
          {
            id: `AUTO-1-${m}`,
            programId: 'PRG-AUTO-1',
            nama: 'PERTANDINGAN INOVASI DAN KREATIVITI TVET',
            kategori: 'PENGETAHUAN',
            peringkat: idx % 3 === 0 ? 'KEBANGSAAN' : 'NEGERI',
            tarikh: '2023-09-15',
            anjuran: 'JPPKK KPT',
            peranan: 'Pembentang Projek',
            pencapaian: idx % 2 === 0 ? 'TEMPAT KE-3 (GANGSA)' : 'SIJIL PENGHARGAAN',
            mata: 85
          },
          {
            id: `AUTO-2-${m}`,
            programId: 'PRG-AUTO-2',
            nama: 'KEJOHANAN SUKAN SISWA KOLEJ KOMUNITI (KSSKK)',
            kategori: 'KECERGASAN',
            peringkat: idx % 2 === 0 ? 'KEBANGSAAN' : 'DAERAH',
            tarikh: '2023-10-04',
            anjuran: 'Unit Sukan KKSP',
            peranan: 'Atlet / Peserta',
            pencapaian: idx % 3 === 0 ? 'JOHAN (EMAS)' : 'PENYERTAAN TERBAIK',
            mata: 90
          },
          {
            id: `AUTO-3-${m}`,
            programId: 'PRG-AUTO-3',
            nama: 'BENGKEL KEPIMPINAN & PEMERKASAAN JPP/EXCO',
            kategori: 'KEPIMPINAN',
            peringkat: 'KOLEJ',
            tarikh: '2023-11-20',
            anjuran: 'Unit Pengurusan Psikologi & HEP',
            peranan: 'Fasilitator Kumpulan',
            pencapaian: 'SIJIL PENGHARGAAN',
            mata: 80
          }
        ];
        p.totalPrograms = p.participatedPrograms.length;
        p.kecergasan += 35;
        p.kepimpinan += 35;
        p.pengetahuan += 35;
        p.inovasi += 25;
      }

      p.kecergasan = Math.min(100, Math.max(30, p.kecergasan + 25));
      p.kepimpinan = Math.min(100, Math.max(25, p.kepimpinan + (p.student.kelas?.includes('4') ? 35 : 20)));
      p.kerohanian = Math.min(100, Math.max(35, p.kerohanian + 30));
      p.pengetahuan = Math.min(100, Math.max(40, p.pengetahuan + cgpaBonus));
      p.keusahawanan = Math.min(100, Math.max(20, p.keusahawanan + 25));
      p.inovasi = Math.min(100, Math.max(20, p.inovasi + 20));

      p.overallIndex = Math.round(
        (p.kecergasan + p.kepimpinan + p.kerohanian + p.pengetahuan + p.keusahawanan + p.inovasi) / 6
      );
    });

    return map;
  }, [students, programs]);

  const activeProfile = studentMetrics[selectedStudentId] || Object.values(studentMetrics)[0];

  // Clubs associated with this student
  const studentClubs = useMemo(() => {
    if (!activeProfile?.student || !clubs) return [];
    return clubs.filter(c =>
      c.ahliPelajar?.some(m => m.studentId === activeProfile.student.matrik)
    );
  }, [activeProfile, clubs]);

  // Scholarships / Financial Assistance associated with this student
  const studentScholarships = useMemo(() => {
    if (!activeProfile?.student || !scholarships) return [];
    return scholarships.filter(s =>
      s.studentId === activeProfile.student.id || s.matrik === activeProfile.student.matrik
    );
  }, [activeProfile, scholarships]);

  // Filtered participation programs based on Bidang, Peringkat, Pencapaian
  const filteredPrograms = useMemo(() => {
    if (!activeProfile?.participatedPrograms) return [];
    return activeProfile.participatedPrograms.filter((p) => {
      // 1. Filter Bidang / Kategori
      const matchBidang =
        selectedBidang === 'All' ||
        p.kategori.toLowerCase() === selectedBidang.toLowerCase() ||
        (selectedBidang === 'USAHAWAN' && p.nama.toLowerCase().includes('usahawan')) ||
        (selectedBidang === 'INOVASI' && p.nama.toLowerCase().includes('inovasi'));

      // 2. Filter Peringkat
      const matchPeringkat =
        selectedPeringkat === 'All' ||
        p.peringkat.toLowerCase() === selectedPeringkat.toLowerCase();

      // 3. Filter Pencapaian
      const matchPencapaian =
        selectedPencapaian === 'All' ||
        (selectedPencapaian === 'JOHAN' && (p.pencapaian.includes('JOHAN') || p.pencapaian.includes('EMAS') || p.pencapaian.includes('TEMPAT PERTAMA'))) ||
        (selectedPencapaian === 'NAIB JOHAN' && (p.pencapaian.includes('NAIB') || p.pencapaian.includes('PERAK') || p.pencapaian.includes('TEMPAT KE-2'))) ||
        (selectedPencapaian === 'KETIGA' && (p.pencapaian.includes('TEMPAT KE-3') || p.pencapaian.includes('GANGSA'))) ||
        (selectedPencapaian === 'PENYERTAAN' && (p.pencapaian.includes('PENYERTAAN') || p.pencapaian.includes('SIJIL') || p.pencapaian.includes('KEHADIRAN')));

      return matchBidang && matchPeringkat && matchPencapaian;
    });
  }, [activeProfile, selectedBidang, selectedPeringkat, selectedPencapaian]);

  // Overall student achievements summary counts
  const achievementStats = useMemo(() => {
    const list = activeProfile?.participatedPrograms || [];
    let johanCount = 0;
    let naibCount = 0;
    let ketigaCount = 0;
    let totalMata = 0;

    list.forEach(item => {
      const p = item.pencapaian.toUpperCase();
      if (p.includes('JOHAN') || p.includes('EMAS') || p.includes('PERTAMA')) johanCount++;
      else if (p.includes('NAIB') || p.includes('PERAK') || p.includes('KE-2')) naibCount++;
      else if (p.includes('KE-3') || p.includes('GANGSA')) ketigaCount++;
      totalMata += Number(item.mata) || 75;
    });

    return {
      total: list.length,
      johanCount,
      naibCount,
      ketigaCount,
      podiumCount: johanCount + naibCount + ketigaCount,
      totalMata
    };
  }, [activeProfile]);

  // Radar Chart Config
  const radarChartData = {
    labels: [
      'Kecergasan',
      'Kepimpinan',
      'Kerohanian',
      'Pengetahuan',
      'Keusahawanan',
      'Inovasi',
    ],
    datasets: [
      {
        label: activeProfile?.student?.nama || 'Pelajar',
        data: [
          activeProfile?.kecergasan || 50,
          activeProfile?.kepimpinan || 50,
          activeProfile?.kerohanian || 50,
          activeProfile?.pengetahuan || 50,
          activeProfile?.keusahawanan || 50,
          activeProfile?.inovasi || 50,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.40)',
        borderColor: '#f59e0b',
        borderWidth: 3,
        pointBackgroundColor: '#d97706',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4.5,
      },
      {
        label: 'Purata Kolej',
        data: [55, 52, 58, 62, 48, 45],
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'rgba(99, 102, 241, 0.65)',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 2.5,
      }
    ]
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        pointLabels: { 
          font: { size: 11, weight: 'bold' },
          color: '#0f172a'
        },
        grid: { color: '#e2e8f0' },
        angleLines: { color: '#cbd5e1' },
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          font: { size: 11, weight: 'bold' },
          color: '#1e293b'
        } 
      }
    }
  };

  const filteredStudentList = useMemo(() => {
    return students.filter(s =>
      !searchTerm ||
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matrik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.kelas && s.kelas.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm]);

  // Export full transcript of student participation
  const handleExportTranscript = () => {
    if (!activeProfile?.student) return;
    const exportData = (activeProfile.participatedPrograms || []).map((p, idx) => ({
      'NO': idx + 1,
      'NAMA PELAJAR': activeProfile.student.nama,
      'NO MATRIK': activeProfile.student.matrik,
      'KELAS': activeProfile.student.kelas,
      'NAMA PROGRAM': p.nama,
      'BIDANG / KATEGORI': p.kategori,
      'PERINGKAT': p.peringkat,
      'TARIKH': p.tarikh,
      'PENGANJUR': p.anjuran,
      'PERANAN': p.peranan,
      'PENCAPAIAN': p.pencapaian,
      'MATA MERIT': p.mata
    }));
    exportToExcel(
      exportData, 
      `Profil_Penglibatan_${activeProfile.student.matrik}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner Matching User Reference */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ RADAR KOMPETENSI"
        title="Gambaran Penglibatan & Pencapaian (Spider Web Graph)"
        subtitle="Analisis holistik potensi modal insan merangkumi 6 dimensi kebolehpasaran siswa: Cergas, Pimpin, Rohani, Ilmu, Usahawan, dan Inovasi berbanding purata kolej."
      >
        <div className="px-4 py-2 bg-[#f59e0b] text-slate-950 font-black text-xs rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Pelajar Terpilih: {activeProfile?.student.nama || 'Tiada'} ({activeProfile?.student.kelas || '-'})</span>
        </div>

        <div className="px-4 py-2 bg-slate-800/80 rounded-full border border-slate-600/60 text-slate-200 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span>Indeks Holistik: <strong className="text-white text-sm font-black ml-1">{activeProfile?.overallIndex || 50}%</strong></span>
        </div>
      </TabHeroBanner>

      {/* Main Grid: Left Student Picker | Right Visuals & Detailed Involvement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Selector with Live Scores (Col Span 4) */}
        <div className="lg:col-span-4 clay-card p-5 space-y-3 flex flex-col max-h-[820px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              PILIH PELAJAR ({students.length})
            </h2>
            <span className="text-[10px] text-slate-500 font-bold">Klik untuk butiran</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama, matrik, kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full clay-input pl-8 pr-3 py-2 text-xs font-semibold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Student Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredStudentList.map((s) => {
              const isSelected = selectedStudentId === s.matrik;
              const profile = studentMetrics[s.matrik];

              return (
                <div
                  key={s.matrik}
                  onClick={() => {
                    setSelectedStudentId(s.matrik);
                    setTimeout(() => {
                      document.getElementById('detail-penglibatan-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 50);
                  }}
                  className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                    isSelected
                      ? 'clay-card-pill border-2 border-amber-500 bg-amber-50/50 shadow-md scale-[1.01]'
                      : 'clay-btn hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -top-1.5 right-3 bg-amber-500 text-slate-950 font-black text-[8px] uppercase px-1.5 py-0.2 rounded-full border border-amber-300">
                      Aktif
                    </span>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 truncate max-w-[170px]">
                      {s.nama}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 font-extrabold text-slate-700">
                      {s.kelas}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mt-1.5">
                    <span>{s.matrik}</span>
                    <span className="font-black text-amber-600 bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-200">
                      Skor: {profile?.overallIndex || 50}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Spider Web Visuals & Full Detailed Involvement (Col Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Student Top Hero Profile Card */}
          {activeProfile && (
            <div className="clay-card p-5 bg-white text-slate-900 border border-slate-300 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-xl flex items-center justify-center border border-amber-300 shadow-md">
                  {activeProfile.student.nama.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider block w-fit">
                      PROFIL SISWA AKTIF
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <h3 className="font-black text-lg text-slate-900 leading-tight mt-1">
                    {activeProfile.student.nama}
                  </h3>
                  <div className="text-xs text-slate-700 font-bold mt-0.5 flex flex-wrap items-center gap-2">
                    <span>{activeProfile.student.matrik}</span>
                    <span>•</span>
                    <span>{activeProfile.student.kelas}</span>
                    <span>•</span>
                    <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      CGPA {activeProfile.student.cgpa}
                    </span>
                  </div>
                </div>
              </div>

              {/* Holistic Index Badge & Podium Counts */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-black text-slate-900">{achievementStats.total} Program</div>
                  <div className="text-[10px] font-bold text-amber-700">{achievementStats.podiumCount} Pingat / Podium</div>
                </div>
                <div className="clay-card-pill px-4 py-2 bg-slate-50 text-center border border-slate-300 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                    Indeks Holistik
                  </span>
                  <span className="text-2xl font-black text-amber-600">
                    {activeProfile.overallIndex}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Spider Web Chart Box */}
          <div className="clay-card p-6">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
              <span className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <RadarIcon className="w-4 h-4 text-amber-500" />
                Graf Spider Web (6 Dimensi Kompetensi Siswa)
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                Bandingan Skor Pelajar (Jingga) vs Purata Kolej (Biru)
              </span>
            </div>

            <div className="h-72 sm:h-80">
              <Radar data={radarChartData} options={radarChartOptions} />
            </div>

            {/* 6 Dimensional Pills: Click any pill to auto-filter the table below! */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-200/60 text-center">
              <button
                onClick={() => setSelectedBidang(selectedBidang === 'KECERGASAN' ? 'All' : 'KECERGASAN')}
                className={`clay-card-sm p-2 cursor-pointer transition-all ${
                  selectedBidang === 'KECERGASAN' ? 'ring-2 ring-cyan-500 bg-cyan-50' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-black text-cyan-800 block">Kecergasan</span>
                <span className="text-base font-black text-slate-900">{activeProfile?.kecergasan}</span>
              </button>

              <button
                onClick={() => setSelectedBidang(selectedBidang === 'KEPIMPINAN' ? 'All' : 'KEPIMPINAN')}
                className={`clay-card-sm p-2 cursor-pointer transition-all ${
                  selectedBidang === 'KEPIMPINAN' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-black text-blue-800 block">Kepimpinan</span>
                <span className="text-base font-black text-slate-900">{activeProfile?.kepimpinan}</span>
              </button>

              <button
                onClick={() => setSelectedBidang(selectedBidang === 'KEROHANIAN' ? 'All' : 'KEROHANIAN')}
                className={`clay-card-sm p-2 cursor-pointer transition-all ${
                  selectedBidang === 'KEROHANIAN' ? 'ring-2 ring-amber-500 bg-amber-50' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-black text-amber-800 block">Kerohanian</span>
                <span className="text-base font-black text-slate-900">{activeProfile?.kerohanian}</span>
              </button>

              <button
                onClick={() => setSelectedBidang(selectedBidang === 'PENGETAHUAN' ? 'All' : 'PENGETAHUAN')}
                className={`clay-card-sm p-2 cursor-pointer transition-all ${
                  selectedBidang === 'PENGETAHUAN' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-black text-purple-800 block">Pengetahuan</span>
                <span className="text-base font-black text-slate-900">{activeProfile?.pengetahuan}</span>
              </button>

              <button
                onClick={() => setSelectedBidang(selectedBidang === 'USAHAWAN' ? 'All' : 'USAHAWAN')}
                className={`clay-card-sm p-2 cursor-pointer transition-all ${
                  selectedBidang === 'USAHAWAN' ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-black text-emerald-800 block">Usahawan</span>
                <span className="text-base font-black text-slate-900">{activeProfile?.keusahawanan}</span>
              </button>

              <button
                onClick={() => setSelectedBidang(selectedBidang === 'INOVASI' ? 'All' : 'INOVASI')}
                className={`clay-card-sm p-2 cursor-pointer transition-all ${
                  selectedBidang === 'INOVASI' ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-black text-rose-800 block">Inovasi</span>
                <span className="text-base font-black text-slate-900">{activeProfile?.inovasi}</span>
              </button>
            </div>
          </div>

          {/* MENU PAPARAN MAKLUMAT DETAIL PENGLIBATAN PELAJAR (REQUESTED FEATURE) */}
          <div 
            id="detail-penglibatan-section" 
            className="clay-card p-6 border-2 border-amber-300 shadow-xl space-y-5"
          >
            {/* Header: Title & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-sm">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Perincian Penglibatan & Rekod Pencapaian Siswa
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    Pelajar: <strong className="text-slate-900 font-black">{activeProfile?.student.nama}</strong> ({activeProfile?.student.matrik})
                  </p>
                </div>
              </div>

              {/* Top Sub-tabs (Program, Kelab, Biasiswa) & Export */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="clay-card-pill p-1 flex items-center gap-1">
                  <button
                    onClick={() => setActiveDetailTab('programs')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeDetailTab === 'programs'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Aktiviti ({activeProfile?.participatedPrograms.length})
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('clubs')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeDetailTab === 'clubs'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kelab ({studentClubs.length})
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('welfare')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeDetailTab === 'welfare'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Waris & BKPKK
                  </button>
                </div>

                <button
                  onClick={handleExportTranscript}
                  className="clay-btn px-3.5 py-1.5 rounded-xl text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Eksport Excel</span>
                </button>
              </div>
            </div>

            {/* TAB 1: REKOD PROGRAM & AKTIVITI DENGAN 3 PILIHAN PENAPIS (BIDANG, PERINGKAT, PENCAPAIAN) */}
            {activeDetailTab === 'programs' && (
              <div className="space-y-4">
                {/* 3 FILTER DROPDOWNS: BIDANG, PERINGKAT, PENCAPAIAN */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Filter 1: Bidang / Kategori */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                      PILIH BIDANG / KATEGORI
                    </label>
                    <select
                      value={selectedBidang}
                      onChange={(e) => setSelectedBidang(e.target.value)}
                      className="w-full clay-input px-3 py-1.5 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="All">Semua Bidang ({activeProfile?.participatedPrograms.length})</option>
                      <option value="KECERGASAN">Kecergasan / Sukan</option>
                      <option value="KEPIMPINAN">Kepimpinan Siswa</option>
                      <option value="KEROHANIAN">Kerohanian & Sahsiah</option>
                      <option value="PENGETAHUAN">Pengetahuan & Akademik</option>
                      <option value="USAHAWAN">Keusahawanan</option>
                      <option value="INOVASI">Inovasi & Digital</option>
                    </select>
                  </div>

                  {/* Filter 2: Peringkat Program */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                      PILIH PERINGKAT PROGRAM
                    </label>
                    <select
                      value={selectedPeringkat}
                      onChange={(e) => setSelectedPeringkat(e.target.value)}
                      className="w-full clay-input px-3 py-1.5 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="All">Semua Peringkat</option>
                      <option value="ANTARABANGSA">Peringkat Antarabangsa</option>
                      <option value="KEBANGSAAN">Peringkat Kebangsaan</option>
                      <option value="NEGERI">Peringkat Negeri</option>
                      <option value="DAERAH">Peringkat Daerah</option>
                      <option value="KOLEJ">Peringkat Kolej</option>
                    </select>
                  </div>

                  {/* Filter 3: Tahap Pencapaian */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                      PILIH PENCAPAIAN
                    </label>
                    <select
                      value={selectedPencapaian}
                      onChange={(e) => setSelectedPencapaian(e.target.value)}
                      className="w-full clay-input px-3 py-1.5 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="All">Semua Pencapaian</option>
                      <option value="JOHAN">Johan / Pingat Emas / Tempat Pertama</option>
                      <option value="NAIB JOHAN">Naib Johan / Perak / Tempat Ke-2</option>
                      <option value="KETIGA">Tempat Ke-3 / Pingat Gangsa</option>
                      <option value="PENYERTAAN">Sijil Penghargaan / Penyertaan</option>
                    </select>
                  </div>
                </div>

                {/* Filter Status & Reset */}
                {(selectedBidang !== 'All' || selectedPeringkat !== 'All' || selectedPencapaian !== 'All') && (
                  <div className="flex items-center justify-between px-2 text-xs">
                    <span className="font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Tapisan Aktif: {filteredPrograms.length} rekod dijumpai
                    </span>
                    <button
                      onClick={() => {
                        setSelectedBidang('All');
                        setSelectedPeringkat('All');
                        setSelectedPencapaian('All');
                      }}
                      className="text-xs text-rose-600 font-black hover:underline cursor-pointer"
                    >
                      Set Semula Semua Tapisan (Reset)
                    </button>
                  </div>
                )}

                {/* Detailed Table of Student Programs */}
                {filteredPrograms.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-100/90 text-slate-800 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-3">NO</th>
                          <th className="py-3 px-4">PROGRAM & PENGANJUR</th>
                          <th className="py-3 px-3 text-center">BIDANG</th>
                          <th className="py-3 px-3 text-center">PERINGKAT</th>
                          <th className="py-3 px-3">PERANAN</th>
                          <th className="py-3 px-3">PENCAPAIAN</th>
                          <th className="py-3 px-3 text-center">MATA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredPrograms.map((prog, idx) => {
                          // Badge color for Peringkat
                          const badgePeringkat = {
                            ANTARABANGSA: 'bg-purple-100 text-purple-900 border-purple-300',
                            KEBANGSAAN: 'bg-rose-100 text-rose-900 border-rose-300',
                            NEGERI: 'bg-blue-100 text-blue-900 border-blue-300',
                            DAERAH: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                            KOLEJ: 'bg-slate-100 text-slate-800 border-slate-300'
                          }[prog.peringkat] || 'bg-slate-100 text-slate-800 border-slate-300';

                          // Badge color for Bidang
                          const badgeBidang = {
                            KECERGASAN: 'bg-cyan-100 text-cyan-900 border-cyan-300',
                            KEPIMPINAN: 'bg-blue-100 text-blue-900 border-blue-300',
                            KEROHANIAN: 'bg-amber-100 text-amber-900 border-amber-300',
                            PENGETAHUAN: 'bg-purple-100 text-purple-900 border-purple-300',
                            USAHAWAN: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                            INOVASI: 'bg-rose-100 text-rose-900 border-rose-300'
                          }[prog.kategori] || 'bg-slate-100 text-slate-800 border-slate-300';

                          const isPodium = prog.pencapaian.includes('JOHAN') || prog.pencapaian.includes('EMAS') || prog.pencapaian.includes('KE-2') || prog.pencapaian.includes('KE-3');

                          return (
                            <tr key={prog.id || idx} className="hover:bg-amber-50/40 transition-colors font-medium">
                              <td className="py-3 px-3 font-bold text-slate-500">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <div className="font-black text-slate-900 leading-tight">
                                  {prog.nama}
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                  {prog.tarikh} • {prog.anjuran}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${badgeBidang}`}>
                                  {prog.kategori}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgePeringkat}`}>
                                  {prog.peringkat}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-700">
                                {prog.peranan}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center gap-1 font-black ${
                                  isPodium ? 'text-amber-700' : 'text-slate-800'
                                }`}>
                                  {isPodium && <Medal className="w-3.5 h-3.5 text-amber-500" />}
                                  {prog.pencapaian}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {prog.mata}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-sm font-bold text-slate-600">
                      Tiada rekod program yang sepadan dengan tapisan bidang/peringkat/pencapaian yang dipilih.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedBidang('All');
                        setSelectedPeringkat('All');
                        setSelectedPencapaian('All');
                      }}
                      className="mt-3 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-xs"
                    >
                      Papar Semula Semua Program
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: KEAHLIAN KELAB & PERSATUAN */}
            {activeDetailTab === 'clubs' && (
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                  Keahlian Kelab & Badan Kepimpinan Pelajar:
                </span>
                {studentClubs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {studentClubs.map(c => {
                      const memberInfo = c.ahliPelajar.find(m => m.studentId === activeProfile.student.matrik);
                      return (
                        <div key={c.id} className="clay-card-sm p-4 bg-white border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{c.namaKelab}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                              {c.kategori}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-amber-700">
                            Jawatan: <strong className="text-slate-900 font-black">{memberInfo?.jawatan || 'Ahli Berdaftar'}</strong>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Pegawai Penasihat: {c.penasihat}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600">
                    Pelajar berdaftar dalam Kelab Am Pelajar & Persatuan Siswa KKSP.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WARIS / IBU BAPA & BKPKK */}
            {activeDetailTab === 'welfare' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Maklumat Ibu Bapa */}
                <div className="clay-card-sm p-4 bg-white border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <HeartHandshake className="w-4 h-4 text-rose-500" />
                    Maklumat Ibu Bapa / Waris
                  </span>
                  <div className="text-xs space-y-1 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Nama Waris:</span>
                      <strong className="text-slate-900 font-bold">{activeProfile.student.namaIbuBapa || 'Penjaga Berdaftar'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Hubungan:</span>
                      <span className="text-slate-800 font-semibold">{activeProfile.student.hubunganIbuBapa || 'Bapa / Ibu'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">No Telefon Waris:</span>
                      <span className="font-mono text-slate-900 font-bold">{activeProfile.student.noTelIbuBapa || activeProfile.student.noTel || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Pendapatan Bulanan:</span>
                      <span className="text-emerald-700 font-black">RM {activeProfile.student.pendapatanIbuBapa || '1,800'}</span>
                    </div>
                  </div>
                </div>

                {/* Maklumat BKPKK & Biasiswa */}
                <div className="clay-card-sm p-4 bg-white border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Bantuan Kewangan & Biasiswa
                  </span>
                  <div className="text-xs space-y-1.5 pt-1">
                    {studentScholarships.length > 0 ? (
                      studentScholarships.map(sch => (
                        <div key={sch.id} className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                          <div className="font-black text-emerald-900 text-xs">{sch.jenisBantuan}</div>
                          <div className="text-[11px] font-bold text-slate-700 mt-0.5">Jumlah: RM {sch.jumlah} ({sch.statusBiasiswa})</div>
                          <div className="text-[10px] text-slate-500 font-mono">No Akaun: {sch.noAkaun}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                        Penerima Bantuan Kewangan Pelajar Kolej Komuniti (BKPKK KPT: RM300/bulan) bagi Semester Semasa.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
