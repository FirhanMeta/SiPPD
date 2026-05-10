import React, { useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Award } from 'lucide-react';

const PPDDashboard = () => {
  // Mock data based on February 2026 report [cite: 28, 31, 34]
  const [schools] = useState([
    { name: 'SK PULAU MABUL', pct: 98.37, type: 'SK' },
    { name: 'SK KAMPUNG POKAS', pct: 97.08, type: 'SK' },
    { name: 'SK HAMPALAN', pct: 95.16, type: 'SK' },
    { name: 'SMK AGAMA TUN SAKARAN', pct: 94.43, type: 'SMK' },
    { name: 'SK KUBANG PINANG', pct: 91.80, type: 'SK' },
    { name: 'SK BUBUL II', pct: 90.34, type: 'SK' },
    { name: 'SMK BUGAYA', pct: 88.02, type: 'SMK' },
  ]);

  // Sorting Logic: Tier first, then Percentage descending [cite: 11-14]
  const sortedSchools = [...schools].sort((a, b) => b.pct - a.pct);

  const getStatus = (pct) => {
    if (pct >= 95.0) return { label: 'Platinum KPI Pengarah', color: 'bg-green-100 text-green-700', border: 'border-green-500' };
    if (pct >= 90.0) return { label: 'Platinum', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-500' };
    return { label: 'Ke Arah Capai KPI', color: 'bg-red-100 text-red-700', border: 'border-red-500' };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* idMe Style Top Header */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-[#11a9bc]" size={28} />
          <h1 className="text-xl font-bold text-gray-800 uppercase">Analisis KPI Kehadiran Daerah</h1>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-gray-500">PPD SEMPORNA</p>
            <p className="text-sm font-black text-[#11a9bc]">FEB 2026</p>
        </div>
      </div>

      <div className="p-8">
        {/* KPI Summary Cards [cite: 36, 41-43] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Keseluruhan PPD</p>
                <p className="text-3xl font-black text-gray-800">89.86%</p>
              </div>
              <TrendingUp className="text-gray-300" size={32} />
            </div>
            <p className="text-[10px] mt-2 text-red-600 font-bold">Target: 95.0%</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border-l-4 border-[#11a9bc] shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase">Purata Rendah (SK)</p>
            <p className="text-3xl font-black text-[#11a9bc]">91.45%</p>
          </div>

          <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase">Purata Menengah (SMK)</p>
            <p className="text-3xl font-black text-orange-600">87.78%</p>
          </div>
        </div>

        {/* Analytics Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-[#2d2d2d] text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-yellow-400" />
                <span className="text-sm font-bold uppercase tracking-wider">Kedudukan Prestasi Sekolah</span>
              </div>
              <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded border border-white/20 transition">Export PDF</button>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Bil</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Nama Sekolah</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-center">Peratus (%)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Status Anugerah</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-right">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedSchools.map((school, index) => {
                const status = getStatus(school.pct);
                return (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-bold text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-800">{school.name}</div>
                        <div className="text-[10px] text-gray-500 font-bold">{school.type}</div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-black text-center ${school.pct >= 95 ? 'text-green-600' : 'text-gray-700'}`}>
                        {school.pct}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${status.color} ${status.border}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        {school.pct < 95 && (
                            <button title="Lihat Justifikasi" className="text-orange-500 hover:text-orange-700 transition">
                                <AlertCircle size={18} />
                            </button>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PPDDashboard;