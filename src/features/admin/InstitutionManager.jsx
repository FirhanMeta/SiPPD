import React, { useState } from 'react';
import { Shield, School, MapPin, Plus } from 'lucide-react';

const InstitutionManager = () => {
  const [districts, setDistricts] = useState([
    { id: 'PPD-001', name: 'PPD SEMPORNA', schools: 43, status: 'Active' },
    { id: 'PPD-002', name: 'PPD TAWAU', schools: 0, status: 'Pending' }
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header aligned with idMe style */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Shield className="text-[#11a9bc]" size={28} />
          <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
            Pengurusan Institusi (Superadmin)
          </h1>
        </div>
        <button className="bg-[#11a9bc] hover:bg-[#0e8a9a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-semibold">
          <Plus size={18} /> Daftar PPD Baharu
        </button>
      </div>

      <div className="p-8">
        {/* District Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase">Jumlah Daerah</p>
            <p className="text-3xl font-black text-[#11a9bc]">{districts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase">Sekolah Berdaftar</p>
            <p className="text-3xl font-black text-gray-800">43</p>
          </div>
        </div>

        {/* District Management Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-[#2d2d2d] text-white px-6 py-3 flex justify-between">
            <span className="text-sm font-bold">Senarai Pejabat Pendidikan Daerah (PPD)</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Kod PPD</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Nama Daerah</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Bil. Sekolah</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {districts.map((ppd) => (
                <tr key={ppd.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-blue-600">{ppd.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{ppd.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ppd.schools} Sekolah</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      ppd.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {ppd.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#11a9bc] hover:underline text-xs font-bold mr-4">Kemaskini</button>
                    <button className="text-red-500 hover:underline text-xs font-bold">Padam</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstitutionManager;