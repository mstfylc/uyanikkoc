/* Uyanık Koç mobil — uygulama kabuğu: alt menü, navigasyon, alt-ekranlar, Tweaks. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "rol": "Öğrenci",
  "cihaz": "iOS · Pro",
  "accent": "#534AB7",
  "font": "Plus Jakarta Sans",
  "radius": "Standart",
  "dark": false,
  "defaultLogin": "Telefon"
}/*EDITMODE-END*/;

const UK_RADIUS = { "Keskin": 0.5, "Standart": 1, "Yuvarlak": 1.5 };
// Mantıksal nokta/dp boyutları (CSS px) — gerçek cihazlarla birebir.
// iOS: durum çubuğu cihaz çerçevesinde absolute → app içte safe-top/bottom rezerve eder.
// Android: çerçeve durum + gezinme çubuğunu zaten sağlar → app içte küçük pay yeter.
const UK_DEVICES = {
  "iOS · SE":          { os: "ios", w: 375, h: 667, safeTop: 24, safeBottom: 14 },  // çentiksiz / home tuşu
  "iOS · Standart":    { os: "ios", w: 393, h: 852, safeTop: 56, safeBottom: 30 },  // iPhone 15/16
  "iOS · Pro":         { os: "ios", w: 402, h: 874, safeTop: 56, safeBottom: 30 },  // iPhone 16 Pro
  "iOS · Pro Max":     { os: "ios", w: 440, h: 956, safeTop: 60, safeBottom: 32 },  // iPhone 16 Pro Max
  "Android · Kompakt": { os: "android", w: 360, h: 800, safeTop: 8, safeBottom: 10 }, // Galaxy A / küçük
  "Android · Standart":{ os: "android", w: 412, h: 915, safeTop: 8, safeBottom: 10 }, // Pixel 8 / S24
  "Android · Büyük":   { os: "android", w: 432, h: 960, safeTop: 10, safeBottom: 12 }, // Pixel Pro / Ultra
};
function ukDevice(t) { return UK_DEVICES[t.cihaz] || UK_DEVICES["iOS · Pro"]; }
const UK_FONTS = {
  "Plus Jakarta Sans": '"Plus Jakarta Sans", -apple-system, sans-serif',
  "Manrope": '"Manrope", -apple-system, sans-serif',
  "Nunito": '"Nunito", -apple-system, sans-serif',
};
function tweakVars(t) {
  const font = UK_FONTS[t.font] || UK_FONTS["Plus Jakarta Sans"];
  const dev = ukDevice(t);
  return {
    "--primary": t.accent, "--rs": UK_RADIUS[t.radius] ?? 1, "--font": font, fontFamily: font,
    "--safe-top": dev.safeTop + "px", "--safe-bottom": dev.safeBottom + "px",
  };
}

