import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "caretaker">("patient");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read role from URL parameter on component mount
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "patient" || roleParam === "caretaker") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const setRoleAndMode = (selectedRole: "patient" | "caretaker", mode: "login" | "signup") => {
    setRole(selectedRole);
    setIsSignup(mode === "signup");
    clearErrors();
    // Clear form when switching modes
    if (mode === "login") {
      setName("");
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (isSignup) {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      } else if (!validateName(name)) {
        newErrors.name = "Name must be at least 2 characters long";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    clearErrors();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setErrors({ general: error.message });
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    clearErrors();

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      const user = data?.user;
      
      if (error || !user) {
        setErrors({ general: error?.message || "Signup failed" });
        return;
      }

      // Insert profile into user_profiles
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: user.id,
        name: name.trim(),
        role,
      });

      if (profileError) {
        setErrors({ general: profileError.message });
      } else {
        alert("Signup successful! Please check your email to confirm your account before logging in.");
        navigate("/dashboard");
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MedBuddy</h1>
          <p className="text-gray-600">
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Role Selection Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setRoleAndMode("patient", isSignup ? "signup" : "login")}
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
              role === "patient" 
                ? "border-blue-500 bg-blue-50 text-blue-700" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => setRoleAndMode("caretaker", isSignup ? "signup" : "login")}
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
              role === "caretaker" 
                ? "border-blue-500 bg-blue-50 text-blue-700" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            Caretaker
          </button>
        </div>

        

        {/* Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); isSignup ? handleSignup() : handleLogin(); }}>
          {/* Name Field - Only show during signup */}
          {isSignup && (
            <div>
              <input
                className={`w-full p-3 border rounded-lg transition-colors ${
                  errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                placeholder="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) clearErrors();
                }}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <input
              className={`w-full p-3 border rounded-lg transition-colors ${
                errors.email ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-200`}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) clearErrors();
              }}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <input
              className={`w-full p-3 border rounded-lg transition-colors ${
                errors.password ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-200`}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) clearErrors();
              }}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading 
              ? (isSignup ? "Creating Account..." : "Signing In...") 
              : (isSignup ? "Create Account" : "Sign In")
            }
          </button>
        </form>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-600">
          {isSignup ? (
            <p>Already have an account? <button onClick={() => setRoleAndMode(role, "login")} className="text-blue-600 hover:underline">Sign in here</button></p>
          ) : (
            <p>Don't have an account? <button onClick={() => setRoleAndMode(role, "signup")} className="text-blue-600 hover:underline">Sign up here</button></p>
          )}
        </div>
      </div>
    </div>
  );
}