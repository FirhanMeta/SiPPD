import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Send, Save, AlertTriangle, CheckCircle2,
  ChevronDown, Info, Loader2
} from 'lucide-react';

const MONTHS = [
  'Januari','Februari','Mac','April','Mei','Jun',
  'Julai','Ogos','September','Oktober','November','Disember'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const defaultClasses = () =>
  ['T1','T2','T3','T4','T5','T6'].map((level) => ({
    level, enrolment: '', present: ''
  }));

const SchoolReport = () => {
  const { profile } = useAuth();

  const [classes, setClasses]           = useState(defaultClasses());
  const [month, setMonth]               = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear]                 = useState(CURRENT_YEAR);
  const [justification, setJustification] = useState('');
  const [intervention, setIntervention] = useState('');
  const [loading, setLoading]           = useState(false);
  const [saveLoading, setSaveLoading]   = useState(false);
  const [toast, setToast]               = useState(null); // { type, msg }
  const [errors, setErrors]             = useState({});

  // Load existing report for selected month/year
  useEffect(() => {
    if (!profile?.school_id) return;
    const fetchExisting = async () => {
      const { data } = await supabase
        .from('attendance_reports')
        .select('*')
        .eq('school_id', profile.school_id)
        .eq('month', month)
        .eq('year', year)
        .single();

      if (data) {
        setClasses(data.class_data ?? defaultClasses());
        setJustification(data.justification ?? '');
        setIntervention(data.intervention ?? '');
      } else {
        setClasses(defaultClasses());
        setJustification('');
        setIntervention('');
      }
    };
    fetchExisting();
  }, [month, year, profile?.school_id]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = () => {
    const newErrors = {};
    classes.forEach((cls, i) => {
      const enr = parseInt(cls.enrolment);
      const pre = parseInt(cls.present);
      if (cls.enrolment !== '' && cls.present !== '') {
        if (isNaN(enr) || enr < 0) newErrors[`enrolment_${i}`] = 'Nilai tidak sah';
        if (isNaN(pre) || pre < 0) newErrors[`present_${i}`] = 'Nilai tidak sah';
        if (!isNaN(enr) && !isNaN(pre) && pre > enr) {
          newErrors[`present_${i}`] = 'Hadir > Enrolmen!';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateClass = (index, field, value) => {
    const updated = [...classes];
    updated[index][field] = value;
    setClasses(updated);
    // Clear error on change
    const key = `${field}_${index}`;
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const totals = classes.reduce(
    (acc, cls) => {
      const enr = parseInt(cls.enrolment) || 0;
      const pre = parseInt(cls.present) || 0;
      return { enrolment: acc.enrolment + enr, present: acc.present + pre };
    },
    { enrolment: 0, present: 0 }
  );

  const avgPct = totals.enrolment > 0
    ? ((totals.present / totals.enrolment) * 100).toFixed(2)
    : '0.00';

  const pctNum = parseFloat(avgPct);
  const showIntervention = pctNum > 0 && pctNum < 95;

  const buildPayload = (status) => ({
    school_id: profile.school_id,
    month,
    year,
    class_data: classes,
    total_enrolment: totals.enrolment,
    total_present: totals.present,
    average_percentage: parseFloat(avgPct),
    justification,
    intervention: showIntervention ? intervention : '',
    status,
    submitted_at: new Date().toISOString(),
  });

  const handleSave = async () => {
    if (!validate()) return;
    setSaveLoading(true);
    const { error } = await supabase
      .from('attendance_reports')
      .upsert(buildPayload('Draf'), { onConflict: 'school_id,month,year' });
    setSaveLoading(false);
    if (error) showToast('error', 'Gagal simpan: ' + error.message);
    else showToast('success', 'Draf berjaya disimpan.');
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!profile?.school_id) {
      showToast('error', 'Profil anda tidak dikonfigurasi. Sila hubungi admin.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('attendance_reports')
      .upsert(buildPayload('Submitted'), { onConflict: 'school_id,month,year' });
    setLoading(false);
    if (error) showToast('error', 'Gagal hantar: ' + error.message);
    else showToast('success', 'Laporan berjaya dihantar ke PPD!');
  };

  const pctColor =
    pctNum >= 95 ? 'text-green-600' :
    pctNum >= 90 ? 'text-yellow-600' :
    pctNum >  0  ? 'text-red-600' : 'text-gray-400';

  const pctBg =
    pctNum >= 95 ? 'bg-green-50 border-green-200' :
    pctNum >= 90 ? 'bg-yellow-50 border-yellow-200' :
    pctNum >  0  ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';

  return (
    <DashboardLayout title="Laporan Kehadiran Bulanan">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-bold transition-all ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 size={18} className="text-green-500" />
            : <AlertTriangle size={18} className="text-red-500" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div>
              <h3 className="text-base font-black text-gray-800 uppercase tracking-tight mb-1">
                Data Kehadiran Murid
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                {profile?.school_name ?? 'Sekolah Anda'} · Isi data untuk setiap darjah
              </p>
            </div>
            <div className="flex gap-3">
              {/* Month Selector */}
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg px-3 py-2 pr-7 focus:outline-none focus:border-teal-500"
                >
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* Year Selector */}
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg px-3 py-2 pr-7 focus:outline-none focus:border-teal-500"
                >
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#0f1923] px-6 py-4">
            <p className="text-white text-xs font-bold uppercase tracking-widest">
              Kehadiran Mengikut Darjah — {month} {year}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Darjah</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Enrolmen</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hadir</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">% Hadir</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {classes.map((cls, i) => {
                  const enr = parseInt(cls.enrolment) || 0;
                  const pre = parseInt(cls.present) || 0;
                  const pct = enr > 0 ? ((pre / enr) * 100).toFixed(1) : null;
                  const rowPct = parseFloat(pct);
                  const rowOk = pct !== null && rowPct >= 95;
                  return (
                    <tr key={cls.level} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 font-black text-sm">
                          {cls.level}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          min="0"
                          value={cls.enrolment}
                          onChange={(e) => updateClass(i, 'enrolment', e.target.value)}
                          placeholder="0"
                          className={`w-24 border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-teal-500 transition ${
                            errors[`enrolment_${i}`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                        {errors[`enrolment_${i}`] && (
                          <p className="text-red-500 text-[10px] mt-1 font-bold">{errors[`enrolment_${i}`]}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          min="0"
                          value={cls.present}
                          onChange={(e) => updateClass(i, 'present', e.target.value)}
                          placeholder="0"
                          className={`w-24 border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-teal-500 transition ${
                            errors[`present_${i}`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                        {errors[`present_${i}`] && (
                          <p className="text-red-500 text-[10px] mt-1 font-bold">{errors[`present_${i}`]}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-sm font-black ${
                          pct === null ? 'text-gray-300' :
                          rowPct >= 95 ? 'text-green-600' :
                          rowPct >= 90 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {pct !== null ? `${pct}%` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {pct !== null && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            rowOk
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : rowPct >= 90
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {rowOk ? 'Mencapai KPI' : rowPct >= 90 ? 'Hampir KPI' : 'Perlu Tindakan'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Row */}
          <div className={`mx-5 mb-5 mt-3 p-4 rounded-xl border ${pctBg} flex flex-wrap gap-6 items-center`}>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Jumlah Enrolmen</p>
              <p className="text-2xl font-black text-gray-800">{totals.enrolment}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Jumlah Hadir</p>
              <p className="text-2xl font-black text-gray-800">{totals.present}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Purata Kehadiran</p>
              <p className={`text-4xl font-black ${pctColor}`}>{avgPct}%</p>
            </div>
          </div>
        </div>

        {/* Justification */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            Justifikasi / Catatan
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
            placeholder="Nyatakan sebab atau catatan berkaitan kehadiran bulan ini..."
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-teal-500 transition resize-none"
          />
        </div>

        {/* Intervention Section — only shows if < 95% */}
        {showIntervention && (
          <div className="bg-orange-50 rounded-xl border border-orange-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-black text-orange-800 uppercase tracking-tight">
                  Seksyen Intervensi
                </p>
                <p className="text-xs text-orange-500">
                  Diperlukan kerana kehadiran di bawah 95% ({avgPct}%)
                </p>
              </div>
            </div>
            <textarea
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              rows={4}
              placeholder="Huraikan tindakan intervensi yang telah atau akan diambil untuk meningkatkan kehadiran murid..."
              className="w-full border border-orange-200 bg-white rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-orange-400 transition resize-none"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pb-6">
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {saveLoading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Simpan Draf
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Hantar ke PPD
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SchoolReport;
