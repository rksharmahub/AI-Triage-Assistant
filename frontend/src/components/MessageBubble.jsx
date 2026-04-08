import { UserRound, Bot } from "lucide-react";

export default function MessageBubble({ text, role, time }) {
  const isUser = role === "user";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] sm:max-w-[70%]">
        <div className={`mb-1 flex items-center gap-2 text-xs ${isUser ? "justify-end text-cyan-700" : "justify-start text-slate-500"}`}>
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${isUser ? "bg-cyan-600 text-white" : "bg-emerald-100 text-emerald-700"}`}>
            {isUser ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          </span>
          <span className="font-semibold">{isUser ? "You" : "Care Assistant"}</span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:text-base ${
            isUser
              ? "bg-cyan-600 text-white"
              : "border border-cyan-100 bg-white text-slate-700"
          }`}
        >
          {text}
        </div>

        {time && (
          <div className={`mt-1 text-xs ${isUser ? "text-right text-cyan-700" : "text-left text-slate-500"}`}>
            {new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </div>
  );
}
