import Chat from "./components/Chat";
import AdminDashboard from "./components/AdminDashboard";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { MessageCircle, BarChart3, ShieldPlus } from "lucide-react";

function App() {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-cyan-600 text-white shadow-md"
        : "text-slate-600 hover:bg-white hover:text-cyan-700"
    }`;

  return (
    <BrowserRouter>
      <div className="app-grid-bg min-h-screen">
        <nav className="sticky top-0 z-10 border-b border-cyan-100/80 frosted">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-gentle-float rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-400 p-2 text-white shadow-lg shadow-cyan-300/40">
                <ShieldPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-800">TriageAI – Intelligent Hospital Assistant</p>
                <p className="text-xs font-medium text-slate-600">AI-powered patient triage and intelligent hospital routing system</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-cyan-50/90 p-1">
              <NavLink to="/" className={navLinkClass} end>
                <MessageCircle className="h-4 w-4" />
                <span>Assistant</span>
              </NavLink>
              <NavLink to="/admin" className={navLinkClass}>
                <BarChart3 className="h-4 w-4" />
                <span>Admin</span>
              </NavLink>
            </div>
          </div>
        </nav>

        <main className="relative z-[1]">
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
