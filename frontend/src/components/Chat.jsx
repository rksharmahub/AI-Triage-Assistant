import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Mic, Send, HeartPulse, Sparkles, Stethoscope, BadgeAlert } from "lucide-react";
import MessageBubble from "./MessageBubble";
import PatientCard from "./PatientCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "process.env.REACT_APP_API_URL";

function generateSessionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(() => generateSessionId());

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      role: "user",
      time: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, {
        session_id: sessionId,
        message: userMessage.text
      });

      setIsTyping(false);

      const botMessage = {
        text: res.data.reply,
        role: "assistant",
        data: res.data.data,
        time: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setIsTyping(false);
      const message =
        error?.code === "ERR_NETWORK"
          ? "Backend is offline. Please start the API server on port 8000."
          : "Sorry, I'm having trouble connecting. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          text: message,
          role: "assistant",
          time: new Date()
        }
      ]);
    }
  };

  const startNewIntake = () => {
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setSessionId(generateSessionId());
  };

  const startVoiceInput = () => {
    if (!window.webkitSpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Voice input is not supported in this browser. Please type your message.",
          role: "assistant",
          time: new Date()
        }
      ]);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setInput(speechText);
    };

    recognition.start();
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-78px)] w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
      <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="frosted rounded-3xl border border-cyan-100 px-5 py-4 shadow-soft">
          <div className="mb-2 flex items-center gap-2 text-cyan-700">
            <HeartPulse className="h-5 w-5" />
            <p className="text-sm font-bold uppercase tracking-wide">Patient Support Assistant</p>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            Share your symptoms in plain words
          </h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            I will help organize your details and guide the care team quickly.
          </p>
        </div>

        <div className="frosted rounded-3xl border border-rose-100 px-4 py-3 text-sm text-rose-700 shadow-soft md:max-w-xs">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <BadgeAlert className="h-4 w-4" />
            Emergency Notice
          </div>
          <p>If this is an emergency, contact local emergency services immediately.</p>
        </div>
      </div>

      <div className="frosted flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-cyan-100 shadow-soft">
        <header className="flex items-center justify-between border-b border-cyan-100 px-5 py-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-400 p-2 text-white shadow-md shadow-cyan-300/40">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">AI Triage Assistant</h2>
              <p className="text-xs text-slate-600">Real-time patient intake and intelligent routing system</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={startNewIntake}
              className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50"
            >
              New Intake
            </button>
            <Sparkles className="h-6 w-6 text-cyan-500" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            {messages.length === 0 && (
              <div className="rounded-3xl border border-cyan-100 bg-white/90 p-6 text-center shadow-sm">
                <Stethoscope className="mx-auto mb-4 h-14 w-14 text-cyan-600" />
                <h3 className="text-2xl font-extrabold text-slate-800">Welcome, we are here to help</h3>
                <p className="mx-auto mt-2 max-w-xl text-slate-600">
                  Start by sharing your name, age, and your main health concern. You can use short sentences.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {[
                    "I have a fever and headache since yesterday.",
                    "My chest feels tight when I walk.",
                    "I need help booking a follow-up visit."
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 sm:text-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="animate-fade-in">
                <MessageBubble
                  text={msg.text}
                  role={msg.role}
                  time={msg.time}
                />
                <PatientCard data={msg.data} />
              </div>
            ))}

            {isTyping && (
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm text-cyan-700">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-600" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-600" style={{ animationDelay: "0.1s" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-600" style={{ animationDelay: "0.2s" }} />
                </div>
                <span>Preparing your response...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-cyan-100 bg-white/70 px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl gap-3">
            <div className="relative flex-1">
              <input
                className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Describe your symptoms… (e.g., chest pain, anxiety, fever)"
                aria-label="Message input"
              />
              <button
                onClick={startVoiceInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-cyan-700"
                title="Voice input"
                aria-label="Start voice input"
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="inline-flex min-w-[52px] items-center justify-center rounded-2xl bg-cyan-600 p-3 text-white transition-all duration-200 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
