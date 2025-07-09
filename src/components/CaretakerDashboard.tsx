import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import CalendarView from "./CalendarView";

// Use fallback icon for CheckCircle
const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
);

// --- StatCard Component ---
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`rounded-lg p-4 flex items-center space-x-4 bg-gradient-to-br ${color} shadow-sm`}>
      <div className="bg-white rounded-full p-2 shadow">{icon}</div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
    </div>
  );
}

// --- TabButton Component ---
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className={`flex items-center px-3 py-1 rounded-t transition-colors duration-150 ${active ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-600"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// --- OverviewTab Component ---
function OverviewTab({
  meds, patients, medName, setMedName, dosage, setDosage, assignedPatient, setAssignedPatient, addMedication, deleteMedication, monthTaken, monthMissed, monthTotal, selectedDays, setSelectedDays, timeOfDay, setTimeOfDay,
  editingMed, startEdit, cancelEdit, updateMedication, editMedName, setEditMedName, editDosage, setEditDosage, editAssignedPatient, setEditAssignedPatient, editSelectedDays, setEditSelectedDays, editTimeOfDay, setEditTimeOfDay
}: any) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeOptions = [
    { value: 'After Breakfast', label: 'After Breakfast (8:30 AM)' },
    { value: 'Before Lunch', label: 'Before Lunch (12:00 PM)' },
    { value: 'After Lunch', label: 'After Lunch (2:00 PM)' },
    { value: 'High Tea', label: 'High Tea (5:00 PM)' },
    { value: 'Before Dinner', label: 'Before Dinner (7:00 PM)' },
    { value: 'After Dinner', label: 'After Dinner (9:00 PM)' },
  ];
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d: string) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleEditDay = (day: string) => {
    if (editSelectedDays.includes(day)) {
      setEditSelectedDays(editSelectedDays.filter((d: string) => d !== day));
    } else {
      setEditSelectedDays([...editSelectedDays, day]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Monthly Adherence Progress */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Monthly Adherence Progress</h3>
        <div className="w-full bg-gray-100 h-4 rounded overflow-hidden">
          <div className="bg-green-500 h-full" style={{ width: `${monthTotal ? (monthTaken / monthTotal) * 100 : 0}%` }}></div>
        </div>
        <div className="text-xs text-gray-500 mt-2 flex justify-between">
          <span>✅ {monthTaken} days Taken</span>
          <span>❌ {monthMissed} days Missed</span>
          <span>📅 {monthTotal - monthTaken - monthMissed} days Remaining</span>
        </div>
      </div>
      
      {/* Assign Medication */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Assign Medication</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input className="border p-2 rounded" placeholder="Medication Name" value={medName} onChange={e => setMedName(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Dosage" value={dosage} onChange={e => setDosage(e.target.value)} />
          <select className="border p-2 rounded" value={assignedPatient} onChange={e => setAssignedPatient(e.target.value)}>
            <option value="">Select Patient</option>
            {patients.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select className="border p-2 rounded" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)}>
            <option value="">Select Time</option>
            {timeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          {daysOfWeek.map(day => (
            <label key={day} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() => toggleDay(day)}
              />
              {day}
            </label>
          ))}
        </div>
        <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={addMedication}>
          Add Medication
        </button>
      </div>

      {/* Edit Medication Form */}
      {editingMed && (
        <div className="bg-blue-50 p-4 rounded shadow-sm border border-blue-200">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Edit Medication</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <input 
              className="border p-2 rounded" 
              placeholder="Medication Name" 
              value={editMedName} 
              onChange={e => setEditMedName(e.target.value)} 
            />
            <input 
              className="border p-2 rounded" 
              placeholder="Dosage" 
              value={editDosage} 
              onChange={e => setEditDosage(e.target.value)} 
            />
            <select 
              className="border p-2 rounded" 
              value={editAssignedPatient} 
              onChange={e => setEditAssignedPatient(e.target.value)}
            >
              <option value="">Select Patient</option>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select 
              className="border p-2 rounded" 
              value={editTimeOfDay} 
              onChange={e => setEditTimeOfDay(e.target.value)}
            >
              <option value="">Select Time</option>
              {timeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            {daysOfWeek.map(day => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={editSelectedDays.includes(day)}
                  onChange={() => toggleEditDay(day)}
                />
                {day}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" 
              onClick={updateMedication}
            >
              Update Medication
            </button>
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded" 
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-gray-500">Dosage: {med.dosage}</p>
                  <p className="text-xs text-gray-400">
                    Patient: {patients.find((p: any) => p.id === med.user_id)?.name || med.user_id}
                  </p>
                  <p className="text-xs text-gray-400">
                    Days: {med.days_of_week ? med.days_of_week.join(', ') : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Time: {med.time_of_day || 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(med)} 
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteMedication(med.id)} 
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- ActivityTab Component ---
function ActivityTab({ recentActivity, loading }: { recentActivity: any[]; loading: boolean }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Recent Activity (All Patients)</h3>
      {loading ? (
        <div>Loading...</div>
      ) : recentActivity.length === 0 ? (
        <p className="text-gray-500">No recent activity.</p>
      ) : (
        <ul className="space-y-2">
          {recentActivity.map((log: any) => (
            <li key={log.id} className="flex items-center space-x-2">
              <span className={`inline-block w-2 h-2 rounded-full ${log.taken ? "bg-green-500" : "bg-red-500"}`}></span>
              <span className="font-medium">{log.medication_name}</span>
              <span className="text-xs text-gray-500">{log.taken ? "Taken" : "Missed"}</span>
              <span className="text-xs text-gray-400 ml-2">({log.patient_name})</span>
              <span className="text-xs text-gray-400 ml-2">{log.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- NotificationsTab Component ---
function NotificationsTab({ notifications, loading }: { notifications: any[]; loading: boolean }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Notifications</h3>
      {loading ? (
        <div>Loading...</div>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n: any) => (
            <li key={n.id} className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="font-medium">{n.message}</span>
              {n.recipient && <span className="text-xs text-gray-400">To: {n.recipient}</span>}
              <span className="text-xs text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CaretakerCalendarTab({ profile }: { profile: any }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [meds, setMeds] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all patients for this caretaker
    supabase
      .from("user_profiles")
      .select("id, name")
      .eq("role", "patient")
      .then(({ data }) => setPatients(data || []));
    // Fetch all medications for this caretaker
    supabase
      .from("medications")
      .select("*")
      .eq("caretaker_id", profile.id)
      .then(({ data }) => setMeds(data || []));
    // Fetch all logs for these patients
    supabase
      .from("medication_logs")
      .select("*")
      .then(({ data }) => setLogs(data || []));
  }, [profile.id]);

  const getWeekday = (date: Date) =>
    date.toLocaleString("en-US", { weekday: "short" });

  // Helper: check if a medication is already marked as taken for a patient on a date
  const isTaken = (medId: number, patientId: string, dateStr: string) =>
    logs.some((log: any) => log.medication_id === medId && log.patient_id === patientId && log.date === dateStr && log.taken === true);

  // Mark as taken handler
  const markAsTaken = async (medId: number, patientId: string, dateStr: string) => {
    await supabase.from("medication_logs").insert({
      medication_id: medId,
      patient_id: patientId,
      date: dateStr,
      taken: true,
    });
    // Refresh logs
    const { data } = await supabase
      .from("medication_logs")
      .select("*");
    setLogs(data || []);
  };

  let summary: any[] = [];
  let dateStr = "";
  if (selectedDate) {
    const weekday = getWeekday(selectedDate);
    dateStr = selectedDate.toISOString().split("T")[0];
    summary = meds
      .filter((med) => med.days_of_week && med.days_of_week.includes(weekday))
      .map((med) => {
        // FIX: match log by medication_id, patient_id, and date
        const log = logs.find(
          (l) => l.medication_id === med.id && l.patient_id === med.user_id && l.date === dateStr
        );
        const patient = patients.find((p: any) => p.id === med.user_id);
        return {
          ...med,
          patientName: patient ? patient.name : med.user_id,
          taken: log ? log.taken : null,
          patientId: med.user_id,
        };
      });
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-2">All Patients Calendar</h3>
      <CalendarView selected={selectedDate} onSelect={setSelectedDate} />
      {selectedDate && (
        <div className="mt-4 text-sm text-gray-700">
          <div className="font-semibold mb-1">
            Summary for {selectedDate.toLocaleDateString()}:
          </div>
          {summary.length === 0 ? (
            <div>No scheduled medications for this day.</div>
          ) : (
            <ul className="space-y-1">
              {summary.map((med) => (
                <li key={med.id + med.patientId} className="flex items-center space-x-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      med.taken === true
                        ? "bg-green-500"
                        : med.taken === false
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  <span className="font-medium">{med.patientName}</span>
                  <span className="text-xs text-gray-400 ml-2">{med.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{med.dosage}</span>
                  <span className="text-xs text-gray-400 ml-2">{med.time_of_day}</span>
                  {isTaken(med.id, med.patientId, dateStr) ? (
                    <button
                      className="text-xs px-2 py-1 rounded bg-gray-400 text-white font-semibold"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 inline" /> Taken
                    </button>
                  ) : (
                    <button
                      className="text-xs px-2 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      onClick={() => markAsTaken(med.id, med.patientId, dateStr)}
                    >
                      Mark as Taken
                    </button>
                  )}
                  <span
                    className={`text-xs font-semibold ml-2 ${
                      med.taken === true
                        ? "text-green-600"
                        : med.taken === false
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {med.taken === true
                      ? "Taken"
                      : med.taken === false
                      ? "Missed"
                      : "Not logged"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function CaretakerDashboard({ profile }: { profile: any }) {
  const [meds, setMeds] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [assignedPatient, setAssignedPatient] = useState("");
  // Dynamic adherence stats
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [missedThisMonth, setMissedThisMonth] = useState(0);
  const [takenThisWeek, setTakenThisWeek] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [monthTaken, setMonthTaken] = useState(0);
  const [monthMissed, setMonthMissed] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState("");
  // Edit state
  const [editingMed, setEditingMed] = useState<any>(null);
  const [editMedName, setEditMedName] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editAssignedPatient, setEditAssignedPatient] = useState("");
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);
  const [editTimeOfDay, setEditTimeOfDay] = useState("");

  useEffect(() => {
    fetchMeds();
    fetchPatients();
    calculateAdherenceStats();
  }, []);

  // Calculate monthly adherence progress
  useEffect(() => {
    const fetchMonthAdherence = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .gte("date", firstDay.toISOString().split("T")[0])
        .lte("date", lastDay.toISOString().split("T")[0]);
      if (error || !data) {
        setMonthTaken(0);
        setMonthMissed(0);
        setMonthTotal(lastDay.getDate());
        return;
      }
      // Group by date
      const days: Record<string, any[]> = {};
      data.forEach((log: any) => {
        if (!days[log.date]) days[log.date] = [];
        days[log.date].push(log);
      });
      let taken = 0, missed = 0;
      Object.values(days).forEach((logs: any) => {
        // If all logs for the day are taken, count as taken, else missed
        if (logs.length > 0 && logs.every((l: any) => l.taken)) taken++;
        else missed++;
      });
      setMonthTaken(taken);
      setMonthMissed(missed);
      setMonthTotal(lastDay.getDate());
    };
    fetchMonthAdherence();
  }, []);

  // Fetch recent activity for all patients under this caretaker
  useEffect(() => {
    if (activeTab !== "activity") return;
    setLoadingActivity(true);
    // Fetch all medications for this caretaker
    supabase
      .from("medications")
      .select("id, name, user_id")
      .eq("caretaker_id", profile.id)
      .then(async ({ data: meds }) => {
        if (!meds || meds.length === 0) {
          setRecentActivity([]);
          setLoadingActivity(false);
          return;
        }
        const medIds = meds.map((m: any) => m.id);
        // Fetch logs for these medications
        const { data: logs } = await supabase
          .from("medication_logs")
          .select("*")
          .in("medication_id", medIds)
          .order("date", { ascending: false })
          .limit(30);
        // Fetch patient names
        const userIds = [...new Set(meds.map((m: any) => m.user_id))];
        const { data: patients } = await supabase
          .from("user_profiles")
          .select("id, name")
          .in("id", userIds);
        // Map logs to include medication and patient names
        const logsWithNames = (logs || []).map((log: any) => {
          const med = meds.find((m: any) => m.id === log.medication_id);
          const patient = patients?.find((p: any) => p.id === med?.user_id);
          return {
            ...log,
            medication_name: med ? med.name : log.medication_id,
            patient_name: patient ? patient.name : med?.user_id || "",
          };
        });
        setRecentActivity(logsWithNames);
        setLoadingActivity(false);
      });
  }, [activeTab, profile.id]);

  // Fetch notifications
  useEffect(() => {
    if (activeTab !== "notifications") return;
    setLoadingNotifications(true);
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })

      .limit(10)
      .then(({ data }) => {
        setNotifications(data || []);
        setLoadingNotifications(false);
      });
  }, [activeTab]);

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
    if (!medName || !dosage || !assignedPatient || selectedDays.length === 0 || !timeOfDay) return;
    const { error } = await supabase.from("medications").insert({
      caretaker_id: profile.id,
      user_id: assignedPatient,
      name: medName,
      dosage,
      days_of_week: selectedDays,
      time_of_day: timeOfDay,
    });
    if (error) {
      alert("Error adding medication: " + error.message);
      return;
    }
    setMedName("");
    setDosage("");
    setAssignedPatient("");
    setSelectedDays([]);
    setTimeOfDay("");
    fetchMeds();
  };

  const startEdit = (med: any) => {
    setEditingMed(med);
    setEditMedName(med.name);
    setEditDosage(med.dosage);
    setEditAssignedPatient(med.user_id);
    setEditSelectedDays(med.days_of_week || []);
    setEditTimeOfDay(med.time_of_day || "");
  };

  const cancelEdit = () => {
    setEditingMed(null);
    setEditMedName("");
    setEditDosage("");
    setEditAssignedPatient("");
    setEditSelectedDays([]);
    setEditTimeOfDay("");
  };

  const updateMedication = async () => {
    if (!editingMed || !editMedName || !editDosage || !editAssignedPatient || editSelectedDays.length === 0 || !editTimeOfDay) return;
    
    const { error } = await supabase
      .from("medications")
      .update({
        name: editMedName,
        dosage: editDosage,
        user_id: editAssignedPatient,
        days_of_week: editSelectedDays,
        time_of_day: editTimeOfDay,
      })
      .eq("id", editingMed.id);
    
    if (error) {
      alert("Error updating medication: " + error.message);
      return;
    }
    
    cancelEdit();
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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b">
        <div className="flex items-center space-x-3">
          {/* <UserCircle2 className="w-8 h-8 text-blue-600" /> */}
          <span className="text-2xl font-bold tracking-tight">MedBuddy Companion</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-1 text-red-600 hover:underline text-sm"
        >
          {/* <LogOut className="w-4 h-4" /> */}
          <span>Logout</span>
        </button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Adherence Rate"
          value={`${adherenceRate}%`}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          color="from-green-100 to-green-50"
        />
        <StatCard
          label="Current Streak"
          value={currentStreak}
          icon={<CheckCircle className="w-6 h-6 text-blue-500" />}
          color="from-blue-100 to-blue-50"
        />
        <StatCard
          label="Missed This Month"
          value={missedThisMonth}
          icon={<CheckCircle className="w-6 h-6 text-red-500" />}
          color="from-red-100 to-red-50"
        />
        <StatCard
          label="Taken This Week"
          value={takenThisWeek}
          icon={<CheckCircle className="w-6 h-6 text-indigo-500" />}
          color="from-indigo-100 to-indigo-50"
        />
      </section>

      {/* Tabs */}
      <nav className="flex space-x-4 border-b pb-2">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}> <CheckCircle className="w-4 h-4 mr-1" /> Overview </TabButton>
        <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")}> <CheckCircle className="w-4 h-4 mr-1" /> Recent Activity </TabButton>
        <TabButton active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")}> <CheckCircle className="w-4 h-4 mr-1" /> Calendar View </TabButton>
      </nav>

      {/* Tab Content */}
      <section>
        {activeTab === "overview" && (
          <OverviewTab
            meds={meds}
            patients={patients}
            medName={medName}
            setMedName={setMedName}
            dosage={dosage}
            setDosage={setDosage}
            assignedPatient={assignedPatient}
            setAssignedPatient={setAssignedPatient}
            addMedication={addMedication}
            deleteMedication={deleteMedication}
            monthTaken={monthTaken}
            monthMissed={monthMissed}
            monthTotal={monthTotal}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            timeOfDay={timeOfDay}
            setTimeOfDay={setTimeOfDay}
            editingMed={editingMed}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            updateMedication={updateMedication}
            editMedName={editMedName}
            setEditMedName={setEditMedName}
            editDosage={editDosage}
            setEditDosage={setEditDosage}
            editAssignedPatient={editAssignedPatient}
            setEditAssignedPatient={setEditAssignedPatient}
            editSelectedDays={editSelectedDays}
            setEditSelectedDays={setEditSelectedDays}
            editTimeOfDay={editTimeOfDay}
            setEditTimeOfDay={setEditTimeOfDay}
          />
        )}
        {activeTab === "activity" && (
          <ActivityTab recentActivity={recentActivity} loading={loadingActivity} />
        )}
        {activeTab === "calendar" && (
          <CaretakerCalendarTab profile={profile} />
        )}
        {activeTab === "notifications" && (
          <NotificationsTab notifications={notifications} loading={loadingNotifications} />
        )}
      </section>
    </div>
  );
}
