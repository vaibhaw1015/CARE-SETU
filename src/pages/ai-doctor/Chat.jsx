import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  AlertTriangle,
  PhoneCall,
  X,
  Trash2,
  Sparkles,
  ChevronRight,
  Ambulance,
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";
import { streamGroqResponse } from "../../lib/groqClient";
import { detectRedFlag } from "../../lib/redFlags";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

// Audio alert for red-flag emergency detection
function playEmergencyTone() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(820, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // audio context blocked by browser policy
  }
}

// ─── Suggested starter prompts ───────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  { label: "🤒 Fever & Headache", text: "I have a fever of 102°F and a bad headache since yesterday. What should I do?" },
  { label: "🤧 Cold & Cough", text: "My child has a running nose, cough, and mild fever. Any home remedies?" },
  { label: "🤢 Stomach Pain", text: "I have stomach pain and nausea after eating. Is this food poisoning?" },
  { label: "💊 Paracetamol Dose", text: "What is the correct dose of paracetamol for an adult with fever?" },
  { label: "😮‍💨 Breathlessness", text: "I feel slightly breathless when climbing stairs. Should I be worried?" },
  { label: "🩸 Diabetes Query", text: "My fasting blood sugar is 140 mg/dL. Is that high? What should I eat?" },
];

// ─── Message bubble component ────────────────────────────────────────────────
function MessageBubble({ msg, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    if (onCopy) onCopy(msg.content);
  };

  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] sm:max-w-[65%]">
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white px-4 py-3 rounded-3xl rounded-tr-md shadow-sm text-sm leading-relaxed">
            {msg.content}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-right pr-1">{msg.time}</p>
        </div>
      </div>
    );
  }

  if (msg.role === "assistant") {
    return (
      <div className="flex items-start gap-2.5">
        {/* Bot avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200 px-4 py-3.5 rounded-3xl rounded-tl-md shadow-sm text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {msg.content || <TypingIndicator />}
          </div>
          <div className="flex items-center gap-2 mt-1 pl-1">
            <p className="text-[10px] text-slate-400">{msg.time}</p>
            {msg.content && (
              <button
                onClick={handleCopy}
                className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // System / error messages
  return (
    <div className="flex justify-center">
      <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-2xl max-w-sm text-center">
        {msg.content}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// ─── Emergency Overlay ────────────────────────────────────────────────────────
function EmergencyOverlay({ redFlag, onDismiss, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Red pulsing header */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-200 mb-0.5">
                ⚠️ Emergency Detected
              </p>
              <h2 className="text-lg font-black leading-tight">{redFlag.category}</h2>
            </div>
          </div>
        </div>

        {/* Advice */}
        <div className="px-6 pt-5 pb-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
            <p className="font-bold mb-1">First-Aid Guidance:</p>
            <p>{redFlag.advice}</p>
          </div>

          {/* Big call buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:108"
              className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-all shadow-md shadow-red-200 active:scale-95"
            >
              <PhoneCall className="w-6 h-6" />
              <span>Call 108</span>
              <span className="text-[10px] font-normal text-red-200">Ambulance</span>
            </a>
            <a
              href="tel:112"
              className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition-all active:scale-95"
            >
              <PhoneCall className="w-6 h-6 text-red-400" />
              <span>Call 112</span>
              <span className="text-[10px] font-normal text-slate-400">National</span>
            </a>
          </div>

          <Link
            to="/emergency"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-sm hover:bg-brand-100 transition-colors"
          >
            <Ambulance className="w-4 h-4" />
            <span>Book Nearest Ambulance</span>
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={onContinue}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium py-1 underline underline-offset-2"
          >
            Continue to AI Doctor anyway (not recommended)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Welcome screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ onPromptSelect }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-10 px-4 space-y-6">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-200">
          <Bot className="w-11 h-11 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>

      <div className="text-center max-w-sm">
        <h2 className="text-xl font-black text-slate-900">CareSetu AI Doctor</h2>
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
          Get instant general health advice in plain language. Powered by Groq AI.
        </p>
      </div>

      {/* Safety notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-sm w-full text-xs text-amber-800 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Not a substitute for a real doctor.</strong> For emergencies, call{" "}
          <a href="tel:108" className="font-bold underline">108</a> or{" "}
          <a href="tel:112" className="font-bold underline">112</a> immediately.
        </p>
      </div>

      {/* Suggested prompts */}
      <div className="w-full max-w-lg space-y-2">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
          Try asking about…
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => onPromptSelect(p.text)}
              className="flex items-center gap-2.5 text-left px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm transition-all text-xs font-medium text-slate-700 group"
            >
              <span className="flex-1">{p.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Chat Component ──────────────────────────────────────────────────────
export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]); // {role, content, time, id}
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [redFlag, setRedFlag] = useState(null);         // Current red-flag to show
  const [pendingMessage, setPendingMessage] = useState(null); // Message pending after overlay dismiss
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const MAX_CHARS = 500;
  const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup streaming & speech recognition on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Load user's latest chat session from Supabase if logged in
  useEffect(() => {
    if (!user) return;
    async function loadLatestSession() {
      try {
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (sessions && sessions.length > 0) {
          const sId = sessions[0].id;
          setSessionId(sId);
          const { data: msgs } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("session_id", sId)
            .order("created_at", { ascending: true });

          if (msgs && msgs.length > 0) {
            setMessages(
              msgs.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                time: new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Could not load chat history:", err);
      }
    }
    loadLatestSession();
  }, [user]);

  // Toggle voice input with Web Speech API
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Android.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN";
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const addMessage = useCallback((role, content, id) => {
    const msgId = id ?? `${Date.now()}-${Math.random()}`;
    setMessages((prev) => [...prev, { role, content, time: now(), id: msgId }]);
    return msgId;
  }, []);

  /** Update the last AI bubble (streaming) */
  const appendToLastAssistant = useCallback((chunk) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.role === "assistant") {
        updated[updated.length - 1] = { ...last, content: last.content + chunk };
      }
      return updated;
    });
  }, []);

  /** Core: send a user message, detect red flags, then stream LLM response */
  const sendMessage = useCallback(
    async (text, skipRedFlagCheck = false) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      // ── LAYER 1: Red-flag scan ────────────────────────────────────────────
      if (!skipRedFlagCheck) {
        const flag = detectRedFlag(trimmed);
        if (flag) {
          playEmergencyTone();
          setPendingMessage(trimmed);
          setRedFlag(flag);
          return;
        }
      }

      // ── Add user bubble ───────────────────────────────────────────────────
      addMessage("user", trimmed);
      setInput("");

      // Ensure session in Supabase if logged in
      let activeSessionId = sessionId;
      if (user && !activeSessionId) {
        try {
          const { data: newSess } = await supabase
            .from("chat_sessions")
            .insert({ user_id: user.id })
            .select("id")
            .single();
          if (newSess) {
            activeSessionId = newSess.id;
            setSessionId(activeSessionId);
          }
        } catch (e) {
          console.warn("Could not create chat session:", e);
        }
      }

      // Save user message to Supabase
      if (user && activeSessionId) {
        supabase
          .from("chat_messages")
          .insert({
            session_id: activeSessionId,
            user_id: user.id,
            role: "user",
            content: trimmed,
            severity: skipRedFlagCheck ? "high" : "low",
          })
          .then();
      }

      // Snapshot of chat history for Groq context
      const historyForGroq = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: trimmed },
      ];

      // ── Add empty AI bubble (will fill via streaming) ─────────────────────
      const aiMsgId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", time: now(), id: aiMsgId },
      ]);
      setIsStreaming(true);

      // ── LAYER 2: Groq LLM streaming ───────────────────────────────────────
      abortRef.current = streamGroqResponse(
        historyForGroq,
        // onChunk
        (chunk) => appendToLastAssistant(chunk),
        // onDone
        (fullText) => {
          setIsStreaming(false);
          // Persist assistant message to Supabase
          if (user && activeSessionId && fullText) {
            supabase
              .from("chat_messages")
              .insert({
                session_id: activeSessionId,
                user_id: user.id,
                role: "assistant",
                content: fullText,
                severity: "low",
              })
              .then();
          }
        },
        // onError
        (err) => {
          console.error("Groq error:", err);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === "assistant" && last.content === "") {
              updated[updated.length - 1] = {
                ...last,
                content:
                  "⚠️ I couldn't connect to the AI service. Please try again, or call 108/112 for emergencies.",
                role: "error",
              };
            }
            return updated;
          });
          setIsStreaming(false);
        }
      );
    },
    [isStreaming, messages, addMessage, appendToLastAssistant, sessionId, user]
  );

  /** User chose "Continue to AI anyway" from the overlay */
  const handleContinueAfterFlag = useCallback(() => {
    const msg = pendingMessage;
    setRedFlag(null);
    setPendingMessage(null);
    if (msg) sendMessage(msg, true);
  }, [pendingMessage, sendMessage]);

  /** User dismissed the overlay (just close, don't send) */
  const handleDismissOverlay = useCallback(() => {
    setRedFlag(null);
    setPendingMessage(null);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClearChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setSessionId(null);
    setIsStreaming(false);
    setInput("");
    inputRef.current?.focus();
  };

  const charsLeft = MAX_CHARS - input.length;

  return (
    <>
      {/* Emergency Overlay */}
      {redFlag && (
        <EmergencyOverlay
          redFlag={redFlag}
          onDismiss={handleDismissOverlay}
          onContinue={handleContinueAfterFlag}
        />
      )}

      <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-3xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight">CareSetu AI Doctor</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-medium">
                  {isStreaming ? "Typing…" : "Online · Groq AI (Ultra Fast)"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Emergency shortcut */}
            <a
              href="tel:108"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>108</span>
            </a>

            {/* Clear chat */}
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Messages area ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-4 sm:px-6 py-6 space-y-5">
          {messages.length === 0 ? (
            <WelcomeScreen onPromptSelect={(text) => { setInput(text); inputRef.current?.focus(); }} />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </>
          )}

          {/* Sticky disclaimer when chat has started */}
          {messages.length > 0 && (
            <div className="flex justify-center pt-2">
              <p className="text-[10px] text-slate-400 text-center max-w-sm">
                ⚕️ AI advice is for general information only. Always consult a real doctor.
                For emergencies: <a href="tel:108" className="font-bold text-red-500">108</a> /{" "}
                <a href="tel:112" className="font-bold text-red-500">112</a>
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggested prompts strip (shown when chat is empty) ─────── */}
        {messages.length === 0 && (
          <div className="px-4 sm:px-6 pb-2 flex gap-2 overflow-x-auto flex-shrink-0 bg-slate-50/70 scrollbar-hide">
            {SUGGESTED_PROMPTS.slice(0, 4).map((p) => (
              <button
                key={p.label}
                onClick={() => { setInput(p.text); inputRef.current?.focus(); }}
                className="flex-shrink-0 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-700 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Input bar ────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms… (e.g. I have a fever and sore throat)"
                rows={1}
                className="w-full resize-none pl-4 pr-16 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50 placeholder:text-slate-400 transition-all max-h-32 overflow-y-auto leading-relaxed"
                style={{ minHeight: "48px" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
                }}
                disabled={isStreaming}
              />
              {/* Char count */}
              <span
                className={`absolute bottom-2.5 right-3 text-[10px] font-medium ${
                  charsLeft < 50 ? "text-red-500" : "text-slate-400"
                }`}
              >
                {charsLeft}
              </span>
            </div>

            {/* Voice input button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isStreaming}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-200"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
              title={isListening ? "Listening... click to stop" : "Speak symptoms"}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Send button */}
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-200 hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 transition-all flex-shrink-0"
              aria-label="Send message"
            >
              {isStreaming ? (
                <RotateCcw className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </button>
          </div>

          {/* Bottom hint */}
          <p className="text-[10px] text-slate-400 mt-1.5 pl-1">
            Press <kbd className="bg-slate-100 px-1 rounded text-[9px] font-mono">Enter</kbd> to send ·{" "}
            <kbd className="bg-slate-100 px-1 rounded text-[9px] font-mono">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </>
  );
}
