"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Agent } from "@/components/Agent";

export default function HomePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className="container">
      <div className="header">
        <div className="row" style={{ alignItems: "center" }}>
          <div className="h1">AI Receptionist</div>
          <span className="badge">Voice-enabled</span>
        </div>
        <div className="subtle">Calm ? Professional ? Helpful</div>
      </div>

      <div className="card">
        <Agent />
      </div>

      <div className="footer">
        Tip: Allow microphone access for hands-free experience. Your data stays in-session.
      </div>
    </div>
  );
}
