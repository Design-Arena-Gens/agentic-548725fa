"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type DialogEvent, type DialogTurn, type Intent, newDialogManager } from "@/lib/agent/dialogManager";
import { speakText, useSpeechRecognition } from "@/lib/agent/voice";
import { format } from "date-fns";

export function Agent() {
  const managerRef = useRef(newDialogManager());
  const [turns, setTurns] = useState<DialogTurn[]>([{ role: "agent", text: managerRef.current.getOpeningLine() }]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognition = useSpeechRecognition({
    onResult: (text) => setInput(text),
    onEnd: () => setListening(false),
  });

  useEffect(() => {
    const first = turns[0];
    // Speak the opening line once.
    if (first?.role === "agent") {
      speak(first.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTurn = useCallback((t: DialogTurn) => setTurns((prev) => [...prev, t]), []);

  const speak = useCallback(async (text: string) => {
    setSpeaking(true);
    await speakText(text);
    setSpeaking(false);
  }, []);

  const handleEvent = useCallback(async (evt: DialogEvent) => {
    const out = await managerRef.current.handle(evt);
    if (!out) return;

    if (out.say) {
      addTurn({ role: "agent", text: out.say });
      await speak(out.say);
    }
  }, [addTurn, speak]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    addTurn({ role: "user", text });
    setInput("");

    await handleEvent({ type: "user_text", text });
  }, [addTurn, handleEvent]);

  const toggleMic = useCallback(() => {
    if (recognition.supported) {
      if (listening) {
        recognition.stop();
      } else {
        recognition.start();
        setListening(true);
      }
    }
  }, [recognition, listening]);

  return (
    <div className="col">
      <div className="chat" id="chatlog">
        {turns.map((t, i) => (
          <div key={i} className={`bubble ${t.role}`}>
            {t.text}
          </div>
        ))}
      </div>
      <div className="inputRow">
        <input
          className="input"
          placeholder="Speak or type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
        />
        <button className="button" onClick={() => send(input)} disabled={!input.trim()}>
          Send
        </button>
        <button className="button secondary" onClick={toggleMic} disabled={!recognition.supported}>
          {listening ? "Stop" : "Speak"}
        </button>
      </div>
      <div className="subtle" style={{ display: "flex", gap: 12 }}>
        <span className="badge">{recognition.supported ? "Mic ready" : "Mic unavailable"}</span>
        <span className="badge">{speaking ? "Speaking" : "Idle"}</span>
      </div>
    </div>
  );
}