function TabBar({ active, go, pendingCount }) {
  const tabs = [
    { id: "home", label: "Ana Sayfa", icon: "home" },
    { id: "odevler", label: "Ödevler", icon: "clipboard", count: pendingCount },
    { id: "denemeler", label: "Denemeler", icon: "chart" },
    { id: "program", label: "Program", icon: "calendar" },
    { id: "profil", label: "Profil", icon: "user" },
  ];
  return (
    <div className="uk-tabbar">
      {tabs.map((t) => (
        <button key={t.id} className={`uk-tab${active === t.id ? " on" : ""}`} onClick={() => go(t.id)}>
          {t.count ? <span className="tabcount">{t.count}</span> : null}
          <MIcon name={t.icon} size={24} fill={active === t.id} stroke={active === t.id ? 0 : 2} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function SubRouter({ sub, onBack }) {
  if (sub === "konu") return <KonuScreen onBack={onBack} />;
  if (sub === "kaynaklar") return <KaynaklarimScreen onBack={onBack} />;
  if (sub === "randevu") return <RandevularScreen onBack={onBack} />;
  if (sub === "mesaj") return <MesajScreen onBack={onBack} />;
  if (sub === "motivasyon") return <MotivasyonScreen onBack={onBack} />;
  if (sub === "destek") return <DestekScreen role="student" onBack={onBack} />;
  return null;
}

function MobileApp({ t, setTweak }) {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("home");
  const [sub, setSub] = useState(null);
  const [result, setResult] = useState(null);
  const dark = !!t.dark;
  const vars = tweakVars(t);

  const go = (x) => { setSub(null); setTab(x); };
  const openSub = (k) => setSub(k);
  const pendingCount = M_ODEVLER.filter((o) => o.week === "w0" && o.status !== "done").length;

  if (!authed) {
    return (
      <div className="uk-m" data-theme={dark ? "dark" : "light"} style={vars}>
        <LoginScreen defaultMode={t.defaultLogin === "E-posta" ? "email" : "phone"} onDone={() => { setAuthed(true); setTab("home"); setSub(null); }} />
      </div>
    );
  }

  return (
    <div className="uk-m" data-theme={dark ? "dark" : "light"} style={vars}>
      {t.rol === "Veli" ? (
        <ParentShell dark={dark} setDark={(v) => setTweak("dark", v)} onLogout={() => setAuthed(false)} />
      ) : t.rol === "Koç" ? (
        <CoachShell dark={dark} setDark={(v) => setTweak("dark", v)} onLogout={() => setAuthed(false)} />
      ) : (
        <div className="uk-screen" data-screen-label={sub || tab}>
          {sub ? (
            <SubRouter sub={sub} onBack={() => setSub(null)} />
          ) : (
            <>
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }} key={tab}>
                {tab === "home" && <HomeScreen go={go} openResult={setResult} openSub={openSub} />}
                {tab === "odevler" && <OdevlerScreen openResult={setResult} />}
                {tab === "denemeler" && <DenemelerScreen />}
                {tab === "program" && <ProgramScreen />}
                {tab === "profil" && <ProfilScreen onLogout={() => setAuthed(false)} dark={dark} setDark={(v) => setTweak("dark", v)} openSub={openSub} />}
              </div>
              <TabBar active={tab} go={go} pendingCount={pendingCount} />
            </>
          )}
          {result && <ResultSheet odev={result} onClose={() => setResult(null)} />}
        </div>
      )}
    </div>
  );
}

/* Root — cihaz çerçevesi + Tweaks paneli (panel çerçevenin DIŞINDA: fixed konumu doğru olsun) */
function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const wrapRef = useRef(null);
  const dev = ukDevice(t);
  const DeviceFrame = dev.os === "android" ? AndroidDevice : IOSDevice;

  useEffect(() => {
    function fit() {
      const w = wrapRef.current; if (!w) return;
      w.style.transform = "scale(1)";
      const r = w.getBoundingClientRect();
      const s = Math.min((window.innerWidth - 28) / r.width, (window.innerHeight - 24) / r.height, 1);
      w.style.transform = `scale(${s})`;
    }
    fit();
    window.addEventListener("resize", fit);
    const id1 = setTimeout(fit, 80); const id2 = setTimeout(fit, 350);
    return () => { window.removeEventListener("resize", fit); clearTimeout(id1); clearTimeout(id2); };
  }, [t.cihaz]);

  return (
    <>
      <div ref={wrapRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, transformOrigin: "center center" }}>
        <div className="caption">
          <span className="pill"><span className="dot"></span> Uyanık Koç · {t.rol} · {t.cihaz} ({dev.w}×{dev.h})</span>
          <div className="hint">Tweaks’ten <b>Cihaz</b>: iOS / Android boyutlarını dene · <b>Görünüm: Veli / Koç</b> · aksan/font/tema</div>
        </div>
        <DeviceFrame width={dev.w} height={dev.h} dark={!!t.dark}>
          <MobileApp t={t} setTweak={setTweak} />
        </DeviceFrame>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Rol" />
        <TweakRadio label="Görünüm" value={t.rol}
          options={["Öğrenci", "Veli", "Koç"]}
          onChange={(v) => setTweak("rol", v)} />
        <TweakSection label="Cihaz" />
        <TweakSelect label="Telefon boyutu" value={t.cihaz}
          options={["iOS · SE", "iOS · Standart", "iOS · Pro", "iOS · Pro Max", "Android · Kompakt", "Android · Standart", "Android · Büyük"]}
          onChange={(v) => setTweak("cihaz", v)} />
        <TweakSection label="Marka" />
        <TweakColor label="Aksan rengi" value={t.accent}
          options={["#534AB7", "#2A6FDB", "#1F8A5B", "#C2410C", "#9A3D7A"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSelect label="Yazı tipi" value={t.font}
          options={["Plus Jakarta Sans", "Manrope", "Nunito"]}
          onChange={(v) => setTweak("font", v)} />
        <TweakRadio label="Köşeler" value={t.radius}
          options={["Keskin", "Standart", "Yuvarlak"]}
          onChange={(v) => setTweak("radius", v)} />
        <TweakSection label="Görünüm & Akış" />
        <TweakToggle label="Koyu tema" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakRadio label="Varsayılan giriş" value={t.defaultLogin}
          options={["Telefon", "E-posta"]}
          onChange={(v) => setTweak("defaultLogin", v)} />
      </TweaksPanel>
    </>
  );
}

Object.assign(window, { MobileApp, TabBar, SubRouter, Root });
