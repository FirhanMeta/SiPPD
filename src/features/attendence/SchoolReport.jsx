// Example logic for calculating KPI and visibility
const attendanceData = [
  { level: "T1", enrollment: 30, present: 28 }, // Add rows for T1-T6
  // ... other classes
];

const calculatePercentage = (present, enrollment) => {
  return ((present / enrollment) * 100).toFixed(2);
};

// Check if any class is below 95% to show the Intervention Section
const showIntervention = attendanceData.some(
  (cls) => calculatePercentage(cls.present, cls.enrolment) < 95.0
);
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

// Inside your SchoolReport component:
const handleSubmit = async () => {
  const { user, profile } = useAuth();
  
  // 1. Calculate Totals
  const totalEnrolment = attendanceData.reduce((sum, item) => sum + item.enrolment, 0);
  const totalPresent = attendanceData.reduce((sum, item) => sum + item.present, 0);
  const avgPct = ((totalPresent / totalEnrolment) * 100).toFixed(2);

  // 2. Prepare Data Payload
  const payload = {
    school_id: profile.school_id, // Automatically linked via your profile
    month: "Februari",
    year: 2026,
    class_data: attendanceData, // Array of {level, enrolment, present}
    total_enrolment: totalEnrolment,
    total_present: totalPresent,
    average_percentage: parseFloat(avgPct),
    justification: justificationText,
    intervention: interventionText,
    status: 'Submitted',
    submitted_at: new Date().toISOString()
  };

  // 3. Insert to Supabase
  const { data, error } = await supabase
    .from('attendance_reports')
    .upsert(payload, { onConflict: 'school_id, month, year' }); // Updates if exists

  if (error) {
    alert("Gagal menghantar: " + error.message);
  } else {
    alert("Laporan berjaya dihantar ke PPD!");
  }
  {/* ... previous code for intervention section ... */}

<div className="mt-6 flex justify-end space-x-3">
  {/* Optional: Keep a secondary button for draft saving */}
  <button className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-100 transition">
    Simpan Draf
  </button>

  {/* Place your handleSubmit button here */}
  <button 
  onClick={handleSubmit}
  disabled={loading}
  className="..."
>
  {loading ? 'Menghantar...' : 'Hantar ke PPD'}
</button>
</div>

{/* ... closing tags ... */}
};