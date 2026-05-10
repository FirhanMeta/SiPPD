const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 shadow-md border-t-4 border-[#11a9bc]">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Lupa Kata Laluan?</h2>
        <p className="text-xs text-gray-500 mb-6 uppercase font-bold tracking-tighter">Masukkan emel berdaftar untuk set semula.</p>
        
        <form className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase">Emel Rasmi MOE</label>
            <input type="email" className="w-full p-2 border-b-2 border-gray-200 focus:border-[#11a9bc] outline-none transition" />
          </div>
          <button className="w-full bg-[#11a9bc] text-white py-2 font-bold text-sm uppercase">Hantar Pautan</button>
          <a href="/login" className="block text-center text-xs text-[#11a9bc] font-bold hover:underline">Kembali ke Log Masuk</a>
        </form>
      </div>
    </div>
  );
};