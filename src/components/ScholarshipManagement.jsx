import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Search, 
  Plus, 
  Download, 
  CheckCircle, 
  Trash2, 
  Eye, 
  X,
  Filter,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Calendar,
  Repeat,
  GraduationCap,
  Edit3
} from 'lucide-react';
import { exportToExcel } from '../utils/excelHelper';
import TabHeroBanner from './TabHeroBanner';
import { ACADEMIC_SESSIONS } from '../data/mockData';

// Fallback list of academic sessions if needed
const ALL_ACADEMIC_SESSIONS = ACADEMIC_SESSIONS || [
  'Sesi I 2026/2027',
  'Sesi II 2026/2027',
  'Sesi I 2025/2026',
  'Sesi II 2025/2026',
  'Sesi I 2024/2025',
  'Sesi II 2024/2025',
  'Sesi I 2023/2024',
  'Sesi II 2023/2024',
  'Sesi I 2022/2023',
  'Sesi II 2022/2023',
  'Sesi I 2021/2022',
  'Sesi II 2021/2022'
];

// Helper to get normalized session string
const getRecordSession = (s) => {
  if (s?.sesi) return s.sesi;
  if (s?.semesterMula === 'Semester 2' || s?.semesterMula === 'Semester 4') return 'Sesi II 2026/2027';
  return 'Sesi I 2026/2027';
};

// Helper to list all semesters received for a scholarship (Penyaluran 2 Kali Setahun)
const getRecordSemesters = (s) => {
  if (Array.isArray(s?.senaraiSemester) && s.senaraiSemester.length > 0) {
    return s.senaraiSemester;
  }
  const semMula = s?.semesterMula || 'Semester 1';
  const kekerapan = s?.kekerapan || '2 Kali Setahun (Ikut Semester)';
  const sessionStr = getRecordSession(s);
  const yearMatch = sessionStr.match(/\d{4}\/\d{4}/);
  const sessionYear = yearMatch ? yearMatch[0] : '2026/2027';

  if (kekerapan.includes('1 Kali') || kekerapan.includes('One-off')) {
    return [`${semMula} (${sessionStr})`];
  }
  
  if (semMula === 'Semester 1') {
    return [`Semester 1 (Sesi I ${sessionYear})`, `Semester 2 (Sesi II ${sessionYear})`];
  } else if (semMula === 'Semester 2') {
    return [`Semester 2 (Sesi II ${sessionYear})`];
  } else if (semMula === 'Semester 3') {
    return [`Semester 3 (Sesi I ${sessionYear})`, `Semester 4 (Sesi II ${sessionYear})`];
  } else if (semMula === 'Semester 4') {
    return [`Semester 4 (Sesi II ${sessionYear})`];
  }
  return [`${semMula} (${sessionStr})`];
};

