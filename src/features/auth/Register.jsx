const Register = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-[#11a9bc] p-6 text-white">
          <h2 className="text-xl font-bold uppercase">Pendaftaran Akaun Baharu</h2>
          <p className="text-xs opacity-80">Sila pilih peranan dan institusi anda.</p>
        </div>
        <form className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
             <label className="block text-xs font-bold text-gray-500 mb-1">PERANAN</label>
             <select className="w-full p-2 border rounded">
                <option>Guru (Sekolah)</option>
                <option>Admin PPD</option>
             </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">KOD SEKOLAH / PPD</label>
            <input type="text" className="w-full p-2 border rounded" placeholder="XBA3101" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">NAMA PENUH</label>
            <input type="text" className="w-full p-2 border rounded" />
          </div>
          <button className="md:col-span-2 bg-[#2d2d2d] text-white py-3 font-bold rounded uppercase hover:bg-black transition">Daftar Pengguna</button>
        </form>
      </div>
    </div>
  );
};