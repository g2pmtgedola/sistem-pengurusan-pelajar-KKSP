import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Download,
  Users,
  Trophy,
  ExternalLink,
  X
} from 'lucide-react';
import { exportToExcel } from '../utils/excelHelper';
import TabHeroBanner from './TabHeroBanner';

export default function ProgramRegistration({ programs, setPrograms, students }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [activeProgramForParticipant, setActiveProgramForParticipant] = useState(null);
  const [viewProgramDetails, setViewProgramDetails] = useState(null);

  const [newProgram, setNewProgram] = useState({
    id: `PRG-${Date.now()}`,
    namaProgram: '',
    kategori: 'PENGETAHUAN',
    peringkat: 'KEBANGSAAN',
    tarikhMula: new Date().toISOString().slice(0, 10),
    tarikhTamat: new Date().toISOString().slice(0, 10),
    tempat: 'Kolej Komuniti Sungai Petani',
    anjuran: 'UPP KKSP',
    pencapaian: 'PENYERTAAN PENUH',
    status: 'Selesai',
    peserta: []
  });

  const [newParticipant, setNewParticipant] = useState({
    studentId: '',
    peranan: 'Peserta',
    pencapaian: 'SIJIL PENYERTAAN',
    mata: 80
  });

  const categories = ['All', 'KECERGASAN', 'KEPIMPINAN', 'KEROHANIAN', 'PENGETAHUAN'];
  const levels = ['All', 'KOLEJ', 'DAERAH', 'NEGERI', 'KEBANGSAAN', 'ANTARABANGSA'];
  const classList = useMemo(() => {
    return ['All', ...Array.from(new Set(students.map(s => s.kelas).filter(Boolean))).sort()];
  }, [students]);

  const flattenedRecords = useMemo(() => {
    const list = [];
    programs.forEach(prog => {
      prog.peserta.forEach(p => {
        const studentObj = students.find(s => s.matrik === p.studentId || s.id === p.studentId);
        list.push({
          programId: prog.id,
          namaProgram: prog.namaProgram,
          kategori: prog.kategori,
          peringkat: prog.peringkat,
          tarikhMula: prog.tarikhMula,
          anjuran: prog.anjuran,
          studentId: p.studentId,
          namaPelajar: p.studentName || studentObj?.nama || 'N/A',
          kelas: studentObj?.kelas || 'N/A',
          peranan: p.peranan,
          pencapaian: p.pencapaian,
          mata: p.mata || 70
        });
      });
    });
    return list;
  }, [programs, students]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(prog => {
      const matchSearch =
        !searchTerm ||
        prog.namaProgram.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.tempat.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'All' || prog.kategori === selectedCategory;
      const matchLevel = selectedLevel === 'All' || prog.peringkat === selectedLevel;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [programs, searchTerm, selectedCategory, selectedLevel]);

  const filteredParticipation = useMemo(() => {
    return flattenedRecords.filter(rec => {
      const matchProgram =
        !searchTerm ||
        rec.namaProgram.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'All' || rec.kategori === selectedCategory;
      const matchLevel = selectedLevel === 'All' || rec.peringkat === selectedLevel;
      const matchClass = selectedClass === 'All' || rec.kelas === selectedClass;
      const matchStudent =
        !selectedStudentFilter ||
        rec.namaPelajar.toLowerCase().includes(selectedStudentFilter.toLowerCase()) ||
        rec.studentId.toLowerCase().includes(selectedStudentFilter.toLowerCase());

      return matchProgram && matchCategory && matchLevel && matchClass && matchStudent;
    });
  }, [flattenedRecords, searchTerm, selectedCategory, selectedLevel, selectedClass, selectedStudentFilter]);

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (!newProgram.namaProgram) return;

    setPrograms(prev => [newProgram, ...prev]);
    setIsAddProgramOpen(false);
  };

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!activeProgramForParticipant || !newParticipant.studentId) return;

    const studentObj = students.find(s => s.matrik === newParticipant.studentId);
    if (!studentObj) return;

    const participantEntry = {
      studentId: studentObj.matrik,
      studentName: studentObj.nama,
      peranan: newParticipant.peranan,
      pencapaian: newParticipant.pencapaian,
      mata: parseInt(newParticipant.mata, 10) || 75
    };

    setPrograms(prev => prev.map(p => {
      if (p.id === activeProgramForParticipant.id) {
        return {
          ...p,
          peserta: [...p.peserta.filter(item => item.studentId !== studentObj.matrik), participantEntry]
        };
      }
      return p;
    }));

    setIsAddParticipantOpen(false);
  };

  const handleExportExcel = () => {
    const exportData = filteredParticipation.map(r => ({
      'NAMA PROGRAM': r.namaProgram,
      'KATEGORI': r.kategori,
      'PERINGKAT': r.peringkat,
      'TARIKH': r.tarikhMula,
      'NAMA PELAJAR': r.namaPelajar,
      'NO MATRIK': r.studentId,
      'KELAS': r.kelas,
      'PERANAN': r.peranan,
      'PENCAPAIAN': r.pencapaian,
      'MARKAH': r.mata
    }));
    exportToExcel(exportData, `Pelaporan_Program_KKSP_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner Matching User Reference */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ PROGRAM & AKTIVITI"
        title="Pendaftaran & Pelaporan Program Aktiviti Siswa"
        subtitle="Pengurusan pendaftaran program dan aktiviti kokurikulum mengikut kategori & peringkat (Kolej, Daerah, Negeri, Kebangsaan, Antarabangsa) beserta pelaporan pencapaian rasmi."
      >
        <button
          onClick={() => setIsAddProgramOpen(true)}
          className="px-4 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Daftar Program Baharu</span>
        </button>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-300 active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Eksport Laporan Excel</span>
        </button>
      </TabHeroBanner>

      {/* Filters and Search Card */}
      <div className="clay-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full clay-badge-blue text-white flex items-center justify-center font-black text-xs">
              {filteredParticipation.length}
            </span>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
              Penapis Rekod Penyertaan Program
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {programs.length} Program Berdaftar
          </span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mt-4 items-end">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              NAMA PROGRAM
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari aktiviti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full clay-input pl-8 pr-2 py-2 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              KATEGORI
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full clay-input px-3 py-2 text-xs"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              PERINGKAT
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full clay-input px-3 py-2 text-xs font-bold text-indigo-700"
            >
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              KELAS
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full clay-input px-3 py-2 text-xs"
            >
              {classList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              NAMA PELAJAR
            </label>
            <input
              type="text"
              placeholder="Cari peserta..."
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full clay-input px-3 py-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Program Cards & Participation Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programs List */}
        <div className="clay-card p-5 space-y-3">
          <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
            <Trophy className="w-4 h-4 text-amber-500" />
            Senarai Program Didaftar ({filteredPrograms.length})
          </h2>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredPrograms.map(prog => (
              <div key={prog.id} className="clay-card-sm p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2">
                    {prog.namaProgram}
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">
                    {prog.peringkat}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{prog.kategori}</span>
                  <span className="font-bold text-slate-700">{prog.peserta.length} Peserta</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => {
                      setActiveProgramForParticipant(prog);
                      setIsAddParticipantOpen(true);
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Tambah Peserta
                  </button>
                  <button
                    onClick={() => setViewProgramDetails(prog)}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" /> Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participation Reporting Table */}
        <div className="lg:col-span-2 clay-card overflow-hidden flex flex-col">
          <div className="p-4 bg-white/40 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Pelaporan Penglibatan ({filteredParticipation.length} Rekod)
            </span>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Peringkat Tertinggi: ANTARABANGSA
            </span>
          </div>

          <div className="flex-1 overflow-x-auto max-h-[520px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100/60 text-slate-600 font-bold sticky top-0 border-b border-slate-200 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">NAMA PROGRAM</th>
                  <th className="py-2.5 px-2">PERINGKAT</th>
                  <th className="py-2.5 px-3">NAMA PELAJAR</th>
                  <th className="py-2.5 px-2">KELAS</th>
                  <th className="py-2.5 px-2">PENCAPAIAN</th>
                  <th className="py-2.5 px-2 text-center">MATA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipation.map((rec, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800 max-w-[180px] truncate" title={rec.namaProgram}>
                      {rec.namaProgram}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-indigo-700 whitespace-nowrap text-[10px]">
                      {rec.peringkat}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {rec.namaPelajar}
                    </td>
                    <td className="py-2.5 px-2 text-[10px] font-bold text-slate-600 whitespace-nowrap">
                      {rec.kelas}
                    </td>
                    <td className="py-2.5 px-2 text-emerald-700 font-bold text-[10px] whitespace-nowrap">
                      {rec.pencapaian}
                    </td>
                    <td className="py-2.5 px-2 text-center font-black text-amber-600">
                      {rec.mata}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Tambah Program */}
      {isAddProgramOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-sm">Daftar Program Baru</h3>
              <button onClick={() => setIsAddProgramOpen(false)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Program *</label>
                <input
                  type="text"
                  required
                  value={newProgram.namaProgram}
                  onChange={(e) => setNewProgram({ ...newProgram, namaProgram: e.target.value.toUpperCase() })}
                  className="w-full clay-input px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newProgram.kategori}
                    onChange={(e) => setNewProgram({ ...newProgram, kategori: e.target.value })}
                    className="w-full clay-input px-3 py-2"
                  >
                    <option value="PENGETAHUAN">PENGETAHUAN</option>
                    <option value="KEPIMPINAN">KEPIMPINAN</option>
                    <option value="KECERGASAN">KECERGASAN</option>
                    <option value="KEROHANIAN">KEROHANIAN</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peringkat</label>
                  <select
                    value={newProgram.peringkat}
                    onChange={(e) => setNewProgram({ ...newProgram, peringkat: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-bold"
                  >
                    <option value="KOLEJ">KOLEJ</option>
                    <option value="DAERAH">DAERAH</option>
                    <option value="NEGERI">NEGERI</option>
                    <option value="KEBANGSAAN">KEBANGSAAN</option>
                    <option value="ANTARABANGSA">ANTARABANGSA</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddProgramOpen(false)} className="clay-btn px-4 py-2 rounded-xl">Batal</button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-bold text-indigo-700 bg-indigo-50">Daftar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Peserta */}
      {isAddParticipantOpen && activeProgramForParticipant && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-md w-full p-6 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-sm">Daftar Peserta Pelajar</h3>
              <button onClick={() => setIsAddParticipantOpen(false)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Pelajar *</label>
                <select
                  required
                  value={newParticipant.studentId}
                  onChange={(e) => setNewParticipant({ ...newParticipant, studentId: e.target.value })}
                  className="w-full clay-input px-3 py-2"
                >
                  <option value="">-- Pilih Pelajar --</option>
                  {students.map(s => (
                    <option key={s.matrik} value={s.matrik}>{s.nama} ({s.matrik})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pencapaian Diperoleh</label>
                <input
                  type="text"
                  placeholder="Contoh: JOHAN / EMAS / SIJIL"
                  value={newParticipant.pencapaian}
                  onChange={(e) => setNewParticipant({ ...newParticipant, pencapaian: e.target.value.toUpperCase() })}
                  className="w-full clay-input px-3 py-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddParticipantOpen(false)} className="clay-btn px-4 py-2 rounded-xl">Batal</button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-bold text-indigo-700 bg-indigo-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

