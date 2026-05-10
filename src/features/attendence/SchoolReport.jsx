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