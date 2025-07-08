import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "caretaker">("patient");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    const user = data?.user;
    if (error || !user) {
      setLoading(false);
      alert("Signup failed: " + error?.message);
      return;
    }

    // Insert profile into user_profiles
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: user.id,
      name,
      role,
    });

    setLoading(false);

    if (profileError) {
      alert("Signup failed: " + profileError.message);
    } else {
      alert("Signup successful. Please check your email to confirm before logging in.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">MedBuddy Signup / Login</h1>

        <input
          className="w-full p-2 border rounded"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="w-full p-2 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value as "patient" | "caretaker")}
        >
          <option value="patient">Patient</option>
          <option value="caretaker">Caretaker</option>
        </select>

        <input
          className="w-full p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            onClick={handleSignup}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </div>
      </div>
    </div>
  );
}
