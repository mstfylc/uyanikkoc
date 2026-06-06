/* Uygulama kabuğu: oturum kapısı + tab navigasyonu + sonuç sheet'i + tema. */
import { useRef, useState } from "react";
import { useSession } from "./lib/session";
import { TabBar } from "./ui/TabBar";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { OdevlerScreen } from "./screens/OdevlerScreen";
import { DenemelerScreen } from "./screens/DenemelerScreen";
import { ProgramScreen } from "./screens/ProgramScreen";
import { ProfilScreen } from "./screens/ProfilScreen";
import { ResultSheet } from "./screens/ResultSheet";
import { Splash } from "./ui/Splash";
import type { Odev, TabId, ThemeMode } from "./types";

export function App() {
  const { status, me } = useSession();
  const [tab, setTab] = useState<TabId>("home");
  const [result, setResult] = useState<Odev | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [odevRev, setOdevRev] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const go = (t: TabId) => {
    setTab(t);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const pendingCount = me?.counts.pendingOdev ?? 0;

  if (status === "loading") {
    return (
      <div className="uk-m" data-theme={theme}>
        <Splash />
      </div>
    );
  }

  if (status === "anon") {
    return (
      <div className="uk-m" data-theme={theme}>
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="uk-m" data-theme={theme}>
      <div className="uk-screen" data-screen-label={tab}>
        <div ref={scrollRef} style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }} key={tab}>
          {tab === "home" && <HomeScreen go={go} openResult={setResult} />}
          {tab === "odevler" && <OdevlerScreen openResult={setResult} rev={odevRev} />}
          {tab === "denemeler" && <DenemelerScreen />}
          {tab === "program" && <ProgramScreen />}
          {tab === "profil" && <ProfilScreen theme={theme} setTheme={setTheme} />}
        </div>
        <TabBar active={tab} go={go} pendingCount={pendingCount} />
        {result && <ResultSheet odev={result} onClose={() => setResult(null)} onSaved={() => setOdevRev((r) => r + 1)} />}
      </div>
    </div>
  );
}
