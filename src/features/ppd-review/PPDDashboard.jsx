import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import {
  BarChart3, TrendingUp, AlertCircle, Award,
  School, ChevronDown, RefreshCw, Download, Loader2,
  CheckCircle2, XCircle, MinusCircle
} from 'lucide-react';

const MONTHS = [
  'Januari','Februari','Mac','April','Mei','Jun',
  'Julai','Ogos','September','Oktober','November','Disember'
];
const CURRENT_YEAR = new Date().getFullYear();

const getStatus = (pct) => {
  if (pct >= 95) return { label: 'Platinum Pengarah', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2, textColor: 'text-emerald-600' };
  if (pct >= 90) return { label: 'Platinum', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: MinusCircle, textColor: 'text-amber-600' };
  return { label: 'Ke Arah KPI', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: XCircle, textColor: 'text-red-600' };
};

const PPDDashboard = () => {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [month, setMonth]       = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear]         = useState(CURRENT_YEAR);
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendance_reports')
      .select(`
        *,
        schools ( name, type, district_id )
      `)
      .eq('month', month)
      .eq('year', year)
      .order('average_percentage', { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [month, year]);

  const filtered = typeFilter === 'Semua'
    ? reports
    : reports.filter((r) => r.schools?.type === typeFilter);

  const totalEnrolment = filtered.reduce((s, r) => s + (r.total_enrolment || 0), 0);
  const totalPresent   = filtered.reduce((s, r) => s + (r.total_present || 0), 0);
  const overallPct     = totalEnrolment > 0 ? ((totalPresent / totalEnrolment) * 100).toFixed(2) : '0.00';

  const skSchools  = reports.filter((r) => r.schools?.type === 'SK');
  const smkSchools = reports.filter((r) => r.schools?.type === 'SMK');

  const avg = (arr) => {
    if (!arr.length) return '0.00';
    return (arr.reduce((s, r) => s + (r.average_percentage || 0), 0) / arr.length).toFixed(2);
  };

  const platinum   = filtered.filter((r) => r.average_percentage >= 95).length;
  const belowKPI   = filtered.filter((r) => r.average_percentage < 90).length;

  return (
    <DashboardLayout title="Analisis KPI Kehadiran">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Month */}
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
            {/* Year */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg px-3 py-2 pr-7 focus:outline-none focus:border-teal-500"
              >
                {[CURRENT_YEAR-1, CURRENT_YEAR, CURRENT_YEAR+1].map((y) => <option key={y}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {/* Type Filter */}
            <div className="flex gap-1">
              {['Semua','SK','SMK'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    typeFilter === t
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-[11px] text-gray-400 font-medium">
              Dikemaskini: {lastRefresh.toLocaleTimeString('ms-MY')}
            </p>
            <button
              onClick={fetchReports}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Muat Semula
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Keseluruhan PPD',
              value: `${overallPct}%`,
              sub: 'Sasaran: 95.0%',
              subColor: parseFloat(overallPct) >= 95 ? 'text-green-500' : 'text-red-500',
              border: 'border-l-4 border-teal-500',
              icon: BarChart3,
              iconColor: 'text-teal-500',
            },
            {
              label: 'Purata SK',
              value: `${avg(skSchools)}%`,
              sub: `${skSchools.length} sekolah`,
              subColor: 'text-gray-400',
              border: 'border-l-4 border-blue-500',
              icon: School,
              iconColor: 'text-blue-500',
            },
            {
              label: 'Purata SMK',
              value: `${avg(smkSchools)}%`,
              sub: `${smkSchools.length} sekolah`,
              subColor: 'text-gray-400',
              border: 'border-l-4 border-violet-500',
              icon: School,
              iconColor: 'text-violet-500',
            },
            {
              label: 'Platinum KPI',
              value: `${platinum}`,
              sub: `${belowKPI} sekolah kritikal`,
              subColor: belowKPI > 0 ? 'text-red-500' : 'text-green-500',
              border: 'border-l-4 border-amber-500',
              icon: Award,
              iconColor: 'text-amber-500',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`bg-white rounded-xl shadow-sm p-5 ${card.border}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                  <Icon size={18} className={card.iconColor} />
                </div>
                <p className="text-2xl font-black text-gray-800 mb-1">{card.value}</p>
                <p className={`text-[11px] font-bold ${card.subColor}`}>{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* School Rankings Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#0f1923] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              <span className="text-white text-sm font-bold uppercase tracking-wider">
                Kedudukan Prestasi Sekolah
              </span>
              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs font-mono">
                {filtered.length} sekolah
              </span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold transition border border-white/10">
              <Download size={13} />
              Export PDF
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 size={22} className="animate-spin text-teal-500" />
              <span className="text-sm font-medium">Memuatkan data...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BarChart3 size={32} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium">Tiada laporan untuk {month} {year}</p>
              <p className="text-xs mt-1">Sekolah belum menghantar laporan bagi bulan ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Bil','Nama Sekolah','Jenis','Enrolmen','Hadir','Peratus (%)','Status','Tindakan'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((report, i) => {
                    const pct = report.average_percentage ?? 0;
                    const status = getStatus(pct);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={report.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-4 text-sm font-black text-gray-300">{i + 1}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-800 leading-tight">
                            {report.schools?.name ?? `Sekolah ID: ${report.school_id}`}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                            {report.status === 'Submitted' ? '✓ Telah dihantar' : '● Draf'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                            report.schools?.type === 'SK'
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'bg-violet-50 text-violet-600 border border-violet-200'
                          }`}>
                            {report.schools?.type ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                          {report.total_enrolment?.toLocaleString() ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                          {report.total_present?.toLocaleString() ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          {/* Progress Bar */}
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct >= 95 ? 'bg-emerald-500' : pct >= 90 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-black ${status.textColor}`}>
                              {pct.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${status.color}`}>
                            <StatusIcon size={11} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {pct < 95 && report.justification && (
                            <button
                              title={report.justification}
                              className="text-orange-400 hover:text-orange-600 transition"
                            >
                              <AlertCircle size={17} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PPDDashboard;
