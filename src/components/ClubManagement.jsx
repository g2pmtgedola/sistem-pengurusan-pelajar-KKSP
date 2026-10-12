import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Users, 
  Plus, 
  ChevronRight,
  X,
  Edit3,
  Trash2,
  UserPlus,
  CheckCircle2,
  Award,
  ShieldCheck,
  Search,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import TabHeroBanner from './TabHeroBanner';

const CLUB_CATEGORIES = [
  'Kepimpinan',
  'Keusahawanan',
  'Kecergasan & Sukan',
  'Kerohanian & Sahsiah',
  'Akademik & Inovasi',
  'Kebajikan & Kemasyarakatan',
  'Seni & Kebudayaan',
  'Lain-lain'
];

const POSITION_PRESETS = [
  'Presiden / Yang Dipertua (YDP)',
  'Naib Presiden / Naib YDP',
  'Setiausaha',
  'Bendahari',
  'Exco / AJK Publisiti',
  'Exco / AJK Kebajikan',
  'Exco / AJK Logistik',
  'Exco / AJK Sukan',
  'Ahli Aktif',
  'Ahli Biasa'
];

export default function ClubManagement({ 
  clubs, 
  setClubs, 
  students,
  currentUser,
  isClassRestricted = false,
  activeClassName = ''
}) {
  const [selectedClubId, setSelectedClubId] = useState(clubs[0]?.id || 'CLB-01');
  const [clubSearchTerm, setClubSearchTerm] = useState('');
  
  // Modal states
  const [isAddClubOpen, setIsAddClubOpen] = useState(false);
  const [isEditClubOpen, setIsEditClubOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);

  // Form states for Club
  const [newClub, setNewClub] = useState({
    id: `CLB-${Date.now()}`,
    namaKelab: '',
    kategori: 'Kepimpinan',
    penasihat: '',
    bilAhli: 0,
    aktivitiUtama: '',
    pencapaianKelab: '',
    ahliPelajar: []
  });

  const [editClubData, setEditClubData] = useState({
    id: '',
    namaKelab: '',
    kategori: 'Kepimpinan',
    penasihat: '',
    bilAhli: 0,
    aktivitiUtama: '',
    pencapaianKelab: '',
    ahliPelajar: []
  });

  // Form states for Member
  const [newMember, setNewMember] = useState({
    studentId: '',
    jawatan: 'Ahli Aktif',
    tarikhLantikan: new Date().toISOString().slice(0, 10)
  });

  const [editingMember, setEditingMember] = useState({
    originalStudentId: '',
    studentId: '',
    studentName: '',
    jawatan: 'Ahli Aktif',
    tarikhLantikan: new Date().toISOString().slice(0, 10)
  });

  const [memberSearchFilter, setMemberSearchFilter] = useState('');

  // Active Club resolution
  const activeClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  // Matriks of allowed students for current user
  const allowedStudentMatriks = useMemo(() => {
    return new Set((students || []).map(s => s.matrik));
  }, [students]);

  // Members visible to current user (filtered by class if isClassRestricted)
  const visibleMembers = useMemo(() => {
    const list = activeClub?.ahliPelajar || [];
    if (!isClassRestricted) return list;
    return list.filter(m => allowedStudentMatriks.has(m.studentId));
  }, [activeClub, isClassRestricted, allowedStudentMatriks]);

  // Filtered clubs for left list
  const filteredClubs = clubs.filter(c => 
    c.namaKelab.toLowerCase().includes(clubSearchTerm.toLowerCase()) ||
    c.kategori.toLowerCase().includes(clubSearchTerm.toLowerCase()) ||
    c.penasihat.toLowerCase().includes(clubSearchTerm.toLowerCase())
  );

  // --- CLUB CRUD HANDLERS ---
  const handleOpenAddClub = () => {
    setNewClub({
      id: `CLB-${Date.now()}`,
      namaKelab: '',
      kategori: 'Kepimpinan',
      penasihat: '',
      bilAhli: 0,
      aktivitiUtama: '',
      pencapaianKelab: '',
      ahliPelajar: []
    });
    setIsAddClubOpen(true);
  };

  const handleSaveClub = (e) => {
    e.preventDefault();
    if (!newClub.namaKelab.trim()) {
      alert('Sila masukkan nama kelab!');
      return;
    }
    const created = {
      ...newClub,
      id: `CLB-${Date.now()}`,
      bilAhli: Number(newClub.bilAhli) || 0
    };
    setClubs(prev => [created, ...prev]);
    setSelectedClubId(created.id);
    setIsAddClubOpen(false);
  };

  const handleOpenEditClub = () => {
    if (!activeClub) return;
    setEditClubData({
      id: activeClub.id,
      namaKelab: activeClub.namaKelab || '',
      kategori: activeClub.kategori || 'Kepimpinan',
      penasihat: activeClub.penasihat || '',
      bilAhli: activeClub.bilAhli || activeClub.ahliPelajar?.length || 0,
      aktivitiUtama: activeClub.aktivitiUtama || '',
      pencapaianKelab: activeClub.pencapaianKelab || '',
      ahliPelajar: activeClub.ahliPelajar || []
    });
    setIsEditClubOpen(true);
  };

  const handleUpdateClub = (e) => {
    e.preventDefault();
    if (!editClubData.namaKelab.trim()) {
      alert('Sila masukkan nama kelab!');
      return;
    }

    setClubs(prev => prev.map(c => {
      if (c.id === editClubData.id) {
        return {
          ...c,
          namaKelab: editClubData.namaKelab.trim(),
          kategori: editClubData.kategori,
          penasihat: editClubData.penasihat.trim(),
          bilAhli: Number(editClubData.bilAhli) || c.ahliPelajar?.length || 0,
          aktivitiUtama: editClubData.aktivitiUtama.trim(),
          pencapaianKelab: editClubData.pencapaianKelab.trim()
        };
      }
      return c;
    }));

    setIsEditClubOpen(false);
  };

  const handleDeleteClub = (clubId, clubName) => {
    if (window.confirm(`Adakah anda pasti ingin memadam kelab "${clubName}" beserta semua rekod anggotanya? Tindakan ini tidak boleh diundur.`)) {
      const remaining = clubs.filter(c => c.id !== clubId);
      setClubs(remaining);
      if (selectedClubId === clubId) {
        setSelectedClubId(remaining[0]?.id || '');
      }
    }
  };

  // --- MEMBER CRUD HANDLERS ---
  const handleOpenAddMember = () => {
    setMemberSearchFilter('');
    setNewMember({
      studentId: '',
      jawatan: 'Ahli Aktif',
      tarikhLantikan: new Date().toISOString().slice(0, 10)
    });
    setIsAddMemberOpen(true);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!activeClub || !newMember.studentId) {
      alert('Sila pilih pelajar yang ingin didaftarkan!');
      return;
    }

    // Check if student already registered in this club
    const existing = activeClub.ahliPelajar?.find(m => m.studentId === newMember.studentId);
    if (existing) {
      if (!window.confirm(`Pelajar ini sudah berdaftar sebagai "${existing.jawatan}". Adakah anda ingin mengemas kini jawatannya?`)) {
        return;
      }
      // Update existing
      setClubs(prev => prev.map(c => {
        if (c.id === activeClub.id) {
          return {
            ...c,
            ahliPelajar: c.ahliPelajar.map(m => 
              m.studentId === newMember.studentId 
                ? { ...m, jawatan: newMember.jawatan, tarikhLantikan: newMember.tarikhLantikan } 
                : m
            )
          };
        }
        return c;
      }));
      setIsAddMemberOpen(false);
      return;
    }

    const studentObj = students.find(s => s.matrik === newMember.studentId);
    if (!studentObj) return;

    const memberEntry = {
      studentId: studentObj.matrik,
      studentName: studentObj.nama,
      jawatan: newMember.jawatan.trim() || 'Ahli Aktif',
      tarikhLantikan: newMember.tarikhLantikan || new Date().toISOString().slice(0, 10)
    };

    setClubs(prev => prev.map(c => {
      if (c.id === activeClub.id) {
        const currentMembers = c.ahliPelajar || [];
        return {
          ...c,
          bilAhli: Math.max(c.bilAhli + 1, currentMembers.length + 1),
          ahliPelajar: [...currentMembers, memberEntry]
        };
      }
      return c;
    }));

    setIsAddMemberOpen(false);
  };

  const handleOpenEditMember = (member) => {
    if (isClassRestricted && !allowedStudentMatriks.has(member.studentId)) {
      alert('Anda hanya dibenarkan menguruskan data pelajar daripada kelas anda sahaja.');
      return;
    }
    setEditingMember({
      originalStudentId: member.studentId,
      studentId: member.studentId,
      studentName: member.studentName,
      jawatan: member.jawatan || 'Ahli Aktif',
      tarikhLantikan: member.tarikhLantikan || new Date().toISOString().slice(0, 10)
    });
    setIsEditMemberOpen(true);
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (!activeClub || !editingMember.originalStudentId) return;

    setClubs(prev => prev.map(c => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          ahliPelajar: (c.ahliPelajar || []).map(m => {
            if (m.studentId === editingMember.originalStudentId) {
              return {
                ...m,
                jawatan: editingMember.jawatan.trim() || 'Ahli Aktif',
                tarikhLantikan: editingMember.tarikhLantikan
              };
            }
            return m;
          })
        };
      }
      return c;
    }));

    setIsEditMemberOpen(false);
  };

  const handleDeleteMember = (studentId, studentName) => {
    if (isClassRestricted && !allowedStudentMatriks.has(studentId)) {
      alert('Anda hanya dibenarkan menguruskan data pelajar daripada kelas anda sahaja.');
      return;
    }
    if (window.confirm(`Adakah anda pasti ingin mengeluarkan pelajar "${studentName}" (${studentId}) daripada kelab "${activeClub?.namaKelab}"?`)) {
      setClubs(prev => prev.map(c => {
        if (c.id === activeClub.id) {
          const updatedMembers = (c.ahliPelajar || []).filter(m => m.studentId !== studentId);
          return {
            ...c,
            bilAhli: Math.max(0, updatedMembers.length),
            ahliPelajar: updatedMembers
          };
        }
        return c;
      }));
    }
  };

  // Helper to get category badge color
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Kepimpinan':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Keusahawanan':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Kecergasan & Sukan':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Kerohanian & Sahsiah':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Akademik & Inovasi':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner Matching User Reference */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ KOKURIKULUM SISWA"
        title="Pengurusan Kelab & Persatuan Pelajar"
        subtitle="Maklumat penglibatan badan kepimpinan siswa, kelab aktiviti berdaftar, ko-kurikulum, pendaftaran ahli, lantikan jawatankuasa, dan rekod pencapaian persatuan."
      >
        {!isClassRestricted && (
          <button
            onClick={handleOpenAddClub}
            className="px-4 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Daftar Kelab Baharu</span>
          </button>
        )}

        <div className="px-4 py-2 bg-slate-800/80 rounded-full border border-slate-600/60 text-slate-200 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>Jumlah Kelab Aktif: <strong className="text-white text-sm font-black ml-1">{clubs.length} Kelab</strong></span>
        </div>
      </TabHeroBanner>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clubs List & Search */}
        <div className="lg:col-span-4 clay-card p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              Senarai Kelab ({clubs.length})
            </span>
            {!isClassRestricted && (
              <button
                onClick={handleOpenAddClub}
                title="Daftar Kelab Baharu"
                className="text-[11px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            )}
          </div>

          {/* Search Clubs */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kelab, penasihat, kategori..."
              value={clubSearchTerm}
              onChange={(e) => setClubSearchTerm(e.target.value)}
              className="w-full clay-input pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Club Cards List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredClubs.length > 0 ? (
              filteredClubs.map(club => {
                const isSelected = activeClub?.id === club.id;
                return (
                  <div
                    key={club.id}
                    onClick={() => setSelectedClubId(club.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer group ${
                      isSelected 
                        ? 'clay-card-pill border-2 border-purple-500 scale-[1.01] bg-purple-50/40 shadow-sm' 
                        : 'clay-btn hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 truncate max-w-[200px]">
                        {club.namaKelab}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-purple-600 translate-x-0.5' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-bold">
                      <span className="truncate max-w-[150px]">{club.kategori}</span>
                      <span className="font-black text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full border border-purple-200">
                        {club.bilAhli || club.ahliPelajar?.length || 0} Ahli
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-bold">
                Tiada kelab sepadan dengan carian.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Club Details & Member Management */}
        <div className="lg:col-span-8 space-y-6">
          {/* Class Restriction Notice Banner */}
          {isClassRestricted && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start sm:items-center gap-3 text-xs text-amber-900 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-black block text-amber-950">
                  🔒 Mod Capaian Terhad: Kelas {activeClassName}
                </span>
                <span className="text-[11px] text-amber-800 font-medium">
                  Sebagai Pensyarah Kelas <strong>{activeClassName}</strong>, anda hanya boleh melihat dan mendaftar pelajar daripada kelas anda sahaja. Rekod pelajar kelas lain tidak dipaparkan untuk menjaga privasi data.
                </span>
              </div>
            </div>
          )}

          {activeClub ? (
            <>
              {/* Club Header Card */}
              <div className="clay-card p-6 bg-white border border-slate-300 relative">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider inline-block ${getCategoryBadgeClass(activeClub.kategori)}`}>
                      {activeClub.kategori}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight break-words">
                      {activeClub.namaKelab}
                    </h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      Pegawai Penasihat: <strong className="text-slate-900 font-black">{activeClub.penasihat || 'Belum Ditetapkan'}</strong>
                    </p>
                    {activeClub.aktivitiUtama && (
                      <p className="text-[11px] text-slate-500 font-medium pt-1">
                        Aktiviti Utama: <span className="text-slate-700 font-bold">{activeClub.aktivitiUtama}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions for Club & Member Registration */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Register Student Button */}
                    <button
                      onClick={handleOpenAddMember}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm rounded-xl active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Daftar Pelajar</span>
                    </button>

                    {/* Edit & Delete Club Buttons (Admin Only) */}
                    {!isClassRestricted && (
                      <>
                        <button
                          onClick={handleOpenEditClub}
                          className="clay-btn px-3 py-2 text-indigo-700 hover:text-indigo-900 text-xs font-black flex items-center gap-1.5 cursor-pointer rounded-xl border border-indigo-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Kelab</span>
                        </button>

                        <button
                          onClick={() => handleDeleteClub(activeClub.id, activeClub.namaKelab)}
                          className="clay-btn px-3 py-2 text-rose-700 hover:text-rose-900 text-xs font-black flex items-center gap-1.5 cursor-pointer rounded-xl border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Padam Kelab</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 pt-4 border-t border-slate-200 text-xs">
                  <div className="clay-card-sm p-3.5 bg-slate-50/80 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">
                        {isClassRestricted ? `Ahli Kelas ${activeClassName}` : 'Jumlah Keahlian'}
                      </span>
                      <span className="font-black text-slate-900 text-lg">
                        {isClassRestricted ? `${visibleMembers.length} Orang` : `${activeClub.bilAhli || activeClub.ahliPelajar?.length || 0} Orang`}
                      </span>
                      {isClassRestricted && (
                        <span className="text-[10px] text-slate-500 block font-semibold">
                          (Daripada {activeClub.bilAhli || activeClub.ahliPelajar?.length || 0} ahli keseluruhan kelab)
                        </span>
                      )}
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="clay-card-sm p-3.5 bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-amber-800 text-[10px] uppercase font-bold block">Pencapaian Terbaik</span>
                      <span className="font-black text-slate-900 truncate block text-xs" title={activeClub.pencapaianKelab}>
                        {activeClub.pencapaianKelab || 'Tiada rekod pencapaian rasmi'}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <div className="clay-card overflow-hidden">
                <div className="p-4 bg-white/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      {isClassRestricted 
                        ? `Jawatankuasa & Ahli Kelas ${activeClassName} (${visibleMembers.length})` 
                        : `Jawatankuasa & Ahli Berdaftar (${visibleMembers.length})`}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {isClassRestricted 
                        ? `Senarai pelajar kelas ${activeClassName} yang berdaftar dalam kelab ini.` 
                        : 'Senarai pelajar Kolej Komuniti Sungai Petani yang memegang jawatan dan berdaftar dalam kelab ini.'}
                    </span>
                  </div>

                  <button
                    onClick={handleOpenAddMember}
                    className="clay-btn px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-400 text-xs font-black hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl self-start sm:self-auto"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Daftar Ahli Baharu</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100/90 text-slate-800 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">NAMA PELAJAR</th>
                        <th className="py-3 px-3">NO MATRIK</th>
                        <th className="py-3 px-3">JAWATAN KELAB</th>
                        <th className="py-3 px-3">TARIKH LANTIKAN</th>
                        <th className="py-3 px-3 text-center">TINDAKAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {visibleMembers && visibleMembers.length > 0 ? (
                        visibleMembers.map((m, idx) => {
                          const isHighRank = m.jawatan?.toLowerCase().includes('presiden') || 
                                             m.jawatan?.toLowerCase().includes('ydp') || 
                                             m.jawatan?.toLowerCase().includes('setiausaha') || 
                                             m.jawatan?.toLowerCase().includes('bendahari');
                          return (
                            <tr key={idx} className="hover:bg-amber-50/40 transition-colors font-medium">
                              <td className="py-3 px-4 font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  {isHighRank && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Jawatankuasa Utama" />
                                  )}
                                  <span>{m.studentName}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-600 font-bold text-[11px]">{m.studentId}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] border ${
                                  isHighRank 
                                    ? 'bg-purple-100 text-purple-900 border-purple-300' 
                                    : 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}>
                                  {m.jawatan}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-semibold font-mono text-[11px]">
                                {m.tarikhLantikan || '-'}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditMember(m)}
                                    title="Edit Jawatan Pelajar"
                                    className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-600 hover:text-indigo-700 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMember(m.studentId, m.studentName)}
                                    title="Padam Ahli daripada Kelab"
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
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            <p className="text-sm font-bold text-slate-700">
                              {isClassRestricted 
                                ? `Tiada ahli berdaftar daripada kelas ${activeClassName} dalam kelab ini.` 
                                : 'Belum ada pelajar berdaftar dalam kelab ini.'}
                            </p>
                            <button
                              onClick={handleOpenAddMember}
                              className="mt-2 text-xs font-black text-amber-700 underline cursor-pointer"
                            >
                              + Daftarkan Pelajar {isClassRestricted ? `Kelas ${activeClassName}` : ''} Sekarang
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="clay-card p-12 text-center text-slate-500">
              <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-800">Tiada Kelab Dipilih</h3>
              <p className="text-xs text-slate-500 mt-1">Sila pilih kelab daripada senarai di sebelah kiri atau daftar kelab baharu.</p>
              {!isClassRestricted && (
                <button
                  onClick={handleOpenAddClub}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-full cursor-pointer shadow-sm"
                >
                  + Daftar Kelab Baharu
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Tambah Kelab Baharu */}
      {isAddClubOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-md w-full p-6 bg-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Daftar Kelab / Persatuan Baharu
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Masukkan butiran kelab kokurikulum siswa Kolej Komuniti.
                </span>
              </div>
              <button onClick={() => setIsAddClubOpen(false)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClub} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kelab / Persatuan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelab Robotik & IoT Siswa"
                  value={newClub.namaKelab}
                  onChange={(e) => setNewClub({ ...newClub, namaKelab: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Kelab *</label>
                <select
                  value={newClub.kategori}
                  onChange={(e) => setNewClub({ ...newClub, kategori: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold bg-white text-slate-800"
                >
                  {CLUB_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pegawai Penasihat</label>
                <input
                  type="text"
                  placeholder="Contoh: En. Mohd Faizal bin Abdullah"
                  value={newClub.penasihat}
                  onChange={(e) => setNewClub({ ...newClub, penasihat: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Aktiviti Utama Persatuan</label>
                <input
                  type="text"
                  placeholder="Contoh: Bengkel Mikropengawal, Pertandingan Inovasi Zon Utara"
                  value={newClub.aktivitiUtama}
                  onChange={(e) => setNewClub({ ...newClub, aktivitiUtama: e.target.value })}
                  className="w-full clay-input px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pencapaian Terbaik (Jika Ada)</label>
                <input
                  type="text"
                  placeholder="Contoh: Pingat Emas Karnival Inovasi Komuniti 2024"
                  value={newClub.pencapaianKelab}
                  onChange={(e) => setNewClub({ ...newClub, pencapaianKelab: e.target.value })}
                  className="w-full clay-input px-3 py-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddClubOpen(false)} className="clay-btn px-4 py-2 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 cursor-pointer">
                  Daftar Kelab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Maklumat Kelab */}
      {isEditClubOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-md w-full p-6 bg-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Kemaskini Maklumat Kelab
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Ubah suai butiran dan nama pegawai penasihat persatuan.
                </span>
              </div>
              <button onClick={() => setIsEditClubOpen(false)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateClub} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kelab / Persatuan *</label>
                <input
                  type="text"
                  required
                  value={editClubData.namaKelab}
                  onChange={(e) => setEditClubData({ ...editClubData, namaKelab: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Kelab *</label>
                <select
                  value={editClubData.kategori}
                  onChange={(e) => setEditClubData({ ...editClubData, kategori: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold bg-white text-slate-800"
                >
                  {CLUB_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pegawai Penasihat</label>
                <input
                  type="text"
                  value={editClubData.penasihat}
                  onChange={(e) => setEditClubData({ ...editClubData, penasihat: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Aktiviti Utama</label>
                <input
                  type="text"
                  value={editClubData.aktivitiUtama}
                  onChange={(e) => setEditClubData({ ...editClubData, aktivitiUtama: e.target.value })}
                  className="w-full clay-input px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pencapaian Terbaik</label>
                <input
                  type="text"
                  value={editClubData.pencapaianKelab}
                  onChange={(e) => setEditClubData({ ...editClubData, pencapaianKelab: e.target.value })}
                  className="w-full clay-input px-3 py-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditClubOpen(false)} className="clay-btn px-4 py-2 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-black text-indigo-900 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 cursor-pointer">
                  Simpan Kemaskini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Daftarkan Pelajar Untuk Kelab Yang Ada */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  Daftarkan Pelajar ke Kelab
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold block">
                  Kelab Sasaran: <strong className="text-slate-800 font-black">{activeClub?.namaKelab}</strong>
                  {isClassRestricted && (
                    <span className="ml-1.5 text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Kelas: {activeClassName}
                    </span>
                  )}
                </span>
              </div>
              <button onClick={() => setIsAddMemberOpen(false)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 pt-4 text-xs">
              {/* Filter / Search Pelajar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cari & Pilih Pelajar *</label>
                <input
                  type="text"
                  placeholder="Taip nama atau no. matrik untuk tapis..."
                  value={memberSearchFilter}
                  onChange={(e) => setMemberSearchFilter(e.target.value)}
                  className="w-full clay-input px-3 py-1.5 text-xs mb-1.5 bg-slate-50"
                />

                <select
                  required
                  size={5}
                  value={newMember.studentId}
                  onChange={(e) => setNewMember({ ...newMember, studentId: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-semibold bg-white border border-slate-300 rounded-xl"
                >
                  <option value="" disabled>-- Klik pelajar daripada senarai di bawah --</option>
                  {students
                    .filter(s => 
                      !memberSearchFilter || 
                      s.nama.toLowerCase().includes(memberSearchFilter.toLowerCase()) || 
                      s.matrik.toLowerCase().includes(memberSearchFilter.toLowerCase())
                    )
                    .map(s => {
                      const alreadyIn = activeClub?.ahliPelajar?.some(m => m.studentId === s.matrik);
                      return (
                        <option 
                          key={s.matrik} 
                          value={s.matrik}
                          className={alreadyIn ? 'text-amber-700 bg-amber-50/50 font-bold' : ''}
                        >
                          {s.nama} ({s.matrik}) {alreadyIn ? '★ [Sudah Berdaftar]' : ''}
                        </option>
                      );
                    })}
                </select>
                <span className="text-[10px] text-slate-500 font-bold block mt-1">
                  * Pilih seorang pelajar daripada senarai untuk mendaftar.
                </span>
              </div>

              {/* Jawatan Kelab */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jawatan / Peranan Pelajar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahli Aktif / Setiausaha / Bendahari / Exco"
                  value={newMember.jawatan}
                  onChange={(e) => setNewMember({ ...newMember, jawatan: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold"
                />

                {/* Preset Jawatan Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-500">Pilihan Pantas:</span>
                  {POSITION_PRESETS.slice(0, 6).map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setNewMember({ ...newMember, jawatan: pos })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      {pos.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarikh Lantikan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tarikh Pendaftaran / Lantikan</label>
                <input
                  type="date"
                  value={newMember.tarikhLantikan}
                  onChange={(e) => setNewMember({ ...newMember, tarikhLantikan: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-mono font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddMemberOpen(false)} className="clay-btn px-4 py-2 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 cursor-pointer">
                  Daftarkan Pelajar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Pelajar Yang Dah Berdaftar (Ubah Jawatan) */}
      {isEditMemberOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-md w-full p-6 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Kemaskini Jawatan Ahli
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Kelab: <strong className="text-slate-800">{activeClub?.namaKelab}</strong>
                </span>
              </div>
              <button onClick={() => setIsEditMemberOpen(false)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-3.5 pt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Pelajar</span>
                <span className="font-black text-slate-900 text-xs block mt-0.5">{editingMember.studentName}</span>
                <span className="font-mono text-slate-500 text-[10px] font-bold">{editingMember.studentId}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jawatan Kelab *</label>
                <input
                  type="text"
                  required
                  value={editingMember.jawatan}
                  onChange={(e) => setEditingMember({ ...editingMember, jawatan: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold"
                />

                <div className="flex flex-wrap items-center gap-1 mt-2">
                  {POSITION_PRESETS.slice(0, 5).map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setEditingMember({ ...editingMember, jawatan: pos })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      {pos.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tarikh Lantikan</label>
                <input
                  type="date"
                  value={editingMember.tarikhLantikan}
                  onChange={(e) => setEditingMember({ ...editingMember, tarikhLantikan: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-mono font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditMemberOpen(false)} className="clay-btn px-4 py-2 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-black text-indigo-900 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 cursor-pointer">
                  Simpan Jawatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
