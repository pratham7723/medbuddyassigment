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

  // Example: Calculate stats (today's taken, streak)
  const fetchStats = async () => {
    const { data } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", profile.id);

    // setTotalMeds(data?.length || 0); // Removed unused totalMeds
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

  // Helper: check if today is a scheduled day for this medication
  const isScheduledToday = (med: any) => {
    if (!med.days_of_week || med.days_of_week.length === 0) return true; // If no days specified, assume daily
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    return med.days_of_week.includes(today);
  };

  // Helper: check if current time is within the medication's time window
  const isWithinTimeWindow = (med: any) => {
    if (!med.time_of_day) return true; // If no time specified, allow anytime
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes
    
    // Define time windows for each medication time
    const timeWindows: { [key: string]: { start: number; end: number; label: string } } = {
      'After Breakfast': { start: 8 * 60 + 0, end: 10 * 60 + 0, label: '8:00 AM - 10:00 AM' },
      'Before Lunch': { start: 11 * 60 + 0, end: 13 * 60 + 0, label: '11:00 AM - 1:00 PM' },
      'After Lunch': { start: 13 * 60 + 0, end: 15 * 60 + 0, label: '1:00 PM - 3:00 PM' },
      'High Tea': { start: 16 * 60 + 0, end: 18 * 60 + 0, label: '4:00 PM - 6:00 PM' },
      'Before Dinner': { start: 18 * 60 + 0, end: 20 * 60 + 0, label: '6:00 PM - 8:00 PM' },
      'After Dinner': { start: 20 * 60 + 0, end: 22 * 60 + 0, label: '8:00 PM - 10:00 PM' }
    };
    
    const window = timeWindows[med.time_of_day];
    if (!window) return true; // If time not recognized, allow anytime
    
    return currentTime >= window.start && currentTime <= window.end;
  };

  // Helper: get time window label
  const getTimeWindowLabel = (med: any) => {
    if (!med.time_of_day) return null;
    
    const timeWindows: { [key: string]: string } = {
      'After Breakfast': '8:00 AM - 10:00 AM',
      'Before Lunch': '11:00 AM - 1:00 PM',
      'After Lunch': '1:00 PM - 3:00 PM',
      'High Tea': '4:00 PM - 6:00 PM',
      'Before Dinner': '6:00 PM - 8:00 PM',
      'After Dinner': '8:00 PM - 10:00 PM'
    };
    
    return timeWindows[med.time_of_day] || med.time_of_day;
  };

  // Helper: get status for medication today
  const getMedicationStatus = (med: any) => {
    const takenToday = isTakenToday(med.id);
    const scheduledToday = isScheduledToday(med);
    const withinTimeWindow = isWithinTimeWindow(med);
    
    if (takenToday) return { status: 'taken', text: 'Taken', color: 'bg-green-500 text-white' };
    if (scheduledToday && withinTimeWindow) return { status: 'due', text: 'Due Now', color: 'bg-blue-600 text-white hover:bg-blue-700' };
    if (scheduledToday && !withinTimeWindow) return { status: 'outside-time', text: 'Outside Time Window', color: 'bg-gray-400 text-white' };
    return { status: 'not-scheduled', text: 'Not Today', color: 'bg-gray-300 text-gray-600' };
  };

  // Filter medications to show only today's scheduled ones
  const todaysMedications = meds.filter(med => isScheduledToday(med));

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
          label="Today's Scheduled"
          value={todaysMedications.length}
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
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}> <ClipboardList className="w-4 h-4 mr-1" /> Today's Medications </TabButton>
        <TabButton active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")}> <CalendarDays className="w-4 h-4 mr-1" /> Calendar </TabButton>
      </nav>

      {/* Tab Content */}
      <section>
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold mb-2">Today's Medications</h2>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            {todaysMedications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No medications scheduled for today.</p>
                <p className="text-sm">Check your calendar view to see your full schedule.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysMedications.map((med: any) => {
                  const takenToday = isTakenToday(med.id);
                  const scheduledToday = isScheduledToday(med);
                  const withinTimeWindow = isWithinTimeWindow(med);
                  const timeWindowLabel = getTimeWindowLabel(med);
                  
                  return (
                    <div key={med.id} className={`p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm transition-all ${
                      takenToday ? 'border-green-200 bg-green-50' : 
                      scheduledToday && withinTimeWindow ? 'border-blue-200 bg-blue-50' : 
                      scheduledToday && !withinTimeWindow ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-lg">{med.name}</p>
                          {scheduledToday && withinTimeWindow && !takenToday && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Due Now
                            </span>
                          )}
                          {scheduledToday && !withinTimeWindow && !takenToday && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              Outside Time Window
                            </span>
                          )}
                          {takenToday && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              ✓ Taken
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Dosage: {med.dosage}</p>
                        {timeWindowLabel && (
                          <p className="text-sm text-gray-600 mb-1">
                            Time: {med.time_of_day} ({timeWindowLabel})
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Scheduled Days:</span>
                          <div className="flex space-x-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                              <span
                                key={day}
                                className={`text-xs px-2 py-1 rounded ${
                                  med.days_of_week?.includes(day)
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {takenToday ? (
                          <button
                            className="text-sm px-4 py-2 rounded-lg flex items-center space-x-2 bg-green-500 text-white cursor-default"
                            disabled
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Taken</span>
                          </button>
                        ) : scheduledToday && withinTimeWindow ? (
                          <button
                            onClick={() => markAsTaken(med.id)}
                            className="text-sm px-4 py-2 rounded-lg flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark as Taken</span>
                          </button>
                        ) : scheduledToday && !withinTimeWindow ? (
                          <button
                            className="text-sm px-4 py-2 rounded-lg flex items-center space-x-2 bg-gray-400 text-white cursor-default"
                            disabled
                            title={`Available during: ${timeWindowLabel}`}
                          >
                            <span>Outside Time Window</span>
                          </button>
                        ) : (
                          <button
                            className="text-sm px-4 py-2 rounded-lg flex items-center space-x-2 bg-gray-300 text-gray-600 cursor-default"
                            disabled
                          >
                            <span>Not Today</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === "calendar" && <CalendarTab profile={profile} />}
      </section>
    </div>
  );
}
