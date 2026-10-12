import React, { useState, useMemo } from 'react';
import TabHeroBanner from './TabHeroBanner';
import { 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const AVAILABLE_CLASSES = [
  'SPK 1A', 'SPK 1B', 'SPK 2A', 'SPK 2B',
  'SPK 3A', 'SPK 3B', 'SPK 4A', 'SPK 4B'
];

export default function UserManagement({ users, setUsers, currentUser, setCurrentUser, students = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // 'All' | 'admin' | 'pensyarah'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Aktif' | 'Tidak Aktif'

  // Modal States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);

  // Custom class input states
  const [isCustomClassAdd, setIsCustomClassAdd] = useState(false);
  const [customClassAddInput, setCustomClassAddInput] = useState('');

  const [isCustomClassEdit, setIsCustomClassEdit] = useState(false);
  const [customClassEditInput, setCustomClassEditInput] = useState('');

  // Dynamically extract all available classes from registered students and existing users
  const availableClassList = useMemo(() => {
    const defaultClasses = [
      'SPK 1A', 'SPK 1B', 'SPK 2A', 'SPK 2B',
      'SPK 3A', 'SPK 3B', 'SPK 4A', 'SPK 4B'
    ];
    const fromStudents = (students || []).map(s => s.kelas?.trim()).filter(Boolean);
    const fromUsers = (users || []).map(u => u.assignedClass?.trim()).filter(c => c && c !== 'Semua Kelas');
    const combined = Array.from(new Set([...defaultClasses, ...fromStudents, ...fromUsers]));
    return combined.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [students, users]);

  // Form State: Add User
  const [newUserData, setNewUserData] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    role: 'pensyarah',
    assignedClass: 'SPK 1A',
    jawatan: 'Pensyarah Akademik',
    jabatan: 'Jabatan Pemprosesan Makanan',
    status: 'Aktif'
  });

  // Form State: Edit User
  const [editUserData, setEditUserData] = useState({
    id: '',
    nama: '',
    username: '',
    email: '',
    role: 'pensyarah',
    assignedClass: 'SPK 1A',
    jawatan: '',
    jabatan: '',
    status: 'Aktif'
  });

  // Form State: Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');

  // Summary Metrics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const pensyarahCount = users.filter(u => u.role === 'pensyarah').length;
  const activeCount = users.filter(u => u.status === 'Aktif').length;

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const matchSearch = 
      !searchTerm ||
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.jawatan && u.jawatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.jabatan && u.jabatan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  // Handlers
  const handleOpenAdd = () => {
    setIsCustomClassAdd(false);
    setCustomClassAddInput('');
    setNewUserData({
      nama: '',
      username: '',
      email: '',
      password: '',
      role: 'pensyarah',
      assignedClass: availableClassList[0] || 'SPK 1A',
      jawatan: 'Pensyarah Akademik',
      jabatan: 'Jabatan Pemprosesan Makanan',
      status: 'Aktif'
    });
    setIsAddUserOpen(true);
  };

  const handleSaveNewUser = (e) => {
    e.preventDefault();
    if (!newUserData.nama.trim() || !newUserData.username.trim() || !newUserData.password) {
      alert('Sila lengkapkan semua ruangan mandatori!');
      return;
    }

    // Check duplicate username
    const duplicate = users.find(u => u.username.toLowerCase() === newUserData.username.trim().toLowerCase());
    if (duplicate) {
      alert('Nama pengguna ini telah wujud. Sila pilih nama pengguna yang lain!');
      return;
    }

    const created = {
      ...newUserData,
      id: `USR-${Date.now().toString().slice(-4)}`,
      username: newUserData.username.trim().toLowerCase(),
      assignedClass: newUserData.role === 'admin' ? (newUserData.assignedClass || 'Semua Kelas') : (newUserData.assignedClass || 'SPK 1A'),
      tarikhDaftar: new Date().toISOString().slice(0, 10),
      lastLogin: 'Belum pernah log masuk'
    };

    setUsers(prev => [created, ...prev]);
    setIsAddUserOpen(false);
  };

  const handleOpenEdit = (user) => {
    setIsCustomClassEdit(false);
    setCustomClassEditInput('');
    setEditUserData({
      id: user.id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      role: user.role,
      assignedClass: user.assignedClass || (user.role === 'admin' ? 'Semua Kelas' : (availableClassList[0] || 'SPK 1A')),
      jawatan: user.jawatan || '',
      jabatan: user.jabatan || '',
      status: user.status || 'Aktif'
    });
    setEditingUser(user);
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!editUserData.nama.trim()) return;

    setUsers(prev => prev.map(u => {
      if (u.id === editUserData.id) {
        const updated = {
          ...u,
          nama: editUserData.nama.trim(),
          email: editUserData.email.trim(),
          role: editUserData.role,
          assignedClass: editUserData.role === 'admin' ? (editUserData.assignedClass || 'Semua Kelas') : (editUserData.assignedClass || 'SPK 1A'),
          jawatan: editUserData.jawatan.trim(),
          jabatan: editUserData.jabatan.trim(),
          status: editUserData.status
        };

        // If the logged in user is the one being edited, update active session
        if (currentUser && (currentUser.id === u.id || currentUser.username === u.username) && setCurrentUser) {
          setCurrentUser(prevCurrent => ({
            ...prevCurrent,
            ...updated
          }));
        }

        return updated;
      }
      return u;
    }));

    setEditingUser(null);
  };

  const handleOpenReset = (user) => {
    setResettingUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
  };

  const handleSaveResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword) {
      setResetError('Sila masukkan kata laluan baharu!');
      return;
    }
    if (newPassword.length < 5) {
      setResetError('Kata laluan hendaklah sekurang-kurangnya 5 aksara.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Pengesahan kata laluan tidak sepadan!');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === resettingUser.id) {
        return {
          ...u,
          password: newPassword
        };
      }
      return u;
    }));

    alert(`Kata laluan bagi akaun "${resettingUser.nama}" (${resettingUser.username}) telah berjaya dikemaskini!`);
    setResettingUser(null);
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id || user.username === currentUser?.username) {
      alert('Anda tidak boleh memadam akaun anda sendiri yang sedang digunakan untuk log masuk!');
      return;
    }

    if (window.confirm(`Adakah anda pasti ingin memadam akaun kakitangan "${user.nama}" (${user.username})? Tindakan ini tidak boleh diundur.`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ PENTADBIRAN SISTEM"
        title="Pengurusan Ahli & Kakitangan Sistem"
        subtitle="Pengurusan akaun kakitangan, peranan capaian Admin dan Pensyarah Akademik, reset kata laluan, dan status aktif pengguna sistem."
      >
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Tambah Ahli / Pengguna Baharu</span>
        </button>

        <div className="px-4 py-2 bg-slate-800/80 rounded-full border border-slate-600/60 text-slate-200 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Pentadbir Aktif: <strong className="text-white text-sm font-black ml-1">{adminCount} Orang</strong></span>
        </div>
      </TabHeroBanner>

      {/* 4 KPI Summary Cards */}
      <div className="clay-card p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <span className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Ringkasan Pengguna & Hak Capaian Sistem
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            Data dikemas kini secara masa nyata
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Total Users */}
          <div 
            onClick={() => { setRoleFilter('All'); setStatusFilter('All'); }}
            className={`clay-card-sm p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              roleFilter === 'All' ? 'ring-2 ring-indigo-500 bg-indigo-50/40' : 'hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block">JUMLAH KAKITANGAN</span>
              <div className="text-lg font-black text-indigo-900 mt-0.5">{totalUsers} Orang</div>
              <span className="text-[9px] text-indigo-700 font-bold">Semua Peranan Berdaftar</span>
            </div>
            <div className="w-8 h-8 rounded-full clay-badge-blue text-white font-black text-xs flex items-center justify-center">
              {totalUsers}
            </div>
          </div>

          {/* Admin Count */}
          <div 
            onClick={() => setRoleFilter('admin')}
            className={`clay-card-sm p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              roleFilter === 'admin' ? 'ring-2 ring-amber-500 bg-amber-50/40' : 'hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block">PENTADBIR SISTEM (ADMIN)</span>
              <div className="text-lg font-black text-amber-900 mt-0.5">{adminCount} Orang</div>
              <span className="text-[9px] text-amber-700 font-bold">Akses Penuh Semua Modul</span>
            </div>
            <div className="w-8 h-8 rounded-full clay-badge-orange text-white font-black text-xs flex items-center justify-center">
              {adminCount}
            </div>
          </div>

          {/* Pensyarah Count */}
          <div 
            onClick={() => setRoleFilter('pensyarah')}
            className={`clay-card-sm p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              roleFilter === 'pensyarah' ? 'ring-2 ring-purple-500 bg-purple-50/40' : 'hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block">PENSYARAH AKADEMIK</span>
              <div className="text-lg font-black text-purple-900 mt-0.5">{pensyarahCount} Orang</div>
              <span className="text-[9px] text-purple-700 font-bold">Pengurusan Data Pelajar & Kelab</span>
            </div>
            <div className="w-8 h-8 rounded-full clay-badge-red text-white font-black text-xs flex items-center justify-center">
              {pensyarahCount}
            </div>
          </div>

          {/* Active Accounts */}
          <div 
            onClick={() => setStatusFilter('Aktif')}
            className={`clay-card-sm p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              statusFilter === 'Aktif' ? 'ring-2 ring-emerald-500 bg-emerald-50/40' : 'hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block">AKAUN AKTIF</span>
              <div className="text-lg font-black text-emerald-800 mt-0.5">{activeCount} Akaun</div>
              <span className="text-[9px] text-emerald-700 font-bold">Boleh Log Masuk</span>
            </div>
            <div className="w-8 h-8 rounded-full clay-badge-green text-white font-black text-xs flex items-center justify-center">
              ✓
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="clay-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick Role Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500 mr-1">Tapis Peranan:</span>
            <button
              onClick={() => setRoleFilter('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'All' ? 'bg-slate-900 text-white font-black shadow-xs' : 'clay-btn text-slate-700'
              }`}
            >
              Semua Ahli ({totalUsers})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'admin' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'clay-btn text-amber-900'
              }`}
            >
              Admin ({adminCount})
            </button>
            <button
              onClick={() => setRoleFilter('pensyarah')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'pensyarah' ? 'bg-indigo-600 text-white font-black shadow-xs' : 'clay-btn text-indigo-800'
              }`}
            >
              Pensyarah ({pensyarahCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Cari nama, emel, username, jawatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full clay-input pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="clay-card overflow-hidden">
        <div className="p-4 bg-white/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              Senarai Kakitangan & Pengguna Sistem ({filteredUsers.length})
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              Kakitangan berdaftar mempunyai capaian mengikut peranan pentadbir atau pensyarah akademik.
            </span>
          </div>

          <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
            {filteredUsers.length} daripada {users.length} akaun
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/90 text-slate-800 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">PENGGUNA</th>
                <th className="py-3 px-3">EMEL & JABATAN</th>
                <th className="py-3 px-3 text-center">PERANAN</th>
                <th className="py-3 px-3 text-center">KELAS DITUGASKAN</th>
                <th className="py-3 px-3">JAWATAN RASMI</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3">LOG MASUK TERAKHIR</th>
                <th className="py-3 px-3 text-center">TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isCurrent = u.id === currentUser?.id || u.username === currentUser?.username;

                  return (
                    <tr key={u.id} className="hover:bg-amber-50/40 transition-colors font-medium">
                      {/* Name & Username */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-white'
                          }`}>
                            {u.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 block text-xs flex items-center gap-1.5">
                              {u.nama}
                              {isCurrent && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black border border-emerald-300">
                                  Anda
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Dept */}
                      <td className="py-3 px-3">
                        <span className="text-slate-900 font-semibold block text-[11px]">{u.email}</span>
                        <span className="text-[10px] text-slate-500 font-bold block">{u.jabatan || 'Kolej Komuniti'}</span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3 text-center">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            Admin UPP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-950 border border-indigo-300">
                            <GraduationCap className="w-3 h-3 text-indigo-600" />
                            Pensyarah
                          </span>
                        )}
                      </td>

                      {/* Assigned Class */}
                      <td className="py-3 px-3 text-center">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            Semua Kelas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-xs">
                            <GraduationCap className="w-3 h-3 text-indigo-600" />
                            {u.assignedClass || 'SPK 1A'}
                          </span>
                        )}
                      </td>

                      {/* Jawatan */}
                      <td className="py-3 px-3 text-slate-700 font-semibold text-[11px]">
                        {u.jawatan || '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {u.status || 'Aktif'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-3 text-slate-500 text-[11px] font-medium">
                        {u.lastLogin || '-'}
                      </td>

                      {/* Actions: Edit, Reset Password, Delete */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit User Button */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit Maklumat Ahli"
                            className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => handleOpenReset(u)}
                            title="Reset Kata Laluan"
                            className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-600 hover:text-amber-600 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrent}
                            title={isCurrent ? "Tidak boleh padam akaun semasa" : "Padam Akaun"}
                            className={`w-7 h-7 rounded-lg clay-btn flex items-center justify-center ${
                              isCurrent ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-slate-600 hover:text-rose-700 cursor-pointer'
                            }`}
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
                    <p className="text-sm font-bold text-slate-700">Tiada pengguna dijumpai.</p>
                    <button
                      onClick={() => { setSearchTerm(''); setRoleFilter('All'); setStatusFilter('All'); }}
                      className="mt-2 text-xs font-black text-amber-700 underline cursor-pointer"
                    >
                      Set Semula Carian
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tambah Pengguna Baharu */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-500" />
                  Tambah Pengguna / Ahli Baharu
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Daftarkan akaun kakitangan atau pentadbir baharu.
                </span>
              </div>
              <button onClick={() => setIsAddUserOpen(false)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewUser} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Penuh Kakitangan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: En. Ahmad Fakhrul bin Ismail"
                  value={newUserData.nama}
                  onChange={(e) => setNewUserData({ ...newUserData, nama: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pengguna (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ahmad"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emel Rasmi *</label>
                  <input
                    type="email"
                    required
                    placeholder="ahmad@kksp.edu.my"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full clay-input px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peranan Akses *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setNewUserData({
                        ...newUserData,
                        role: newRole,
                        assignedClass: newRole === 'admin' ? 'Semua Kelas' : (newUserData.assignedClass === 'Semua Kelas' ? 'SPK 1A' : newUserData.assignedClass)
                      });
                    }}
                    className="w-full clay-input px-3 py-2 font-bold bg-white text-slate-900"
                  >
                    <option value="pensyarah">Pensyarah Akademik</option>
                    <option value="admin">Pentadbir Sistem (Admin UPP)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      {newUserData.role === 'pensyarah' ? 'Pensyarah Kelas Ditugaskan *' : 'Kelas Ditugaskan'}
                    </label>
                    {newUserData.role === 'pensyarah' && (
                      <button
                        type="button"
                        onClick={() => setIsCustomClassAdd(prev => !prev)}
                        className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        {isCustomClassAdd ? 'Tutup Input Manual' : '+ Taip Kod Kelas'}
                      </button>
                    )}
                  </div>

                  {newUserData.role === 'pensyarah' ? (
                    <div className="space-y-2">
                      <select
                        value={newUserData.assignedClass}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomClassAdd(true);
                          } else {
                            setIsCustomClassAdd(false);
                            setNewUserData({ ...newUserData, assignedClass: e.target.value });
                          }
                        }}
                        className="w-full clay-input px-3 py-2 font-bold bg-white text-indigo-950 border-indigo-200"
                      >
                        <option value="" disabled>-- Pilih Kelas Ditugaskan --</option>
                        {availableClassList.map(cls => (
                          <option key={cls} value={cls}>Kelas {cls}</option>
                        ))}
                        <option value="Semua Kelas">Semua Kelas (Penyelaras / Akses Penuh)</option>
                        <option value="__CUSTOM__">➕ Masukkan / Daftar Kelas Baharu...</option>
                      </select>

                      {isCustomClassAdd && (
                        <div className="p-2.5 bg-indigo-50/90 rounded-xl border border-indigo-300 space-y-1.5 animate-fadeIn">
                          <label className="block text-[10px] font-black uppercase text-indigo-950">
                            Masukkan Nama / Kod Kelas Baharu:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Contoh: SFP 1B, STM 2A"
                              value={customClassAddInput}
                              onChange={(e) => setCustomClassAddInput(e.target.value.toUpperCase())}
                              className="flex-1 clay-input px-3 py-1.5 text-xs font-black text-indigo-950 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!customClassAddInput.trim()) {
                                  alert('Sila masukkan kod kelas!');
                                  return;
                                }
                                const formatted = customClassAddInput.trim().toUpperCase();
                                setNewUserData({ ...newUserData, assignedClass: formatted });
                                setIsCustomClassAdd(false);
                                setCustomClassAddInput('');
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg cursor-pointer"
                            >
                              Gunakan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="Semua Kelas (Akses Penuh)"
                      className="w-full clay-input px-3 py-2 font-bold bg-slate-100 text-slate-600 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              {newUserData.role === 'pensyarah' && (
                <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-[11px] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Hak capaian pensyarah dihadkan kepada data kelas <strong>{newUserData.assignedClass}</strong> sahaja apabila log masuk.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Laluan Awal *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 5 aksara"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jawatan Rasmi</label>
                  <input
                    type="text"
                    placeholder="Pensyarah DH41 / Ketua Unit"
                    value={newUserData.jawatan}
                    onChange={(e) => setNewUserData({ ...newUserData, jawatan: e.target.value })}
                    className="w-full clay-input px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan / Unit</label>
                  <input
                    type="text"
                    placeholder="Jabatan Pemprosesan Makanan / UPP"
                    value={newUserData.jabatan}
                    onChange={(e) => setNewUserData({ ...newUserData, jabatan: e.target.value })}
                    className="w-full clay-input px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddUserOpen(false)} className="clay-btn px-4 py-2 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 cursor-pointer">
                  Daftar Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Maklumat Pengguna */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Kemaskini Maklumat Ahli
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Akaun: <strong className="text-slate-800">@{editingUser.username}</strong>
                </span>
              </div>
              <button onClick={() => setEditingUser(null)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Penuh *</label>
                <input
                  type="text"
                  required
                  value={editUserData.nama}
                  onChange={(e) => setEditUserData({ ...editUserData, nama: e.target.value })}
                  className="w-full clay-input px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emel Rasmi *</label>
                  <input
                    type="email"
                    required
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    className="w-full clay-input px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peranan Akses *</label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setEditUserData({
                        ...editUserData,
                        role: newRole,
                        assignedClass: newRole === 'admin' ? 'Semua Kelas' : (editUserData.assignedClass === 'Semua Kelas' ? 'SPK 1A' : editUserData.assignedClass)
                      });
                    }}
                    className="w-full clay-input px-3 py-2 font-bold bg-white"
                  >
                    <option value="pensyarah">Pensyarah Akademik</option>
                    <option value="admin">Pentadbir Sistem (Admin UPP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      {editUserData.role === 'pensyarah' ? 'Pensyarah Kelas Ditugaskan *' : 'Kelas Ditugaskan'}
                    </label>
                    {editUserData.role === 'pensyarah' && (
                      <button
                        type="button"
                        onClick={() => setIsCustomClassEdit(prev => !prev)}
                        className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        {isCustomClassEdit ? 'Tutup Input Manual' : '+ Taip Kod Kelas'}
                      </button>
                    )}
                  </div>

                  {editUserData.role === 'pensyarah' ? (
                    <div className="space-y-2">
                      <select
                        value={editUserData.assignedClass}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomClassEdit(true);
                          } else {
                            setIsCustomClassEdit(false);
                            setEditUserData({ ...editUserData, assignedClass: e.target.value });
                          }
                        }}
                        className="w-full clay-input px-3 py-2 font-bold bg-white text-indigo-950 border-indigo-200"
                      >
                        <option value="" disabled>-- Pilih Kelas Ditugaskan --</option>
                        {/* Include editUserData.assignedClass if not already in availableClassList */}
                        {editUserData.assignedClass && !availableClassList.includes(editUserData.assignedClass) && editUserData.assignedClass !== 'Semua Kelas' && (
                          <option value={editUserData.assignedClass}>Kelas {editUserData.assignedClass}</option>
                        )}
                        {availableClassList.map(cls => (
                          <option key={cls} value={cls}>Kelas {cls}</option>
                        ))}
                        <option value="Semua Kelas">Semua Kelas (Penyelaras / Akses Penuh)</option>
                        <option value="__CUSTOM__">➕ Masukkan / Daftar Kelas Baharu...</option>
                      </select>

                      {isCustomClassEdit && (
                        <div className="p-2.5 bg-indigo-50/90 rounded-xl border border-indigo-300 space-y-1.5 animate-fadeIn">
                          <label className="block text-[10px] font-black uppercase text-indigo-950">
                            Masukkan Nama / Kod Kelas Baharu:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Contoh: SFP 1B, STM 2A"
                              value={customClassEditInput}
                              onChange={(e) => setCustomClassEditInput(e.target.value.toUpperCase())}
                              className="flex-1 clay-input px-3 py-1.5 text-xs font-black text-indigo-950 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!customClassEditInput.trim()) {
                                  alert('Sila masukkan kod kelas!');
                                  return;
                                }
                                const formatted = customClassEditInput.trim().toUpperCase();
                                setEditUserData({ ...editUserData, assignedClass: formatted });
                                setIsCustomClassEdit(false);
                                setCustomClassEditInput('');
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg cursor-pointer"
                            >
                              Gunakan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="Semua Kelas (Akses Penuh)"
                      className="w-full clay-input px-3 py-2 font-bold bg-slate-100 text-slate-600 cursor-not-allowed"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akaun</label>
                  <select
                    value={editUserData.status}
                    onChange={(e) => setEditUserData({ ...editUserData, status: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-bold bg-white"
                  >
                    <option value="Aktif">Aktif (Boleh log masuk)</option>
                    <option value="Tidak Aktif">Tidak Aktif (Disekat log masuk)</option>
                  </select>
                </div>
              </div>

              {editUserData.role === 'pensyarah' && (
                <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-[11px] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Pensyarah ini hanya dibenarkan melihat & mengurus maklumat pelajar bagi kelas <strong>{editUserData.assignedClass || 'SPK 1A'}</strong> sahaja apabila log masuk.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jawatan</label>
                  <input
                    type="text"
                    value={editUserData.jawatan}
                    onChange={(e) => setEditUserData({ ...editUserData, jawatan: e.target.value })}
                    className="w-full clay-input px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan / Unit</label>
                  <input
                    type="text"
                    value={editUserData.jabatan}
                    onChange={(e) => setEditUserData({ ...editUserData, jabatan: e.target.value })}
                    className="w-full clay-input px-3 py-2"
                  />
                </div>
              </div>


              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingUser(null)} className="clay-btn px-4 py-2 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-black text-indigo-950 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 cursor-pointer">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Reset Kata Laluan (Reset Password) */}
      {resettingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-md w-full p-6 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  Reset Kata Laluan Pengguna
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Tetapkan kata laluan baharu untuk <strong>{resettingUser.nama}</strong>
                </span>
              </div>
              <button onClick={() => setResettingUser(null)} className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-3.5 pt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Nama Pengguna</span>
                <span className="font-mono font-black text-slate-900 text-xs">@{resettingUser.username}</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">{resettingUser.email}</span>
              </div>

              {resetError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Laluan Baharu *</label>
                <input
                  type="password"
                  required
                  placeholder="Sekurang-kurangnya 5 aksara"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full clay-input px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sahkan Kata Laluan Baharu *</label>
                <input
                  type="password"
                  required
                  placeholder="Taip semula kata laluan baharu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full clay-input px-3 py-2 font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setResettingUser(null)} className="clay-btn px-4 py-2 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="clay-btn px-5 py-2 rounded-xl font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 cursor-pointer">
                  Set Kata Laluan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
