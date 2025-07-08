import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function CaretakerDashboard({ profile }: { profile: any }) {
  const [meds, setMeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [assignedPatient, setAssignedPatient] = useState("");
  // Dynamic adherence stats
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [missedThisMonth, setMissedThisMonth] = useState(0);
  const [takenThisWeek, setTakenThisWeek] = useState(0);

  useEffect(() => {
    fetchMeds();
    fetchPatients();
    calculateAdherenceStats();
  }, []);

  const fetchMeds = async () => {
    const { data } = await supabase
      .from("medications")
      .select("*")
      .eq("caretaker_id", profile.id);
    setMeds(data || []);
  };

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("user_profiles")
      .select("id, name")
      .eq("role", "patient");
    setPatients(data || []);
  };

  // Dynamic adherence stats calculation
  const calculateAdherenceStats = async () => {
    const today = new Date();
    const past30 = new Date(today);
    past30.setDate(today.getDate() - 30);

    const { data, error } = await supabase
      .from("medication_logs")
      .select("*")
      .gte("date", past30.toISOString().split("T")[0]);

    if (error || !data) return;

    const total = data.length;
    const taken = data.filter((d: any) => d.taken).length;
    const missed = data.filter((d: any) => !d.taken).length;

    setAdherenceRate(total > 0 ? Math.round((taken / total) * 100) : 0);
    setMissedThisMonth(missed);

    // This week taken
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);
    const takenWeek = data.filter(
      (d: any) => d.taken && new Date(d.date) >= thisWeek
    ).length;
    setTakenThisWeek(takenWeek);

    // Streak (naive)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const logsForDate = data.filter((d: any) => d.date === dateStr);
      const allTaken = logsForDate.length > 0 && logsForDate.every((l: any) => l.taken);
      if (allTaken) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);
  };

  const addMedication = async () => {
    if (!medName || !dosage || !assignedPatient) return;
    await supabase.from("medications").insert({
      caretaker_id: profile.id,
      patient_name: assignedPatient,
      med_name: medName,
      dosage,
    });
    setMedName("");
    setDosage("");
    setAssignedPatient("");
    fetchMeds();
  };

  const deleteMedication = async (id: number) => {
    await supabase.from("medications").delete().eq("id", id);
    fetchMeds();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    location.href = "/";
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">MediCare Companion</h1>
        <button onClick={logout} className="text-red-600 hover:underline text-sm">
          Logout
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-white p-6 shadow-md">
        <h2 className="text-xl font-semibold">Caretaker Dashboard</h2>
        <p className="text-sm mt-1 mb-4">Monitoring patient medication adherence</p>
        <div className="flex justify-between text-center">
          <div>
            <p className="text-2xl font-bold">{adherenceRate}%</p>
            <p className="text-sm">Adherence Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-sm">Current Streak</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{missedThisMonth}</p>
            <p className="text-sm">Missed This Month</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{takenThisWeek}</p>
            <p className="text-sm">Taken This Week</p>
          </div>
        </div>
      </div>

      {/* Tabs (UI only for now) */}
      <div className="border-b border-gray-200 flex space-x-6 text-sm font-medium text-gray-600">
        <button className="pb-2 border-b-2 border-blue-500">Overview</button>
        <button className="pb-2 hover:text-blue-600">Recent Activity</button>
        <button className="pb-2 hover:text-blue-600">Calendar View</button>
        <button className="pb-2 hover:text-blue-600">Notifications</button>
      </div>

      {/* Today’s Status */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Today's Status</h3>
        <p className="text-gray-700">Daily Medication Set <span className="text-sm text-gray-500">(8:00 AM)</span></p>
        <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs">Pending</span>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full border px-4 py-2 rounded hover:bg-gray-50">📧 Send Reminder Email</button>
          <button className="w-full border px-4 py-2 rounded hover:bg-gray-50">🔔 Configure Notifications</button>
          <button className="w-full border px-4 py-2 rounded hover:bg-gray-50">🗓 View Full Calendar</button>
        </div>
      </div>

      {/* Monthly Adherence Progress */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Monthly Adherence Progress</h3>
        <div className="w-full bg-gray-100 h-4 rounded overflow-hidden">
          <div className="bg-green-500 h-full w-[85%]"></div>
        </div>
        <div className="text-xs text-gray-500 mt-2 flex justify-between">
          <span>✅ 22 days Taken</span>
          <span>❌ 3 days Missed</span>
          <span>📅 5 days Remaining</span>
        </div>
      </div>

      {/* Assign Medication */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Assign Medication</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input className="border p-2 rounded" placeholder="Medication Name" value={medName} onChange={e => setMedName(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Dosage" value={dosage} onChange={e => setDosage(e.target.value)} />
          <select className="border p-2 rounded" value={assignedPatient} onChange={e => setAssignedPatient(e.target.value)}>
            <option value="">Select Patient</option>
            {patients.map((p: any) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={addMedication}>
          Add Medication
        </button>
      </div>

      {/* Medication List */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">All Medications</h3>
        {meds.length === 0 ? (
          <p className="text-gray-500">No medications found.</p>
        ) : (
          <div className="space-y-3">
            {meds.map((med: any) => (
              <div key={med.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{med.med_name}</p>
                  <p className="text-sm text-gray-500">Dosage: {med.dosage}</p>
                  <p className="text-xs text-gray-400">Patient: {med.patient_name}</p>
                </div>
                <button onClick={() => deleteMedication(med.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
