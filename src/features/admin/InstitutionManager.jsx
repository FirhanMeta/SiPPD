import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Building2, Plus, Loader2, CheckCircle2,
  AlertCircle, Search, School, Users, X
} from 'lucide-react';

const InstitutionManager = () => {
  const [districts, setDistricts]     = useState([]);
  const [schools, setSchools]         = useState([]);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('schools');
  const [search, setSearch]           = useState('');
  const [toast, setToast]             = useState(null);

  // School form
  const [schoolForm, setSchoolForm]   = useState({ name: '', type: 'SK', district_id: '' });
  const [schoolModal, setSchoolModal] = useState(false);
  const [saving, setSaving]           = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: d }, { data: s }, { data: p }] = await Promise.all([
      supabase.from('districts').select('*').order('name'),
      supabase.from('schools').select('*, districts(name)').order('name'),
      supabase.from('profiles').select('*').order('full_name'),
    ]);
    setDistricts(d ?? []);
    setSchools(s ?? []);
    setUsers(p ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

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

  const handleUpdateProfile = async (userId, field, value) => {
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', userId);
    if (error) showToast('error', error.message);
    else {
      showToast('success', 'Profil pengguna dikemaskini.');
      fetchAll();
    }
  };

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter((u) =>
    (u.full_name ?? u.id).toLowerCase().includes(search.toLowerCase())
  );

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
              { id: 'users', label: 'Pengguna', icon: Users },
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
                  <Plus size={14} />
                  Tambah Sekolah
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-teal-500" />
              </div>
            ) : activeTab === 'schools' ? (
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#','Nama Sekolah','Jenis','Daerah'].map((h) => (
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
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Nama Penuh','E-mel','Peranan','Sekolah/Daerah'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{u.full_name ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{u.email ?? '—'}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role ?? 'guru'}
                            onChange={(e) => handleUpdateProfile(u.id, 'role', e.target.value)}
                            className="border border-gray-200 bg-gray-50 rounded text-xs font-bold py-1 px-2 focus:outline-none focus:border-teal-500"
                          >
                            <option value="guru">Guru</option>
                            <option value="ppd">PPD</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.school_id ?? ''}
                            onChange={(e) => handleUpdateProfile(u.id, 'school_id', e.target.value || null)}
                            className="border border-gray-200 bg-gray-50 rounded text-xs py-1 px-2 focus:outline-none focus:border-teal-500 max-w-[180px]"
                          >
                            <option value="">— Pilih Sekolah —</option>
                            {schools.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">Tiada pengguna dijumpai</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add School Modal */}
      {schoolModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">Tambah Sekolah Baru</h3>
              <button onClick={() => setSchoolModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
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
                  {['SK','SMK'].map((t) => (
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
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setSchoolModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
                Batal
              </button>
              <button
                onClick={handleAddSchool}
                disabled={saving}
                className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-sm font-bold transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={15} className="animate-spin mx-auto" /> : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstitutionManager;
