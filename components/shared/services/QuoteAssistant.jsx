"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Send, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * QuoteAssistant
 * Conversational AI mode for logistics / security quote forms.
 *
 * Props:
 *  - serviceType: 'logistics' | 'security'
 *  - onFormData: (data: object) => void   — called when collection is complete
 *  - onCancel: () => void                 — switch back to manual form
 */
export function QuoteAssistant({ serviceType, onFormData, onCancel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const started = useRef(false);

  // Kick off the conversation on mount
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    sendMessage(null); // empty first message — Claude opens the conversation
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (userText) => {
    const newMessages = userText
      ? [...messages, { role: "user", content: userText }]
      : messages;

    if (userText) {
      setMessages(newMessages);
      setInput("");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quotes/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceType, messages: newMessages }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Something went wrong. Please try again.");
        return;
      }

      const withAssistant = [
        ...newMessages,
        { role: "assistant", content: json.reply },
      ];
      setMessages(withAssistant);

      if (json.isComplete && json.formData) {
        setDone(true);
        setTimeout(() => onFormData(json.formData), 800);
      }
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || done) return;
    sendMessage(text);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-violet-100 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-500">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Pencil className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Quote Assistant</p>
            <p className="text-[10px] text-violet-200">
              Tell me what you need — I'll fill the form for you
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-[11px] text-violet-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Manual form
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[320px] max-h-[420px]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Pencil className="h-3 w-3 text-violet-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-violet-600 text-white rounded-br-sm"
                  : "bg-gray-50 text-gray-700 border border-gray-100 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center mr-2 mt-1 shrink-0">
              <Pencil className="h-3 w-3 text-violet-600" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {done && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-[12px] text-emerald-700 font-medium">
              Form pre-filled! Switching you to the review step…
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-gray-50/50"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={done ? "Form filled — review below" : "Type your reply…"}
          disabled={loading || done}
          className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || loading || done}
          className="h-9 w-9 shrink-0 bg-violet-600 hover:bg-violet-700 rounded-xl"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
