// src/components/PatientDashboard.tsx
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import {
  UserCircle2,
  CheckCircle,
  ClipboardList,
  CalendarDays,
  LogOut,
} from "lucide-react";
import CalendarView from "./CalendarView";

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: JSX.Element; color: string }) {
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

function CalendarTab({ profile }: { profile: any }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all logs for this month
    const fetchLogs = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];
      const { data } = await supabase
        .from("medication_logs")
        .select("*, medications(name, dosage)")
        .eq("patient_id", profile.id)
        .gte("date", firstDay)
        .lte("date", lastDay);
      setLogs(data || []);
    };
    fetchLogs();
  }, [profile.id]);

  useEffect(() => {
    if (!selectedDate) {
      setSummary([]);
      return;
    }
    const dateStr = selectedDate.toISOString().split("T")[0];
    setSummary(logs.filter((log) => log.date === dateStr));
  }, [selectedDate, logs]);

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Calendar</h3>
      <CalendarView selected={selectedDate} onSelect={setSelectedDate} logs={logs} />
      {selectedDate && (
        <div className="mt-4 text-sm text-gray-700">
          <div className="font-semibold mb-1">Summary for {selectedDate.toLocaleDateString()}:</div>
          {summary.length === 0 ? (
            <div>No medication logs for this day.</div>
          ) : (
            <ul className="space-y-1">
              {summary.map((log: any) => (
                <li key={log.id} className="flex items-center space-x-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${log.taken ? "bg-green-500" : "bg-red-500"}`}></span>
                  <span className="font-medium">{log.medications?.name}</span>
                  <span className="text-xs text-gray-500">{log.taken ? "Taken" : "Missed"}</span>
                  <span className="text-xs text-gray-400 ml-2">{log.medications?.dosage}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function PatientDashboard({ profile }: { profile: any }) {
  const [meds, setMeds] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [todayTaken, setTodayTaken] = useState(0);
  const [totalMeds, setTotalMeds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [logs, setLogs] = useState<any[]>([]); // Add logs state

  useEffect(() => {
    fetchMeds();
    fetchStats();
    fetchLogs();
  }, []);

  const fetchMeds = async () => {
    const { data } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", profile.id);
    setMeds(data || []);
  };

  const fetchLogs = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("medication_logs")
      .select("*")
      .eq("patient_id", profile.id)
      .eq("date", todayStr);
    setLogs(data || []);
  };

  // Example: Calculate stats (today's taken, total, streak)
  const fetchStats = async () => {
    const { data } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", profile.id);

    setTotalMeds(data?.length || 0);
    // For todayTaken, count logs for today
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: todayLogs } = await supabase
      .from("medication_logs")
      .select("*")
      .eq("patient_id", profile.id)
      .eq("date", todayStr);
    setTodayTaken(todayLogs?.length || 0);

    // Streak: count consecutive days with all meds taken
    let streakCount = 0;
    // You'd need a medication_logs table for real streaks; this is a placeholder
    setStreak(streakCount);
  };

  const markAsTaken = async (id: number) => {
    await supabase.from("medication_logs").insert({
      medication_id: id,
      patient_id: profile.id,
      date: new Date().toISOString().split('T')[0],
      taken: true,
    });
    fetchMeds();
    fetchStats();
    fetchLogs();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    location.href = "/";
  };

  // Helper: check if a medication is already marked as taken today
  const isTakenToday = (medId: number) => logs.some((log: any) => log.medication_id === medId);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b">
        <div className="flex items-center space-x-3">
          <UserCircle2 className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold tracking-tight">Welcome, {profile.name}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-1 text-red-600 hover:underline text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Today's Taken"
          value={todayTaken}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          color="from-green-100 to-green-50"
        />
        <StatCard
          label="Total Medications"
          value={totalMeds}
          icon={<ClipboardList className="w-6 h-6 text-blue-500" />}
          color="from-blue-100 to-blue-50"
        />
        <StatCard
          label="Current Streak"
          value={streak}
          icon={<CalendarDays className="w-6 h-6 text-indigo-500" />}
          color="from-indigo-100 to-indigo-50"
        />
      </section>

      {/* Tabs */}
      <nav className="flex space-x-4 border-b pb-2">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}> <ClipboardList className="w-4 h-4 mr-1" /> Overview </TabButton>
        <TabButton active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")}> <CalendarDays className="w-4 h-4 mr-1" /> Calendar </TabButton>
      </nav>

      {/* Tab Content */}
      <section>
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-2">Your Medications</h2>
            {meds.map((med: any) => {
              const takenToday = isTakenToday(med.id);
              return (
                <div key={med.id} className="p-4 border rounded flex justify-between items-center bg-white shadow-sm">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-500">Dosage: {med.dosage}</p>
                    {med.days_of_week && (
                      <p className="text-xs text-gray-400">Days: {med.days_of_week.join(', ')}</p>
                    )}
                  </div>
                  {takenToday ? (
                    <button
                      className="text-sm px-3 py-1 rounded flex items-center space-x-1 bg-gray-400 text-white"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Taken</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsTaken(med.id)}
                      className="text-sm px-3 py-1 rounded flex items-center space-x-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <span>Mark as Taken</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {activeTab === "calendar" && <CalendarTab profile={profile} />}
      </section>
    </div>
  );
}
