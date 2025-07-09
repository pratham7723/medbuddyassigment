import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: "patient" | "caretaker") => {
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-green-100 relative overflow-hidden">
      {/* Minimal header with small logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2">
        <span className="bg-gradient-to-tr from-blue-400 to-green-400 p-2 rounded-full shadow">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 6.6a5.5 5.5 0 0 0-7.8 0l-.9.9-.9-.9a5.5 5.5 0 0 0-7.8 7.8l.9.9 7.8 7.8 7.8-7.8.9-.9a5.5 5.5 0 0 0 0-7.8z"></path>
          </svg>
        </span>
        <span className="font-bold text-lg text-gray-700 tracking-tight">MedBuddy</span>
      </div>

      {/* Split layout */}
      <div className="relative w-full max-w-4xl mx-auto flex flex-col md:flex-row items-stretch mt-24 md:mt-0 shadow-2xl rounded-3xl overflow-hidden">
        {/* Patient Side */}
        <div
          className="flex-1 bg-gradient-to-br from-blue-200 to-blue-50 flex flex-col items-center justify-center p-10 transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer group"
          onClick={() => handleRoleSelect("patient")}
        >
          <span className="mb-4">
            {/* Playful pill bottle icon */}
            <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
              <rect x="12" y="8" width="24" height="32" rx="6" fill="#3b82f6" />
              <rect x="16" y="16" width="16" height="20" rx="3" fill="#fff" />
              <rect x="18" y="20" width="12" height="2" rx="1" fill="#3b82f6" />
              <rect x="18" y="26" width="12" height="2" rx="1" fill="#3b82f6" />
            </svg>
          </span>
          <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Patient</h2>
          <p className="text-blue-800 text-sm mb-2 font-medium">"My Meds, My Way"</p>
          <p className="text-xs text-blue-700 mb-4 text-center">
            Track, check off, and celebrate your medication wins. Simple, visual, and made for you.
          </p>
          <button className="bg-blue-600 group-hover:bg-blue-700 text-white font-bold rounded-full px-6 py-2 shadow transition">
            Continue as Patient
          </button>
        </div>

        {/* Wavy Divider */}
        <div className="hidden md:block w-8 relative z-10">
          <svg width="100%" height="100%" viewBox="0 0 32 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full">
            <path d="M16 0C24 80 8 160 16 240C24 320 8 400 16 480" stroke="#e0e7ff" strokeWidth="4" fill="none" />
          </svg>
        </div>

        {/* Caretaker Side */}
        <div
          className="flex-1 bg-gradient-to-br from-green-200 to-green-50 flex flex-col items-center justify-center p-10 transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer group"
          onClick={() => handleRoleSelect("caretaker")}
        >
          <span className="mb-4">
            {/* Playful shield/heart icon */}
            <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
              <path d="M24 6C24 6 8 10 8 22c0 10 8 16 16 20 8-4 16-10 16-20C40 10 24 6 24 6z" fill="#22c55e" />
              <path d="M24 14c-3 0-5 2.5-5 5.5 0 2.5 2.5 5.5 5 7.5 2.5-2 5-5 5-7.5C29 16.5 27 14 24 14z" fill="#fff" />
            </svg>
          </span>
          <h2 className="text-2xl font-extrabold text-green-900 mb-1">Caretaker</h2>
          <p className="text-green-800 text-sm mb-2 font-medium">"Support, Simplified"</p>
          <p className="text-xs text-green-700 mb-4 text-center">
            Easily monitor, remind, and cheer on your loved ones. All their progress, at a glance.
          </p>
          <button className="bg-green-600 group-hover:bg-green-700 text-white font-bold rounded-full px-6 py-2 shadow transition">
            Continue as Caretaker
          </button>
        </div>
      </div>
    </div>
  );
}
