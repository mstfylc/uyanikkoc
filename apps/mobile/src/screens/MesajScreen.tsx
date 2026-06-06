/* MESAJLAŞMA — koç ile sohbet. */
import { useEffect, useRef, useState } from "react";
import { MIcon } from "../ui/MIcon";
import { MESSAGES, STUDENT } from "../mocks/student";
import type { ChatMessage } from "../types";

export function MesajScreen({ onBack }: { onBack: () => void }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>(MESSAGES);
  const [val, setVal] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = () => {
    const t = val.trim();
    if (!t) return;
    setMsgs((prev) => [...prev, { from: "me", text: t, time: "09:24" }]);
    setVal("");
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  });

  return (
    <div className="uk-screen" style={{ position: "absolute", inset: 0 }}>
      <div className="uk-safe-top" />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "2px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}>
          <MIcon name="chevronLeft" size={20} />
        </button>
        <span className="uk-avatar" style={{ width: 40, height: 40, fontSize: 14, background: "linear-gradient(140deg,#8E87D6,#463DA6)" }}>
          DE
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{STUDENT.coach}</div>
          <div style={{ fontSize: 11.5, color: "var(--success)", fontWeight: 700 }}>● Çevrimiçi</div>
        </div>
      </div>

      <div className="uk-scroll" ref={scrollRef} style={{ padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "78%",
                padding: "10px 13px",
                borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.from === "me" ? "var(--primary)" : "var(--surface)",
                color: m.from === "me" ? "#fff" : "var(--text)",
                border: m.from === "me" ? "none" : "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {m.text}
              <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, opacity: 0.6, textAlign: "right" }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "10px 16px calc(16px + env(safe-area-inset-bottom))",
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div className="uk-inputwrap" style={{ flex: 1, height: 48 }}>
          <input
            placeholder="Mesaj yaz…"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            style={{ fontSize: 14 }}
          />
        </div>
        <button
          className="uk-iconbtn"
          style={{ width: 48, height: 48, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 14 }}
          onClick={send}
        >
          <MIcon name="send" size={19} />
        </button>
      </div>
    </div>
  );
}
