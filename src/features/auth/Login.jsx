import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden">
        
        {/* Left Side: Branding & Form */}
        <div className="w-full md:w-1/2 bg-[#2d2d2d] p-12 flex flex-col justify-center items-center text-white">
          <img src="/logo-kpm.png" alt="KPM" className="w-24 mb-6" />
          <h2 className="text-xl font-bold text-center mb-1">Sistem Pengurusan Identiti</h2>
          <h1 className="text-2xl font-black text-center mb-8">(FAST PPD)</h1>
          
          <form className="w-full max-w-sm space-y-4">
            <input 
              type="text" 
              placeholder="NOMBOR KAD PENGENALAN / PASSPORT" 
              className="w-full p-3 bg-transparent border border-gray-500 rounded text-sm focus:border-[#11a9bc] outline-none transition"
            />
            <input 
              type="password" 
              placeholder="KATA LALUAN" 
              className="w-full p-3 bg-transparent border border-gray-500 rounded text-sm focus:border-[#11a9bc] outline-none transition"
            />
            <button className="w-full bg-[#11a9bc] hover:bg-[#0e8a9a] py-3 font-bold uppercase tracking-widest text-sm transition shadow-lg">
              Daftar Masuk
            </button>
            <div className="flex justify-between text-xs font-bold mt-4">
                <Link to="/register" className="hover:text-[#11a9bc]">👤 Daftar Baru</Link>
                <Link to="/forgot-password" className="hover:text-[#11a9bc]">🔓 Lupa Kata Laluan</Link>
            </div>
          </form>
        </div>

        {/* Right Side: Announcements */}
        <div className="hidden md:block w-1/2 p-12 bg-white">
          <h3 className="text-2xl font-light text-center mb-8 border-b pb-4">Pengumuman</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-[#11a9bc] p-4 bg-gray-50">
              <p className="text-xs font-bold text-[#11a9bc] mb-1">MAKLUMAN SISTEM</p>
              <p className="text-sm text-gray-700">Sistem FAST PPD kini menyokong modul pelaporan T1-T6 untuk sekolah rendah daerah Semporna.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;