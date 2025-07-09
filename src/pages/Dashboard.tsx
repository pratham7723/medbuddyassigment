import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import CaretakerDashboard from "../components/CaretakerDashboard";
import PatientDashboard from "../components/PatientDashboard";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        alert("User profile not found.");
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!user) {
    // Not logged in: show a modern, welcoming UI with login/signup buttons
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold mb-4">Welcome to MedBuddy Companion</h1>
          <p className="text-gray-600 mb-8">Your trusted partner in medication management.</p>
          <div className="flex flex-col gap-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2"
              onClick={() => navigate("/auth")}
            >
              Login / Signup as Patient
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded px-4 py-2"
              onClick={() => navigate("/auth")}
            >
              Login / Signup as Caretaker
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in, show the correct dashboard
  return (
    <>
      {profile?.role === "caretaker" ? (
        <CaretakerDashboard profile={profile} />
      ) : (
        <PatientDashboard profile={profile} />
      )}
    </>
  );
}