export default function ScholarshipManagement({ 
  scholarships, 
  setScholarships, 
  students,
  currentUser,
  isClassRestricted,
  activeClassName
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssistanceType, setSelectedAssistanceType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedSession, setSelectedSession] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    studentId: '',
    namaPelajar: '',
    matrik: '',
    jenisBantuan: '',
    penaja: '',
    sesi: 'Sesi I 2026/2027',
    kekerapan: '2 Kali Setahun (Ikut Semester)',
    jumlah: 1800,
    semesterMula: 'Semester 1',
    selectedSemesters: ['Semester 1'],
    statusBiasiswa: 'Aktif',
    tarikhKelulusan: new Date().toISOString().slice(0, 10),
    noAkaun: '',
    catatan: ''
  });

  // State for Custom Assistance Types (Lain-lain)
  const [customAssistanceTypes, setCustomAssistanceTypes] = useState([]);
  const [selectedAssistanceDropdown, setSelectedAssistanceDropdown] = useState('BKPKK (Bantuan Kewangan Pelajar Kolej Komuniti)');
  const [otherAssistanceName, setOtherAssistanceName] = useState('');
  const [otherPenajaName, setOtherPenajaName] = useState('');

  const [formData, setFormData] = useState({
    id: `SCH-${Date.now()}`,
    studentId: '',
    namaPelajar: '',
    matrik: '',
    jenisBantuan: 'BKPKK (Bantuan Kewangan Pelajar Kolej Komuniti)',
    penaja: 'Kementerian Pendidikan Tinggi (KPT)',
    sesi: 'Sesi I 2026/2027',
    kekerapan: '2 Kali Setahun (Ikut Semester)',
    jumlah: 1800, // RM1,800 setiap semester (2 sesi = RM3,600 setahun)
    semesterMula: 'Semester 1',
    selectedSemesters: ['Semester 1', 'Semester 2'], // Multi-semester list
    statusBiasiswa: 'Aktif',
    tarikhKelulusan: new Date().toISOString().slice(0, 10),
    noAkaun: '',
    catatan: '',
    autoCreateBothSessions: true // Default: jana kedua-dua Sesi I & Sesi II
  });

  // Dataset scoped by the active session selected on Dashboard
  const sessionScopedScholarships = useMemo(() => {
    if (selectedSession === 'All') return scholarships;
    return scholarships.filter(s => {
      const recSession = getRecordSession(s);
      return recSession === selectedSession || (s.sesi && s.sesi.includes(selectedSession));
    });
  }, [scholarships, selectedSession]);

  const totalDisbursed = useMemo(() => {
    return sessionScopedScholarships.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
  }, [sessionScopedScholarships]);

  const bkpkkCount = useMemo(() => {
    return sessionScopedScholarships.filter((s) => s.jenisBantuan.includes('BKPKK')).length;
  }, [sessionScopedScholarships]);

  const zakatCount = useMemo(() => {
    return sessionScopedScholarships.filter((s) => s.jenisBantuan.toLowerCase().includes('zakat')).length;
  }, [sessionScopedScholarships]);

  const yayasanCount = useMemo(() => {
    return sessionScopedScholarships.filter((s) => s.jenisBantuan.toLowerCase().includes('yayasan')).length;
  }, [sessionScopedScholarships]);

  // Unique types of assistance dynamically extracted from scholarships list + custom user-added types
  const uniqueAssistanceTypes = useMemo(() => {
    const defaultTypes = [
      'BKPKK (Bantuan Kewangan Pelajar Kolej Komuniti)',
      'Biasiswa Zakat Negeri Kedah (LZNK)',
      'Bantuan Yayasan Wilayah / Pendidikan'
    ];
    const fromScholarships = scholarships.map((s) => s.jenisBantuan).filter(Boolean);
    const combined = Array.from(new Set([...defaultTypes, ...customAssistanceTypes, ...fromScholarships]));
    return ['All', ...combined.sort()];
  }, [scholarships, customAssistanceTypes]);

  // Filtered scholarships based on Type, Search, Status, Semester, and Academic Session
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      const matchSearch =
        !searchTerm ||
        s.namaPelajar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matrik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.penaja.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.sesi && s.sesi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.noAkaun && s.noAkaun.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchType = true;
      if (selectedAssistanceType === 'All') {
        matchType = true;
      } else if (selectedAssistanceType === 'BKPKK') {
        matchType = s.jenisBantuan.includes('BKPKK');
      } else if (selectedAssistanceType === 'ZAKAT') {
        matchType = s.jenisBantuan.toLowerCase().includes('zakat');
      } else if (selectedAssistanceType === 'YAYASAN') {
        matchType = s.jenisBantuan.toLowerCase().includes('yayasan');
      } else {
        matchType = s.jenisBantuan === selectedAssistanceType;
      }

      const matchStatus = selectedStatus === 'All' || s.statusBiasiswa === selectedStatus;
      const matchSemester = selectedSemester === 'All' || s.semesterMula === selectedSemester;
      const recordSession = getRecordSession(s);
      const matchSession = selectedSession === 'All' || recordSession === selectedSession || (s.sesi && s.sesi.includes(selectedSession));

      return matchSearch && matchType && matchStatus && matchSemester && matchSession;
    });
  }, [scholarships, searchTerm, selectedAssistanceType, selectedStatus, selectedSemester, selectedSession]);

  const filteredTotalDisbursed = useMemo(() => {
    return filteredScholarships.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
  }, [filteredScholarships]);

  const handleOpenAdd = () => {
    setSelectedAssistanceDropdown('BKPKK (Bantuan Kewangan Pelajar Kolej Komuniti)');
    setOtherAssistanceName('');
    setOtherPenajaName('');
    setFormData({
      id: `SCH-${Date.now()}`,
      studentId: '',
      namaPelajar: '',
      matrik: '',
      jenisBantuan: 'BKPKK (Bantuan Kewangan Pelajar Kolej Komuniti)',
      penaja: 'Kementerian Pendidikan Tinggi (KPT)',
      sesi: selectedSession !== 'All' ? selectedSession : 'Sesi I 2026/2027',
      kekerapan: '2 Kali Setahun (Ikut Semester)',
      jumlah: 1800,
      semesterMula: 'Semester 1',
      selectedSemesters: ['Semester 1', 'Semester 2'],
      statusBiasiswa: 'Aktif',
      tarikhKelulusan: new Date().toISOString().slice(0, 10),
      noAkaun: '',
      catatan: '',
      autoCreateBothSessions: true
    });
    setIsAddModalOpen(true);
  };

  const handleSelectStudentForScholarship = (matrik) => {
    const s = students.find(item => item.matrik === matrik);
    if (s) {
      setFormData(prev => ({
        ...prev,
        studentId: s.matrik,
        namaPelajar: s.nama,
        matrik: s.matrik
      }));
    }
  };

  const handleSaveScholarship = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.jumlah) return;

    let finalJenisBantuan = formData.jenisBantuan;
    let finalPenaja = formData.penaja;

    // Handle "Lain-lain" custom assistance
    if (selectedAssistanceDropdown === 'LAIN_LAIN') {
      if (!otherAssistanceName.trim()) {
        alert('Sila masukkan nama bantuan/biasiswa baharu!');
        return;
      }
      finalJenisBantuan = otherAssistanceName.trim();
      finalPenaja = otherPenajaName.trim() || 'Penaja / Agensi Luar';

      // Automatically register into customAssistanceTypes so it appears in filter dropdown
      setCustomAssistanceTypes(prev => {
        if (!prev.includes(finalJenisBantuan)) {
          return [...prev, finalJenisBantuan];
        }
        return prev;
      });
    }

    // Determine academic year string from selected session (e.g. '2026/2027')
    const yearMatch = formData.sesi.match(/\d{4}\/\d{4}/);
    const sessionYear = yearMatch ? yearMatch[0] : '2026/2027';

    // Format list of all semesters received
    const chosenSemesters = formData.selectedSemesters && formData.selectedSemesters.length > 0
      ? formData.selectedSemesters
      : [formData.semesterMula || 'Semester 1'];

    const formattedSemesters = chosenSemesters.map(sem => {
      const isSem2Or4 = sem.includes('2') || sem.includes('4');
      const assignedSession = isSem2Or4 ? `Sesi II ${sessionYear}` : `Sesi I ${sessionYear}`;
      return `${sem} (${assignedSession})`;
    });

    if (formData.autoCreateBothSessions) {
      const perSessionAmount = Number(formData.jumlah) || 1800;

      const record1 = {
        ...formData,
        id: `SCH-${Date.now()}-1`,
        jenisBantuan: finalJenisBantuan,
        penaja: finalPenaja,
        sesi: `Sesi I ${sessionYear}`,
        semesterMula: chosenSemesters[0] || 'Semester 1',
        senaraiSemester: formattedSemesters,
        kekerapan: '2 Kali Setahun (Ikut Semester)',
        jumlah: perSessionAmount,
        catatan: formData.catatan || `Penyaluran Sesi I ${sessionYear} (Diterima 2 kali setahun).`
      };

      const record2 = {
        ...formData,
        id: `SCH-${Date.now()}-2`,
        jenisBantuan: finalJenisBantuan,
        penaja: finalPenaja,
        sesi: `Sesi II ${sessionYear}`,
        semesterMula: chosenSemesters[1] || 'Semester 2',
        senaraiSemester: formattedSemesters,
        kekerapan: '2 Kali Setahun (Ikut Semester)',
        jumlah: perSessionAmount,
        catatan: formData.catatan || `Penyaluran Sesi II ${sessionYear} (Diterima 2 kali setahun).`
      };

      setScholarships(prev => [record1, record2, ...prev]);
    } else {
      const singleRecord = {
        ...formData,
        jenisBantuan: finalJenisBantuan,
        penaja: finalPenaja,
        sesi: formData.sesi,
        senaraiSemester: formattedSemesters,
        semesterMula: chosenSemesters[0] || 'Semester 1'
      };
      setScholarships(prev => [singleRecord, ...prev]);
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id, nama) => {
    if (window.confirm(`Padam rekod biasiswa bagi ${nama}?`)) {
      setScholarships(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleOpenEdit = (record) => {
    const currentSemesters = getRecordSemesters(record);
    const rawSemesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'].filter(sem => 
      currentSemesters.some(cs => cs.includes(sem))
    );

    const initialSemesters = rawSemesters.length > 0 ? rawSemesters : [record.semesterMula || 'Semester 1'];
    const perSemRate = 1800;
    const initialTotal = record.jumlah ? Number(record.jumlah) : (initialSemesters.length * perSemRate);

    setEditFormData({
      id: record.id,
      studentId: record.studentId || record.matrik,
      namaPelajar: record.namaPelajar,
      matrik: record.matrik,
      jenisBantuan: record.jenisBantuan,
      penaja: record.penaja,
      sesi: getRecordSession(record),
      kekerapan: record.kekerapan || '2 Kali Setahun (Ikut Semester)',
      jumlah: initialTotal,
      perSemRate: perSemRate,
      semesterMula: record.semesterMula || 'Semester 1',
      selectedSemesters: initialSemesters,
      statusBiasiswa: record.statusBiasiswa || 'Aktif',
      tarikhKelulusan: record.tarikhKelulusan || new Date().toISOString().slice(0, 10),
      noAkaun: record.noAkaun || '',
      catatan: record.catatan || ''
    });
    setIsEditModalOpen(true);
  };

  const handleToggleEditSemester = (semesterName) => {
    setEditFormData(prev => {
      const exists = prev.selectedSemesters.includes(semesterName);
      let updated;
      if (exists) {
        updated = prev.selectedSemesters.filter(s => s !== semesterName);
        if (updated.length === 0) updated = [semesterName];
      } else {
        updated = [...prev.selectedSemesters, semesterName].sort();
      }

      // Auto tambah / tolak jumlah mengikut bilangan semester yang dipilih (RM1,800 setiap semester)
      const perSemRate = prev.perSemRate || 1800;
      const newTotal = updated.length * perSemRate;

      return {
        ...prev,
        selectedSemesters: updated,
        jumlah: newTotal
      };
    });
  };

  const handleSaveEditScholarship = (e) => {
    e.preventDefault();
    if (!editFormData.id) return;

    const yearMatch = editFormData.sesi.match(/\d{4}\/\d{4}/);
    const sessionYear = yearMatch ? yearMatch[0] : '2026/2027';

    const chosenSemesters = editFormData.selectedSemesters.length > 0
      ? editFormData.selectedSemesters
      : [editFormData.semesterMula || 'Semester 1'];

    const formattedSemesters = chosenSemesters.map(sem => {
      const isSem2Or4 = sem.includes('2') || sem.includes('4');
      const assignedSession = isSem2Or4 ? `Sesi II ${sessionYear}` : `Sesi I ${sessionYear}`;
      return `${sem} (${assignedSession})`;
    });

    setScholarships(prev => prev.map(s => {
      if (s.id === editFormData.id) {
        return {
          ...s,
          sesi: editFormData.sesi,
          senaraiSemester: formattedSemesters,
          semesterMula: chosenSemesters[0] || editFormData.semesterMula,
          jumlah: Number(editFormData.jumlah) || s.jumlah,
          statusBiasiswa: editFormData.statusBiasiswa,
          tarikhKelulusan: editFormData.tarikhKelulusan,
          noAkaun: editFormData.noAkaun,
          catatan: editFormData.catatan
        };
      }
      return s;
    }));

    setIsEditModalOpen(false);
  };

  const handleExportExcel = () => {
    const exportData = filteredScholarships.map(s => ({
      'NAMA PELAJAR': s.namaPelajar,
      'NO MATRIK': s.matrik,
      'JENIS BANTUAN': s.jenisBantuan,
      'PENAJA': s.penaja,
      'SESI PENGAJIAN': getRecordSession(s),
      'SEMESTER DITERIMA': getRecordSemesters(s).join(', '),
      'KEKERAPAN PENYALURAN': s.kekerapan || '2 Kali Setahun (Ikut Semester)',
      'JUMLAH (RM)': s.jumlah,
      'STATUS': s.statusBiasiswa,
      'NO AKAUN': s.noAkaun,
      'TARIKH KELULUSAN': s.tarikhKelulusan,
      'CATATAN': s.catatan || '-'
    }));
    exportToExcel(exportData, `Penerima_Biasiswa_KKSP_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner Matching User Reference */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ KEBAJIKAN & BIASISWA"
        title="Urusan BKPKK & Biasiswa Pelajar"
        subtitle="Pengurusan bantuan elaun kewangan BKPKK KPT (RM300/bulan), biasiswa agensi luar, yayasan negeri, maklumat akaun bank, dan status kelulusan penerima."
      >
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Tambah Rekod Penerima</span>
        </button>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-300 active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Eksport Penerima Excel</span>
        </button>
      </TabHeroBanner>

      {/* DASHBOARD MAKLUMAT BIASISWA: PILIHAN SESI PENGAJIAN BAR (REQUESTED FEATURE) */}
      <div className="clay-card p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Calendar className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  PILIHAN SESI PENGAJIAN (DASHBOARD BIASISWA)
                </span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-bold">
                  Penyaluran 2 Kali Setahun (Ikut Semester)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-semibold mt-0.5">
                Pilih sesi pengajian untuk menyaring ringkasan dana dashboard dan jadual penerima bantuan:
              </p>
            </div>
          </div>

          {/* Interactive Session Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedSession('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                selectedSession === 'All'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              <span>★ Semua Sesi</span>
            </button>

            {['Sesi I 2026/2027', 'Sesi II 2026/2027', 'Sesi I 2025/2026', 'Sesi II 2025/2026'].map((sesi) => (
              <button
                key={sesi}
                onClick={() => setSelectedSession(sesi)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedSession === sesi
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {sesi}
              </button>
            ))}

            {/* Dropdown for older sessions */}
            <select
              value={['All', 'Sesi I 2026/2027', 'Sesi II 2026/2027', 'Sesi I 2025/2026', 'Sesi II 2025/2026'].includes(selectedSession) ? '' : selectedSession}
              onChange={(e) => {
                if (e.target.value) setSelectedSession(e.target.value);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-amber-200 border border-slate-700 cursor-pointer"
            >
              <option value="" disabled>Arsip Sesi Lain...</option>
              {ALL_ACADEMIC_SESSIONS.slice(4).map((sesi) => (
                <option key={sesi} value={sesi}>
                  {sesi}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Restricted Class Notification Banner */}
      {isClassRestricted && (
        <div className="clay-card p-4 bg-gradient-to-r from-amber-50/95 via-sky-50/90 to-indigo-50/95 border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Maklumat Biasiswa Terhad: Pelajar Kelas {activeClassName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 border border-amber-300">
                  {scholarships.length} Rekod Bantuan
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                Statistik, jumlah peruntukan, dan senarai penerima bantuan di bawah adalah khusus untuk pelajar berdaftar dalam kelas <strong>{activeClassName}</strong>.
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-amber-300 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Kelas: {activeClassName}
          </div>
        </div>
      )}

      {/* 4 Interactive Clay Metric Pills (Clickable to Filter) */}
      <div className="clay-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Ringkasan Dana & Kategori Biasiswa
            </span>
            <span className="text-[10px] font-black bg-indigo-100 text-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {selectedSession === 'All' ? 'Keseluruhan Sesi' : `Paparan Sesi: ${selectedSession}`}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">
            Klik mana-mana kad untuk menapis
          </span>
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* KPI 1: Dana Disalurkan */}
            <div 
              onClick={() => setSelectedAssistanceType('All')}
              className={`clay-card-sm p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedAssistanceType === 'All' ? 'ring-2 ring-emerald-500 bg-emerald-50/40 shadow-md' : 'hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">DANA DISALURKAN</span>
                <div className="text-lg font-black text-emerald-800 mt-0.5">RM {totalDisbursed.toLocaleString()}</div>
                <span className="text-[9px] text-emerald-700 font-bold">Keseluruhan Penajaan</span>
              </div>
              <div className="w-8 h-8 rounded-full clay-badge-green text-white font-black text-xs flex items-center justify-center">
                RM
              </div>
            </div>

            {/* KPI 2: Penerima BKPKK */}
            <div 
              onClick={() => setSelectedAssistanceType('BKPKK')}
              className={`clay-card-sm p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedAssistanceType === 'BKPKK' ? 'ring-2 ring-blue-500 bg-blue-50/40 shadow-md' : 'hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">PENERIMA BKPKK</span>
                <div className="text-lg font-black text-blue-900 mt-0.5">{bkpkkCount} Orang</div>
                <span className="text-[9px] text-blue-700 font-bold">Elaun KPT RM300/bln</span>
              </div>
              <div className="w-8 h-8 rounded-full clay-badge-blue text-white font-black text-xs flex items-center justify-center">
                {bkpkkCount}
              </div>
            </div>

            {/* KPI 3: Biasiswa Zakat */}
            <div 
              onClick={() => setSelectedAssistanceType('ZAKAT')}
              className={`clay-card-sm p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedAssistanceType === 'ZAKAT' ? 'ring-2 ring-purple-500 bg-purple-50/40 shadow-md' : 'hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">BIASISWA ZAKAT (LZNK)</span>
                <div className="text-lg font-black text-purple-900 mt-0.5">{zakatCount} Orang</div>
                <span className="text-[9px] text-purple-700 font-bold">Bantuan Asnaf Pelajar</span>
              </div>
              <div className="w-8 h-8 rounded-full clay-badge-orange text-white font-black text-xs flex items-center justify-center">
                {zakatCount}
              </div>
            </div>

            {/* KPI 4: Yayasan & Lain-lain */}
            <div 
              onClick={() => setSelectedAssistanceType('YAYASAN')}
              className={`clay-card-sm p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                selectedAssistanceType === 'YAYASAN' ? 'ring-2 ring-amber-500 bg-amber-50/40 shadow-md' : 'hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">YAYASAN / PENDIDIKAN</span>
                <div className="text-lg font-black text-amber-900 mt-0.5">{yayasanCount} Orang</div>
                <span className="text-[9px] text-amber-700 font-bold">Yayasan Wilayah & Negeri</span>
              </div>
              <div className="w-8 h-8 rounded-full clay-badge-red text-white font-black text-xs flex items-center justify-center">
                {yayasanCount}
              </div>
            </div>
          </div>
        </div>

        {/* BAR PENAPIS JENIS BIASISWA & CARIAN (REQUESTED FEATURE) */}
        <div className="clay-card p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Penapis Pilihan Jenis Biasiswa & Carian Penerima
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Tapis mengikut kategori bantuan KPT, zakat negeri, atau yayasan pendidikan
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {filteredScholarships.length} daripada {scholarships.length} penerima
              </span>
            </div>
          </div>

          {/* Quick Category Buttons (1-Click Filter) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">
              Kategori Pantas:
            </span>

            <button
              onClick={() => setSelectedAssistanceType('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedAssistanceType === 'All'
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'clay-btn text-slate-700'
              }`}
            >
              Semua Bantuan ({scholarships.length})
            </button>

            <button
              onClick={() => setSelectedAssistanceType('BKPKK')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedAssistanceType === 'BKPKK'
                  ? 'bg-blue-600 text-white font-black shadow-xs'
                  : 'clay-btn text-blue-800'
              }`}
            >
              BKPKK KPT ({bkpkkCount})
            </button>

            <button
              onClick={() => setSelectedAssistanceType('ZAKAT')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedAssistanceType === 'ZAKAT'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'clay-btn text-emerald-800'
              }`}
            >
              Zakat LZNK ({zakatCount})
            </button>

            <button
              onClick={() => setSelectedAssistanceType('YAYASAN')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedAssistanceType === 'YAYASAN'
                  ? 'bg-amber-600 text-white font-black shadow-xs'
                  : 'clay-btn text-amber-800'
              }`}
            >
              Yayasan Pendidikan ({yayasanCount})
            </button>
          </div>

          {/* Detailed Filter Dropdown & Search Controls (5-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {/* Dropdown 1: Pilihan Jenis Biasiswa (Termasuk Lain-lain Baharu) */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                PILIHAN JENIS BIASISWA
              </label>
              <select
                value={selectedAssistanceType}
                onChange={(e) => setSelectedAssistanceType(e.target.value)}
                className="w-full clay-input px-3 py-2 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="All">Semua Jenis Biasiswa ({scholarships.length})</option>
                <option value="BKPKK">Semua Bantuan BKPKK (KPT)</option>
                <option value="ZAKAT">Semua Biasiswa Zakat Negeri</option>
                <option value="YAYASAN">Semua Bantuan Yayasan</option>
                <optgroup label="Senarai Penuh & Bantuan Baharu">
                  {uniqueAssistanceTypes
                    .filter((t) => t !== 'All')
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Dropdown 2: Sesi Pengajian (Format Sesi I / Sesi II YYYY/YYYY+1) */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                SESI PENGAJIAN
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full clay-input px-3 py-2 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="All">Semua Sesi Pengajian</option>
                <optgroup label="Sesi Terkini (2 Kali Setahun)">
                  <option value="Sesi I 2026/2027">Sesi I 2026/2027</option>
                  <option value="Sesi II 2026/2027">Sesi II 2026/2027</option>
                  <option value="Sesi I 2025/2026">Sesi I 2025/2026</option>
                  <option value="Sesi II 2025/2026">Sesi II 2025/2026</option>
                </optgroup>
                <optgroup label="Sesi Terdahulu (Arkib)">
                  {ALL_ACADEMIC_SESSIONS.slice(4).map((sesi) => (
                    <option key={sesi} value={sesi}>
                      {sesi}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Carian Penerima */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                CARIAN PENERIMA
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nama, matrik, penaja, sesi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full clay-input pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                STATUS BIASISWA
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full clay-input px-3 py-2 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="All">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            {/* Filter Semester */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                SEMESTER BERMULA
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full clay-input px-3 py-2 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="All">Semua Semester</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
              </select>
            </div>
          </div>

          {/* Active Filter Bar & Reset */}
          {(selectedAssistanceType !== 'All' || selectedStatus !== 'All' || selectedSemester !== 'All' || selectedSession !== 'All' || searchTerm) && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Tapisan Aktif: {selectedAssistanceType !== 'All' ? selectedAssistanceType : ''} {selectedSession !== 'All' ? `• ${selectedSession}` : ''} {selectedStatus !== 'All' ? `• Status ${selectedStatus}` : ''} {selectedSemester !== 'All' ? `• ${selectedSemester}` : ''}
                </span>
                <span className="font-bold text-slate-600">
                  ({filteredScholarships.length} rekod dijumpai)
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedAssistanceType('All');
                  setSelectedStatus('All');
                  setSelectedSemester('All');
                  setSelectedSession('All');
                  setSearchTerm('');
                }}
                className="text-xs text-rose-600 font-black hover:underline cursor-pointer"
              >
                Set Semula Tapisan (Reset)
              </button>
            </div>
          )}
        </div>

        {/* Table Senarai Penerima */}
        <div className="clay-card overflow-hidden">
          <div className="p-4 bg-white/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Senarai Penerima Biasiswa & BKPKK ({filteredScholarships.length})
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Bantuan Kewangan & Sara Hidup Siswa Kolej Komuniti Sungai Petani (Disalurkan 2 Kali Setahun)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Jumlah Dana: RM {filteredTotalDisbursed.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100/90 text-slate-800 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">PENERIMA</th>
                  <th className="py-3 px-3">JENIS BANTUAN & PENAJA</th>
                  <th className="py-3 px-3">SESI PENGAJIAN</th>
                  <th className="py-3 px-3">SEMESTER DITERIMA (SENARAI)</th>
                  <th className="py-3 px-3 text-right">JUMLAH (RM)</th>
                  <th className="py-3 px-3 text-center">STATUS</th>
                  <th className="py-3 px-3">NO AKAUN BANK</th>
                  <th className="py-3 px-3 text-center">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredScholarships.length > 0 ? (
                  filteredScholarships.map((s) => {
                    // Badge color based on assistance type
                    const isBkpkk = s.jenisBantuan.includes('BKPKK');
                    const isZakat = s.jenisBantuan.toLowerCase().includes('zakat');
                    const isYayasan = s.jenisBantuan.toLowerCase().includes('yayasan');

                    const badgeStyle = isBkpkk
                      ? 'bg-blue-100 text-blue-900 border-blue-200'
                      : isZakat
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      : isYayasan
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : 'bg-purple-100 text-purple-900 border-purple-200';

                    const sessionLabel = getRecordSession(s);
                    const semestersList = getRecordSemesters(s);
                    const kekerapanLabel = s.kekerapan || '2 Kali Setahun (Ikut Semester)';

                    return (
                      <tr key={s.id} className="hover:bg-amber-50/40 transition-colors font-medium">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>
                            <span className="font-black text-slate-900 block">{s.namaPelajar}</span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">{s.matrik}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black border mb-0.5 ${badgeStyle}`}>
                            {s.jenisBantuan}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold block">{s.penaja}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-slate-900 text-white shadow-2xs border border-indigo-500/30">
                            <Calendar className="w-2.5 h-2.5 text-amber-400" />
                            {sessionLabel}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                            {kekerapanLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {/* Listkan setiap semester yang diterima */}
                          <div className="flex flex-col gap-1 min-w-[130px] max-w-[240px]">
                            {semestersList.map((sem, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-2xs"
                              >
                                <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
                                <span className="truncate">{sem}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-emerald-800 text-sm whitespace-nowrap">
                          RM {Number(s.jumlah).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {s.statusBiasiswa}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 font-bold text-[11px] whitespace-nowrap">{s.noAkaun || '-'}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => setViewingRecord(s)} 
                              title="Lihat Butiran"
                              className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-600 hover:text-indigo-700 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(s)} 
                              title="Kemaskini Terimaan Semester Semasa"
                              className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-600 hover:text-amber-700 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            </button>
                            <button 
                              onClick={() => handleDelete(s.id, s.namaPelajar)} 
                              title="Padam Rekod"
                              className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-600 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      <p className="text-sm font-bold text-slate-700">Tiada rekod penerima bagi tapisan yang dipilih.</p>
                      <button
                        onClick={() => {
                          setSelectedAssistanceType('All');
                          setSelectedStatus('All');
                          setSelectedSemester('All');
                          setSelectedSession('All');
                          setSearchTerm('');
                        }}
                        className="mt-2 text-xs font-black text-amber-700 underline cursor-pointer"
                      >
                        Papar Semula Semua Penerima
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider">
                    Jumlah Keseluruhan Penajaan Ditapis:
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-900 text-sm font-black bg-emerald-100/70 whitespace-nowrap">
                    RM {filteredTotalDisbursed.toLocaleString()}
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-right text-slate-600 text-[11px] font-bold">
                    {filteredScholarships.length} Orang Penerima
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      {/* MODAL: Tambah Rekod Bantuan / Biasiswa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Tambah Rekod Bantuan / Biasiswa Pelajar
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Bantuan biasa diterima 2 kali setahun mengikut sesi pengajian semester.
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScholarship} className="space-y-3.5 pt-4 text-xs">
              {/* 1. Pilih Pelajar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Pelajar *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => handleSelectStudentForScholarship(e.target.value)}
                  className="w-full clay-input px-3 py-2 font-semibold"
                >
                  <option value="">-- Pilih Pelajar --</option>
                  {students.map(s => (
                    <option key={s.matrik} value={s.matrik}>{s.nama} ({s.matrik})</option>
                  ))}
                </select>
              </div>

              {/* 2. Jenis Bantuan & Pilihan Lain-lain */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Bantuan / Biasiswa *
                </label>
                <select
                  value={selectedAssistanceDropdown}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAssistanceDropdown(val);
                    if (val !== 'LAIN_LAIN') {
                      let penajaAuto = 'Kementerian Pendidikan Tinggi (KPT)';
                      if (val.toLowerCase().includes('zakat')) penajaAuto = 'Lembaga Zakat Negeri Kedah';
                      if (val.toLowerCase().includes('yayasan')) penajaAuto = 'Yayasan Sultanah Bahiyah';
                      setFormData({ ...formData, jenisBantuan: val, penaja: penajaAuto });
                    }
                  }}
                  className="w-full clay-input px-3 py-2 font-bold text-slate-800 bg-white"
                >
                  <option value="BKPKK (Bantuan Kewangan Pelajar Kolej Komuniti)">BKPKK (KPT) - RM300/bulan</option>
                  <option value="Biasiswa Zakat Negeri Kedah (LZNK)">Zakat Kedah (LZNK)</option>
                  <option value="Bantuan Yayasan Wilayah / Pendidikan">Yayasan Pendidikan Negeri</option>
                  {/* Any custom types already registered */}
                  {customAssistanceTypes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="LAIN_LAIN">✨ Lain-lain (Sila Nyatakan Nama Bantuan/Biasiswa)</option>
                </select>

                {/* Input Khusus Apabila 'Lain-lain' Dipilih */}
                {selectedAssistanceDropdown === 'LAIN_LAIN' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2.5 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-black text-amber-950 mb-1">
                        Nama Bantuan / Biasiswa Baharu *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Biasiswa JPA / Bantuan Khas MARA / Dermasiswa PETRONAS"
                        value={otherAssistanceName}
                        onChange={(e) => setOtherAssistanceName(e.target.value)}
                        className="w-full clay-input px-3 py-2 text-xs font-bold bg-white"
                      />
                      <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">
                        * Nama ini akan disimpan secara automatik ke dalam senarai pilihan carian (filter).
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-amber-950 mb-1">
                        Nama Penaja / Agensi Pemberi Bantuan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Jabatan Perkhidmatan Awam (JPA)"
                        value={otherPenajaName}
                        onChange={(e) => setOtherPenajaName(e.target.value)}
                        className="w-full clay-input px-3 py-2 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Pilihan Sesi Pengajian & Kekerapan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Pilihan Sesi Pengajian *
                  </label>
                  <select
                    value={formData.sesi}
                    onChange={(e) => setFormData({ ...formData, sesi: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-bold text-slate-800 bg-white"
                  >
                    <optgroup label="Sesi Terkini (2 Sesi Setahun)">
                      <option value="Sesi I 2026/2027">Sesi I 2026/2027</option>
                      <option value="Sesi II 2026/2027">Sesi II 2026/2027</option>
                      <option value="Sesi I 2025/2026">Sesi I 2025/2026</option>
                      <option value="Sesi II 2025/2026">Sesi II 2025/2026</option>
                    </optgroup>
                    <optgroup label="Sesi Terdahulu">
                      {ALL_ACADEMIC_SESSIONS.slice(4).map((sesi) => (
                        <option key={sesi} value={sesi}>
                          {sesi}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                    Kekerapan Penyaluran
                  </label>
                  <select
                    value={formData.kekerapan}
                    onChange={(e) => setFormData({ ...formData, kekerapan: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-semibold text-slate-800 bg-white"
                  >
                    <option value="2 Kali Setahun (Ikut Semester)">2 Kali Setahun (Ikut Semester)</option>
                    <option value="1 Kali Sahaja (Sesi Semasa)">1 Kali Sahaja (Sesi Semasa)</option>
                    <option value="Bantuan Khas / One-off">Bantuan Khas / One-off</option>
                  </select>
                </div>
              </div>

              {/* 4. Pilihan Semester Diterima (Listkan Setiap Semester) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black uppercase text-slate-800 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Semester Diterima (Penyaluran 2 Kali Setahun) *
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">
                    {formData.selectedSemesters?.length || 0} Semester Dipilih
                  </span>
                </div>

                {/* Checkboxes for Semesters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'].map((sem) => {
                    const isChecked = formData.selectedSemesters?.includes(sem);
                    return (
                      <label
                        key={sem}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = formData.selectedSemesters || [];
                            let updated;
                            if (e.target.checked) {
                              updated = [...current, sem].sort();
                            } else {
                              updated = current.filter(item => item !== sem);
                              if (updated.length === 0) updated = [sem];
                            }
                            setFormData({ 
                              ...formData, 
                              selectedSemesters: updated,
                              jumlah: updated.length * 1800
                            });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>{sem}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500">Pilihan Pantas:</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedSemesters: ['Semester 1', 'Semester 2'], jumlah: 3600 })}
                    className="px-2 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-[10px] font-bold text-indigo-900 cursor-pointer"
                  >
                    ⚡ 2 Kali Setahun: Sem 1 & 2 (RM3,600)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedSemesters: ['Semester 3', 'Semester 4'], jumlah: 3600 })}
                    className="px-2 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-[10px] font-bold text-indigo-900 cursor-pointer"
                  >
                    ⚡ 2 Kali Setahun: Sem 3 & 4 (RM3,600)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedSemesters: ['Semester 1'], jumlah: 1800 })}
                    className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-800 cursor-pointer"
                  >
                    1 Semester Sahaja (RM1,800)
                  </button>
                </div>
              </div>

              {/* 5. Kekotak Automasi: 2 Kali Setahun (Sesi I & Sesi II) */}
              <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="autoBothSessions"
                  checked={formData.autoCreateBothSessions}
                  onChange={(e) => setFormData({ ...formData, autoCreateBothSessions: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="autoBothSessions" className="text-xs font-bold text-blue-950 cursor-pointer">
                  Daftar Penyaluran Lengkap 2 Kali Setahun (Sesi I & Sesi II {formData.sesi.match(/\d{4}\/\d{4}/)?.[0] || '2026/2027'})
                  <span className="block text-[10px] text-blue-700 font-normal mt-0.5">
                    Sistem akan menjana kedua-dua rekod Sesi I dan Sesi II secara serentak (RM{Number(formData.jumlah).toLocaleString()} setiap sesi).
                  </span>
                </label>
              </div>

              {/* 6. Jumlah Penyaluran & Preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Setiap Sesi (RM) *</label>
                  <input
                    type="number"
                    required
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-black text-emerald-800 text-sm"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jumlah: 1800 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      RM1,800 (1 Sesi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jumlah: 3600 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      RM3,600 (Setahun)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jumlah: 2500 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      RM2,500 (Zakat)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester Bermula</label>
                  <select
                    value={formData.semesterMula}
                    onChange={(e) => setFormData({ ...formData, semesterMula: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-bold"
                  >
                    <option value="Semester 1">Semester 1 (Sesi I)</option>
                    <option value="Semester 2">Semester 2 (Sesi II)</option>
                    <option value="Semester 3">Semester 3 (Sesi I)</option>
                    <option value="Semester 4">Semester 4 (Sesi II)</option>
                  </select>
                </div>
              </div>

              {/* 7. No Akaun Bank */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">No. Akaun Bank Siswa</label>
                <input
                  type="text"
                  placeholder="Contoh: 152012984920 (Maybank) / Bank Islam"
                  value={formData.noAkaun}
                  onChange={(e) => setFormData({ ...formData, noAkaun: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-mono font-semibold"
                />
              </div>

              {/* 8. Catatan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Layak elaun sara hidup penuh / Kehadiran 100%"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full clay-input px-3 py-2 text-xs"
                />
              </div>

              {/* Butang Tindakan */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="clay-btn px-4 py-2 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 cursor-pointer border border-emerald-300">
                  Simpan Rekod Biasiswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Butiran Penerima */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-md w-full p-6 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{viewingRecord.namaPelajar}</h3>
                <span className="text-[10px] font-mono font-bold text-slate-500">{viewingRecord.matrik}</span>
              </div>
              <button onClick={() => setViewingRecord(null)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="clay-card-sm p-3.5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Bantuan:</span>
                  <span className="font-black text-slate-900">{viewingRecord.jenisBantuan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Penaja:</span>
                  <span className="font-bold text-slate-800">{viewingRecord.penaja}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Sesi Pengajian:</span>
                  <span className="inline-flex items-center gap-1 font-black text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                    <Calendar className="w-3 h-3 text-indigo-600" />
                    {getRecordSession(viewingRecord)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Kekerapan:</span>
                  <span className="font-bold text-amber-800">{viewingRecord.kekerapan || '2 Kali Setahun (Ikut Semester)'}</span>
                </div>
                
                {/* Senarai Setiap Semester Yang Diterima */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-black block text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Senarai Semester Diterima:
                  </span>
                  <div className="flex flex-col gap-1">
                    {getRecordSemesters(viewingRecord).map((sem, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black bg-indigo-50 text-indigo-950 border border-indigo-200 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{sem}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-bold">Jumlah Bantuan:</span>
                  <span className="font-black text-emerald-700 text-sm">RM {Number(viewingRecord.jumlah).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">No. Akaun:</span>
                  <span className="font-mono font-black text-slate-900">{viewingRecord.noAkaun || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {viewingRecord.statusBiasiswa}
                  </span>
                </div>
                {viewingRecord.catatan && (
                  <div className="pt-1.5 border-t border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px]">Catatan:</span>
                    <span className="text-slate-700 font-medium text-[11px]">{viewingRecord.catatan}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setViewingRecord(null)} className="clay-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-800 cursor-pointer">
                Tutup
              </button>
              <button 
                onClick={() => {
                  const rec = viewingRecord;
                  setViewingRecord(null);
                  handleOpenEdit(rec);
                }} 
                className="clay-btn px-4 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                <span>Kemaskini Terimaan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Kemaskini Terimaan Biasiswa / BKPKK Semester Semasa */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  Kemaskini Terimaan Semester Semasa
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                  Kemas kini status bayaran, semester pengajian, dan catatan bagi pelajar kelas anda.
                </span>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Info Box */}
            <div className="mt-3.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Penerima Bantuan:</span>
                <span className="font-black text-slate-900 text-sm">{editFormData.namaPelajar}</span>
                <span className="text-[11px] font-mono text-slate-600 font-bold block">{editFormData.matrik}</span>
                {isClassRestricted && (
                  <span className="inline-block mt-1 text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-black border border-amber-300">
                    Kelas: {activeClassName}
                  </span>
                )}
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Bantuan & Penaja:</span>
                <span className="font-black text-indigo-900 block truncate max-w-[200px]">{editFormData.jenisBantuan}</span>
                <span className="text-[10px] text-slate-600 font-bold block">{editFormData.penaja}</span>
              </div>
            </div>

            <form onSubmit={handleSaveEditScholarship} className="space-y-4 pt-3.5 text-xs">
              {/* 1. Sesi Pengajian Semasa */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Sesi Pengajian Semasa *
                </label>
                <select
                  required
                  value={editFormData.sesi}
                  onChange={(e) => setEditFormData({ ...editFormData, sesi: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold bg-white text-slate-800 border border-slate-300 rounded-xl"
                >
                  <optgroup label="Sesi Terkini (2 Kali Setahun)">
                    <option value="Sesi I 2026/2027">Sesi I 2026/2027</option>
                    <option value="Sesi II 2026/2027">Sesi II 2026/2027</option>
                    <option value="Sesi I 2025/2026">Sesi I 2025/2026</option>
                    <option value="Sesi II 2025/2026">Sesi II 2025/2026</option>
                  </optgroup>
                  <optgroup label="Sesi Arkib">
                    {ALL_ACADEMIC_SESSIONS.slice(4).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                </select>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                  * Pilih sesi semasa bagi semakan terimaan bantuan ini.
                </span>
              </div>

              {/* 2. Semester Terimaan (Senarai Semester Yang Diterima) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    Semester Terimaan (Tandakan Semester Yang Diterima) *
                  </label>
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    {editFormData.selectedSemesters.length} Semester Dipilih
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { id: 'Semester 1', label: 'Semester 1 (Sesi I)' },
                    { id: 'Semester 2', label: 'Semester 2 (Sesi II)' },
                    { id: 'Semester 3', label: 'Semester 3 (Sesi I)' },
                    { id: 'Semester 4', label: 'Semester 4 (Sesi II)' }
                  ].map(sem => {
                    const isChecked = editFormData.selectedSemesters.includes(sem.id);
                    return (
                      <button
                        type="button"
                        key={sem.id}
                        onClick={() => handleToggleEditSemester(sem.id)}
                        className={`p-2.5 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs ring-1 ring-indigo-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{sem.label}</span>
                          <span className={`text-[10px] font-black ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {isChecked ? '✓ RM1,800 (Aktif)' : '+ RM1,800 (Klik Tambah)'}
                          </span>
                        </div>
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-slate-300 inline-block shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Auto-Calculate Calculation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-300 text-emerald-950 mt-2 shadow-2xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Auto-Kira Elaun: <strong>{editFormData.selectedSemesters.length} Semester</strong> × RM1,800</span>
                  </span>
                  <span>
                    Jumlah: <strong className="text-emerald-900 text-sm font-black underline">RM{(editFormData.selectedSemesters.length * 1800).toLocaleString()}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                  * Jumlah terimaan di bawah akan bertambah secara automatik (+RM1,800) setiap kali semester dipilih.
                </span>
              </div>

              {/* 3. Status Terimaan Semester Semasa & Jumlah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Biasiswa / Terimaan *</label>
                  <select
                    value={editFormData.statusBiasiswa}
                    onChange={(e) => setEditFormData({ ...editFormData, statusBiasiswa: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-black text-slate-800 bg-white"
                  >
                    <option value="Aktif">Aktif (Sedang Berjalan)</option>
                    <option value="Telah Diterima">Telah Diterima (Kredit Masuk)</option>
                    <option value="Dalam Proses Penyaluran">Dalam Proses Penyaluran</option>
                    <option value="Selesai">Selesai (Tamat Pengajian)</option>
                    <option value="Ditangguhkan">Ditangguhkan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Jumlah Terimaan (RM) *</span>
                    <span className="text-[10px] text-emerald-700 font-black">Auto Ditambah</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.jumlah}
                    onChange={(e) => setEditFormData({ ...editFormData, jumlah: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-black text-emerald-800 text-sm"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, jumlah: editFormData.selectedSemesters.length * 1800 })}
                      className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-[10px] font-black text-emerald-900 border border-emerald-300 cursor-pointer"
                    >
                      ⚡ Auto: RM{(editFormData.selectedSemesters.length * 1800).toLocaleString()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, jumlah: 1800 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      RM1,800 (1 Sem)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, jumlah: 3600 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      RM3,600 (2 Sem)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, jumlah: 5400 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      RM5,400 (3 Sem)
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Tarikh Kelulusan / Terimaan & No Akaun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarikh Terimaan / Pengkreditan</label>
                  <input
                    type="date"
                    value={editFormData.tarikhKelulusan}
                    onChange={(e) => setEditFormData({ ...editFormData, tarikhKelulusan: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Akaun Bank Siswa</label>
                  <input
                    type="text"
                    placeholder="Contoh: 152012984920 (Maybank)"
                    value={editFormData.noAkaun}
                    onChange={(e) => setEditFormData({ ...editFormData, noAkaun: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              {/* 5. Catatan / Rujukan Terimaan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Status Penyaluran Semester Semasa</label>
                <input
                  type="text"
                  placeholder="Contoh: Elaun semester semasa telah disahkan masuk ke akaun bank / Menunggu proses bendahari"
                  value={editFormData.catatan}
                  onChange={(e) => setEditFormData({ ...editFormData, catatan: e.target.value })}
                  className="w-full clay-input px-3 py-2 text-xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="clay-btn px-4 py-2 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="clay-btn px-5 py-2 rounded-xl font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 shadow-sm cursor-pointer"
                >
                  Simpan Kemaskini Terimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

