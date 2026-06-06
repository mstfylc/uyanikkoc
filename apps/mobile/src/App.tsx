/* Uygulama kabuğu: auth kapısı + tab navigasyonu + sonuç sheet'i + tema. */
import { useRef, useState } from "react";
import { TabBar } from "./ui/TabBar";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { OdevlerScreen } from "./screens/OdevlerScreen";
import { DenemelerScreen } from "./screens/DenemelerScreen";
import { ProgramScreen } from "./screens/ProgramScreen";
import { ProfilScreen } from "./screens/ProfilScreen";
import { ResultSheet } from "./screens/ResultSheet";
import { ODEVLER } from "./mocks/student";
import type { Odev, TabId, ThemeMode } from "./types";

export function App() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<TabId>("home");
  const [result, setResult] = useState<Odev | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const go = (t: TabId) => {
    setTab(t);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const pendingCount = ODEVLER.filter((o) => o.week === "w0" && o.status !== "done").length;

  if (!authed) {
    return (
      <div className="uk-m" data-theme={theme}>
        <LoginScreen
          onDone={() => {
            setAuthed(true);
            setTab("home");
          }}
        />
      </div>
    );
  }

  return (
    <div className="uk-m" data-theme={theme}>
      <div className="uk-screen" data-screen-label={tab}>
        <div ref={scrollRef} style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }} key={tab}>
          {tab === "home" && <HomeScreen go={go} openResult={setResult} />}
          {tab === "odevler" && <OdevlerScreen openResult={setResult} />}
          {tab === "denemeler" && <DenemelerScreen />}
          {tab === "program" && <ProgramScreen />}
          {tab === "profil" && <ProfilScreen onLogout={() => setAuthed(false)} theme={theme} setTheme={setTheme} />}
        </div>
        <TabBar active={tab} go={go} pendingCount={pendingCount} />
        {result && <ResultSheet odev={result} onClose={() => setResult(null)} />}
      </div>
    </div>
  );
}
