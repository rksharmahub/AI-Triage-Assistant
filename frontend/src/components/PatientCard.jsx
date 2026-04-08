import {
  User,
  Calendar,
  MessageSquare,
  MapPin,
  ClipboardList,
  AlertTriangle,
  Brain
} from "lucide-react";

export default function PatientCard({ data }) {
  if (!data) return null;
  const severity = (data.severity || "").toUpperCase();

  // 🎯 Severity color logic
  const getSeverityStyle = () => {
    if (severity === "HIGH")
      return "bg-red-100 text-red-700 border-red-200";
    if (severity === "MEDIUM")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  return (
    <div className="mt-2 max-w-[85%] rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-slate-700 shadow-sm sm:max-w-[70%]">
      
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <ClipboardList className="h-4 w-4" />
        </span>
        <h2 className="text-base font-extrabold text-emerald-800">
          Patient Summary
        </h2>
      </div>

      {/* Basic Info */}
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2">
          <User className="h-4 w-4 text-slate-500" />
          <span>
            <strong>Name:</strong> {data.patient_name || "Not provided"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span>
            <strong>Age:</strong> {data.patient_age || "Not provided"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 sm:col-span-2">
          <MessageSquare className="h-4 w-4 text-slate-500" />
          <span>
            <strong>Query:</strong> {data.patient_query || "Not provided"}
          </span>
        </div>
      </div>

      {/* Ward + Severity */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <MapPin className="h-4 w-4 text-emerald-700" />

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 sm:text-sm">
          Ward: {data.ward || "Pending"}
        </span>

        {/* 🔥 Severity Badge */}
        {severity && (
          <span
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold sm:text-sm ${getSeverityStyle()}`}
          >
            <AlertTriangle className="h-3 w-3" />
            {severity} Risk
          </span>
        )}
      </div>

      {/* 🧠 AI Explanation */}
      {data.explanation && (
        <div className="mt-3 rounded-xl bg-white/80 p-3 text-sm text-slate-600 border border-slate-200">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Brain className="h-4 w-4" />
            AI Explanation
          </div>
          <p>{data.explanation}</p>
        </div>
      )}
    </div>
  );
}
