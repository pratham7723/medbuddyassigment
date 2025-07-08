// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import CaretakerDashboard from "../components/CaretakerDashboard";
import PatientDashboard from "../components/PatientDashboard";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        alert("User profile not found.");
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <>
      {profile.role === "caretaker" ? (
        <CaretakerDashboard profile={profile} />
      ) : (
        <PatientDashboard profile={profile} />
      )}
    </>
  );
}
