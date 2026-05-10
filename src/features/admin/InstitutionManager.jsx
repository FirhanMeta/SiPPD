import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Building2, Plus, Loader2, CheckCircle2, AlertCircle,
  Search, School, Users, X, Trash2, Edit2, UserPlus,
  ShieldCheck, ShieldX, Eye, EyeOff
} from 'lucide-react';

const ROLES = ['guru', 'ppd', 'superadmin'];
const ROLE_LABELS = { guru: 'Guru', ppd: 'PPD', superadmin: 'Super Admin' };
const ROLE_COLORS = {
  guru: 'bg-blue-50 text-blue-600',
  ppd: 'bg-amber-50 text-amber-600',
  superadmin: 'bg-violet-50 text-violet-600',
};
const STATUS_COLORS = {
  active: 'bg-green-50 text-green-600',
  pending: 'bg-orange-50 text-orange-500',
};

const InstitutionManager = () => {
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools]     = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('schools');
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);
  const [saving, setSaving]       = useState(false);

  // School modal
  const [schoolModal, setSchoolModal] = useState(false);
  const [schoolForm, setSchoolForm]   = useState({ name: '', type: 'SK', district_id: '' });

  // Register user modal
  const [registerModal, setRegisterModal] = useState(false);
  const [registerForm, setRegisterForm]   = useState({ full_name: '', email: '', password: '', role: 'guru', school_id: '', district_id: '' });
  const [showPassword, setShowPassword]   = useState(false);

  // Edit user modal
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser]   = useState(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: d }, { data: s }, { data: p }] = await Promise.all([
      supabase.from('districts').select('*').order('name'),
      supabase.from('schools').select('*, districts(name)').order('name'),
      supabase.from('profiles').select('*, schools(name)').order('email'),
    ]);
    setDistricts(d ?? []);
    setSchools(s ?? []);
    setUsers(p ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Add School ───────────────────────────────────────────
  const handleAddSchool = async () => {
    if (!schoolForm.name || !schoolForm.district_id) {
      showToast('error', 'Sila isi semua medan.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('schools').insert({
      name: schoolForm.name,
      type: schoolForm.type,
      district_id: schoolForm.district_id,
    });
    setSaving(false);
    if (error) { showToast('error', error.message); return; }
    showToast('success', 'Sekolah berjaya ditambah!');
    setSchoolModal(false);
    setSchoolForm({ name: '', type: 'SK', district_id: '' });
    fetchAll();
  };

  // ─── Register User ────────────────────────────────────────
  const handleRegisterUser = async () => {
    if (!registerForm.email || !registerForm.password || !registerForm.full_name) {
      showToast('error', 'Sila isi nama, e-mel dan kata laluan.');
      return;
    }
    setSaving(true);
    // Create auth user via Supabase Admin (signUp)
    const { data, error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: {
        data: { full_name: registerForm.full_name }
      }
    });
    if (error) { setSaving(false); showToast('error', error.message); return; }

    const uid = data?.user?.id;
    if (uid) {
      // Insert profile with active status (admin-created = pre-approved)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: uid,
        full_name: registerForm.full_name,
        email: registerForm.email,
        role: registerForm.role,
        school_id: registerForm.school_id || null,
        district_id: registerForm.district_id || null,
        status: 'active',
      });
      if (profileError) { showToast('error', profileError.message); setSaving(false); return; }
    }

    setSaving(false);
    showToast('success', 'Pengguna berjaya didaftarkan!');
    setRegisterModal(false);
    setRegisterForm({ full_name: '', email: '', password: '', role: 'guru', school_id: '', district_id: '' });
    fetchAll();
  };

  // ─── Edit User ────────────────────────────────────────────
  const handleEditUser = async () => {
    if (!editUser) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: editUser.full_name,
      role: editUser.role,
      school_id: editUser.school_id || null,
      district_id: editUser.district_id || null,
      status: editUser.status,
    }).eq('id', editUser.id);
    setSaving(false);
    if (error) { showToast('error', error.message); return; }
    showToast('success', 'Profil pengguna dikemaskini.');
    setEditModal(false);
    setEditUser(null);
    fetchAll();
  };

  // ─── Approve / Reject ─────────────────────────────────────
  const handleSetStatus = async (userId, status) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    if (error) showToast('error', error.message);
    else {
      showToast('success', status === 'active' ? 'Pengguna diluluskan.' : 'Pengguna ditolak.');
      fetchAll();
    }
  };

  // ─── Delete User ──────────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) showToast('error', error.message);
    else {
      showToast('success', 'Pengguna berjaya dipadam.');
      setDeleteConfirm(null);
      fetchAll();
    }
  };

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter((u) =>
    (u.full_name ?? u.email ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <DashboardLayout title="Pengurusan Institusi">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-bold ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Jumlah Daerah', value: districts.length, icon: Building2, color: 'text-teal-500', bg: 'bg-teal-50' },
            { label: 'Jumlah Sekolah', value: schools.length, icon: School, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Jumlah Pengguna', value: users.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={20} className={s.color} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-black text-gray-800">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 pt-4 flex gap-1">
            {[
              { id: 'schools', label: 'Sekolah', icon: School },
              { id: 'users', label: 'Pengguna', icon: Users, badge: pendingCount },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition -mb-px ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-5">
            {/* Toolbar */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeTab === 'schools' ? 'Cari sekolah...' : 'Cari pengguna...'}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              {activeTab === 'schools' && (
                <button
                  onClick={() => setSchoolModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <Plus size={14} /> Tambah Sekolah
                </button>
              )}
              {activeTab === 'users' && (
                <button
                  onClick={() => setRegisterModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <UserPlus size={14} /> Daftar Pengguna
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-teal-500" />
              </div>
            ) : activeTab === 'schools' ? (
              /* ── Schools Table ── */
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#', 'Nama Sekolah', 'Jenis', 'Daerah'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredSchools.map((school, i) => (
                      <tr key={school.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-xs text-gray-300 font-bold">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{school.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            school.type === 'SK' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'
                          }`}>
                            {school.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                          {school.districts?.name ?? '—'}
                        </td>
                      </tr>
                    ))}
                    {filteredSchools.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">Tiada sekolah dijumpai</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ── Users Table ── */
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Nama Penuh', 'E-mel', 'Peranan', 'Status', 'Tindakan'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className={`hover:bg-gray-50/50 ${u.status === 'pending' ? 'bg-orange-50/30' : ''}`}>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{u.full_name ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{u.email ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
                            {ROLE_LABELS[u.role] ?? u.role ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${STATUS_COLORS[u.status] ?? 'bg-gray-100 text-gray-400'}`}>
                            {u.status === 'pending' ? 'Menunggu' : 'Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* Approve */}
                            {u.status === 'pending' && (
                              <button
                                onClick={() => handleSetStatus(u.id, 'active')}
                                title="Lulus"
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                              >
                                <ShieldCheck size={14} />
                              </button>
                            )}
                            {/* Reject / Suspend */}
                            {u.status === 'active' && (
                              <button
                                onClick={() => handleSetStatus(u.id, 'pending')}
                                title="Gantung"
                                className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition"
                              >
                                <ShieldX size={14} />
                              </button>
                            )}
                            {/* Edit */}
                            <button
                              onClick={() => { setEditUser({ ...u }); setEditModal(true); }}
                              title="Edit"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition"
                            >
                              <Edit2 size={14} />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteConfirm(u)}
                              title="Padam"
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">Tiada pengguna dijumpai</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add School Modal ── */}
      {schoolModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">Tambah Sekolah Baru</h3>
              <button onClick={() => setSchoolModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Sekolah</label>
                <input
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  placeholder="Contoh: SK PULAU MABUL"
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Jenis Sekolah</label>
                <div className="flex gap-2">
                  {['SK', 'SMK'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSchoolForm({ ...schoolForm, type: t })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                        schoolForm.type === t ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Daerah</label>
                <select
                  value={schoolForm.district_id}
                  onChange={(e) => setSchoolForm({ ...schoolForm, district_id: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">— Pilih Daerah —</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setSchoolModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleAddSchool} disabled={saving} className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-sm font-bold transition disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin mx-auto" /> : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Register User Modal ── */}
      {registerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">Daftar Pengguna Baru</h3>
              <button onClick={() => setRegisterModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Penuh</label>
                <input
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  placeholder="Nama penuh pengguna"
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">E-mel</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="nama@moe.gov.my"
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kata Laluan</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Minimum 6 aksara"
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Peranan</label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              {registerForm.role === 'guru' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Sekolah</label>
                  <select
                    value={registerForm.school_id}
                    onChange={(e) => setRegisterForm({ ...registerForm, school_id: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="">— Pilih Sekolah —</option>
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {(registerForm.role === 'ppd' || registerForm.role === 'superadmin') && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Daerah</label>
                  <select
                    value={registerForm.district_id}
                    onChange={(e) => setRegisterForm({ ...registerForm, district_id: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="">— Pilih Daerah —</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setRegisterModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleRegisterUser} disabled={saving} className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-sm font-bold transition disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin mx-auto" /> : 'Daftar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editModal && editUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">Edit Pengguna</h3>
              <button onClick={() => { setEditModal(false); setEditUser(null); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Penuh</label>
                <input
                  value={editUser.full_name ?? ''}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">E-mel</label>
                <input
                  value={editUser.email ?? ''}
                  disabled
                  className="w-full border border-gray-100 bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Peranan</label>
                <select
                  value={editUser.role ?? 'guru'}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Sekolah</label>
                <select
                  value={editUser.school_id ?? ''}
                  onChange={(e) => setEditUser({ ...editUser, school_id: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">— Tiada —</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={editUser.status ?? 'active'}
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="active">Aktif</option>
                  <option value="pending">Menunggu</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => { setEditModal(false); setEditUser(null); }} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleEditUser} disabled={saving} className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-sm font-bold transition disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin mx-auto" /> : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-black text-gray-800 text-sm uppercase mb-2">Padam Pengguna</h3>
            <p className="text-xs text-gray-500 mb-6">
              Adakah anda pasti untuk memadam <span className="font-bold text-gray-700">{deleteConfirm.full_name ?? deleteConfirm.email}</span>? Tindakan ini tidak boleh dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={() => handleDeleteUser(deleteConfirm.id)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-bold transition">
                Ya, Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstitutionManager;