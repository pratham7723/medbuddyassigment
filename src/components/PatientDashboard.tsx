// src/components/PatientDashboard.tsx
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function PatientDashboard({ profile }: { profile: any }) {
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    const { data } = await supabase
      .from("medications")
      .select("*")
      .eq("patient_name", profile.name);
    setMeds(data || []);
  };

  const markAsTaken = async (id: number) => {
    await supabase.from("medications").update({ taken_today: true }).eq("id", id);
    fetchMeds();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    location.href = "/";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome, {profile.name} (Patient)</h1>
        <button className="text-red-600 text-sm" onClick={logout}>Logout</button>
      </div>

      <h2 className="text-lg font-semibold mb-2">Your Medications</h2>
      {meds.map((med: any) => (
        <div key={med.id} className="p-4 border rounded flex justify-between items-center">
          <div>
            <p className="font-medium">{med.med_name}</p>
            <p className="text-sm text-gray-500">Dosage: {med.dosage}</p>
          </div>
          <button
            onClick={() => markAsTaken(med.id)}
            className={`text-sm px-3 py-1 rounded ${med.taken_today ? "bg-gray-400 text-white" : "bg-blue-600 text-white"}`}
            disabled={med.taken_today}
          >
            {med.taken_today ? "✅ Taken" : "Mark as Taken"}
          </button>
        </div>
      ))}
    </div>
  );
}
