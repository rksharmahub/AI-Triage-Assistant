import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  RefreshCw,
  FileText,
  TriangleAlert,
  Activity,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Brain
} from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "");

function buildAnalyticsFromPatients(patients) {
  const total = patients.length;
  const emergency = patients.filter((p) => p.ward === "Emergency").length;

  const wardCounts = {};
  const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };

  for (const patient of patients) {
    const ward = patient.ward || "Unknown";
    wardCounts[ward] = (wardCounts[ward] || 0) + 1;

    const severity = (patient.severity || "MEDIUM").toUpperCase();
    if (severityCounts[severity] === undefined) {
      severityCounts.MEDIUM += 1;
    } else {
      severityCounts[severity] += 1;
    }
  }

  return {
    total,
    emergency_rate: total ? (emergency / total) * 100 : 0,
    ward_counts: wardCounts,
    severity_counts: severityCounts
  };
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchHealth();

    const intervalId = setInterval(fetchHealth, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchAll = async () => {
    if (!API_BASE_URL) {
      setLoading(false);
      setError("API URL is not configured. Set VITE_API_BASE_URL in frontend deployment settings.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [patientsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/patients`),
        axios.get(`${API_BASE_URL}/analytics`)
      ]);

      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      setAnalytics(analyticsRes.data || null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (err?.code === "ERR_NETWORK") {
        setError("Backend is unreachable. Check deployed API URL/CORS and refresh.");
      } else {
        setError("Could not load dashboard analytics right now.");
      }

      try {
        const patientsRes = await axios.get(`${API_BASE_URL}/patients`);
        setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      } catch (fallbackErr) {
        console.error(fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    if (!API_BASE_URL) {
      setHealth(null);
      setHealthError("Health check unavailable (VITE_API_BASE_URL not configured).");
      return;
    }

    setHealthError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/health`);
      setHealth(res.data);
    } catch (err) {
      console.error(err);
      setHealth(null);
      if (err?.code === "ERR_NETWORK") {
        setHealthError("Health check unavailable (backend offline).");
      } else {
        setHealthError("Health check unavailable.");
      }
    }
  };

  const refreshAll = () => {
    fetchAll();
    fetchHealth();
  };

  const analyticsData = useMemo(() => {
    if (analytics) return analytics;
    return buildAnalyticsFromPatients(patients);
  }, [analytics, patients]);

  const wardCounts = analyticsData.ward_counts || {};

  const barData = {
    labels: Object.keys(wardCounts).length ? Object.keys(wardCounts) : ["No Data"],
    datasets: [
      {
        label: "Patients per Ward",
        data: Object.keys(wardCounts).length ? Object.values(wardCounts) : [0],
        backgroundColor: ["#0891b2", "#16a34a", "#ea580c", "#64748b"],
        borderRadius: 8
      }
    ]
  };

  const pieData = {
    labels: ["Emergency", "Others"],
    datasets: [
      {
        data: [
          Number(analyticsData.emergency_rate || 0),
          Math.max(0, 100 - Number(analyticsData.emergency_rate || 0))
        ],
        backgroundColor: ["#ea580c", "#0891b2"]
      }
    ]
  };

  const getSeverityStyle = (severity) => {
    if ((severity || "").toUpperCase() === "HIGH") return "bg-red-100 text-red-700";
    if ((severity || "").toUpperCase() === "MEDIUM") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const overallHealthStatus = health?.status || "unknown";
  const healthBadgeClass =
    overallHealthStatus === "up"
      ? "bg-emerald-100 text-emerald-800"
      : overallHealthStatus === "degraded"
        ? "bg-orange-100 text-orange-800"
        : "bg-slate-100 text-slate-700";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-78px)] p-8">
        <div className="frosted mx-auto max-w-6xl rounded-2xl border border-cyan-100 p-8 text-center shadow-soft">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-cyan-600" />
          <p className="mt-3 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-78px)] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="frosted mb-6 rounded-3xl border border-cyan-100 p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">AI Analytics Dashboard</h1>
              <p className="text-sm text-slate-600">Severity scoring, AI explanation, and ward analytics</p>
            </div>
            <button
              onClick={refreshAll}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-cyan-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 font-medium text-slate-700">
              <HeartPulse className="h-4 w-4 text-cyan-600" />
              System health
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${healthBadgeClass}`}>
              {overallHealthStatus}
            </span>
            <button
              onClick={() => setShowHealthDetails((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50"
            >
              <span>{showHealthDetails ? "Hide details" : "Show details"}</span>
              {showHealthDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {healthError && <span className="text-xs text-orange-700">{healthError}</span>}
          </div>

          {showHealthDetails && health?.services && (
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-3">
              {Object.entries(health.services).map(([name, service]) => (
                <div key={name} className="rounded-xl border border-cyan-100 bg-white/70 px-3 py-2">
                  <div className="font-semibold text-slate-700">{name}</div>
                  <div className="capitalize">Status: {service.status || "unknown"}</div>
                  {typeof service.latency_ms === "number" && <div>Latency: {service.latency_ms}ms</div>}
                  {service.reason && <div className="mt-1 text-orange-700">{service.reason}</div>}
                </div>
              ))}
            </div>
          )}

          {lastUpdated && (
            <p className="mt-3 text-xs text-slate-500">
              Last updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {error && <p className="mt-2 text-sm text-orange-700">{error}</p>}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="frosted rounded-2xl border border-cyan-100 p-5 shadow-sm">
            <div className="flex items-center">
              <Users className="mr-3 h-8 w-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-extrabold text-slate-800">{analyticsData.total || 0}</p>
                <p className="text-sm text-slate-600">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="frosted rounded-2xl border border-orange-100 p-5 shadow-sm">
            <div className="flex items-center">
              <TriangleAlert className="mr-3 h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-extrabold text-slate-800">{Number(analyticsData.emergency_rate || 0).toFixed(2)}%</p>
                <p className="text-sm text-slate-600">Emergency Rate</p>
              </div>
            </div>
          </div>

          <div className="frosted rounded-2xl border border-emerald-100 p-5 shadow-sm">
            <div className="flex items-center">
              <FileText className="mr-3 h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-extrabold text-slate-800">{Object.keys(wardCounts).length}</p>
                <p className="text-sm text-slate-600">Active Wards</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="frosted rounded-2xl border border-cyan-100 p-4 shadow-soft">
            <h2 className="mb-3 text-sm font-bold text-slate-700">Patients per Ward</h2>
            <Bar data={barData} />
          </div>

          <div className="frosted rounded-2xl border border-cyan-100 p-4 shadow-soft">
            <h2 className="mb-3 text-sm font-bold text-slate-700">Emergency vs Others</h2>
            <Pie data={pieData} />
          </div>
        </div>

        <div className="frosted overflow-hidden rounded-3xl border border-cyan-100 shadow-soft">
          <div className="border-b border-cyan-100 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-800">Patient Records</h2>
          </div>

          {patients.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="mx-auto mb-3 h-10 w-10 text-slate-400" />
              <p className="text-slate-600">No patient records available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cyan-50/80 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Age</th>
                    <th className="px-4 py-3 text-left">Query</th>
                    <th className="px-4 py-3 text-left">Ward</th>
                    <th className="px-4 py-3 text-left">Severity</th>
                    <th className="px-4 py-3 text-left">AI Insight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-100 bg-white/70 text-slate-700">
                  {patients.map((patient, index) => (
                    <tr key={index} className="hover:bg-cyan-50/60">
                      <td className="px-4 py-3 font-medium">{patient.patient_name || "-"}</td>
                      <td className="px-4 py-3">{patient.patient_age || "-"}</td>
                      <td className="max-w-xs truncate px-4 py-3">{patient.patient_query || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800">
                          {patient.ward || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getSeverityStyle(patient.severity)}`}>
                          {(patient.severity || "MEDIUM").toUpperCase()}
                        </span>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-xs text-slate-600">
                        <div className="flex items-start gap-1">
                          <Brain className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{patient.explanation || "No explanation available"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
