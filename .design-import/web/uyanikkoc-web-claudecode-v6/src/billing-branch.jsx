/* B2B — Şube Gelir & Tahsilat paneli (koç/şube görünümü).
   Öğrenci aboneliklerinden gelen tahsilat, gecikenler, platform ücreti. */

const SUBE_ABONELER = [
  { ad: "Elif Yıldız", veli: "Ayşe Yıldız", planId: "plus", cycle: "annual", durum: "paid", next: 279, tutar: 22990 },
  { ad: "Mert Demir", veli: "Hakan Demir", planId: "standart", cycle: "monthly", durum: "paid", next: 12, tutar: 1499 },
  { ad: "Zeynep Kaya", veli: "Sevgi Kaya", planId: "plus", cycle: "monthly", durum: "pending", next: 2, tutar: 2299 },
  { ad: "Can Aydın", veli: "Murat Aydın", planId: "vip", cycle: "annual", durum: "paid", next: 154, tutar: 34990 },
  { ad: "Ece Şahin", veli: "Deniz Şahin", planId: "standart", cycle: "monthly", durum: "failed", next: -3, tutar: 1499 },
  { ad: "Burak Çelik", veli: "Aslı Çelik", planId: "plus", cycle: "monthly", durum: "paid", next: 19, tutar: 2299 },
  { ad: "Selin Arslan", veli: "Tülay Arslan", planId: "standart", cycle: "annual", durum: "paid", next: 88, tutar: 14990 },
  { ad: "Kaan Yılmaz", veli: "Erol Yılmaz", planId: "vip", cycle: "monthly", durum: "pending", next: 1, tutar: 3499 },
];

/* aylık tekrarlı gelir (yıllığı 12'ye böl) */
function mrrOf(a) { const p = planById(a.planId); return a.cycle === "annual" ? Math.round(p.annual / 12) : p.monthly; }

const REV_TREND = [
  { ay: "Eki", v: 38200 }, { ay: "Kas", v: 41600 }, { ay: "Ara", v: 44900 },
  { ay: "Oca", v: 47300 }, { ay: "Şub", v: 49100 }, { ay: "Mar", v: 52800 },
];

function BranchRevenuePage() {
  const aboneler = SUBE_ABONELER;
  const mrr = aboneler.filter((a) => a.durum !== "failed").reduce((s, a) => s + mrrOf(a), 0);
  const aktif = aboneler.filter((a) => a.durum === "paid").length;
  const geciken = aboneler.filter((a) => a.durum === "failed" || a.durum === "pending");
  const gecikenTutar = geciken.reduce((s, a) => s + mrrOf(a), 0);
  const platformUcret = 4990; // şube aylık platform ücreti
  const maxV = Math.max(...REV_TREND.map((r) => r.v));
  const [filter, setFilter] = useState("all");

  const list = filter === "all" ? aboneler : filter === "due" ? geciken : aboneler.filter((a) => a.durum === "paid");
  const [reminded, setReminded] = useState(() => new Set());
  const exportCsv = () => {
    const rows = [["Öğrenci", "Veli", "Plan", "Dönem", "Aylık", "Durum", "Sonraki"]];
    aboneler.forEach((a) => rows.push([a.ad, a.veli, planById(a.planId).name, a.cycle === "annual" ? "Yıllık" : "Aylık", mrrOf(a), a.durum === "paid" ? "Ödendi" : a.durum === "pending" ? "Bekliyor" : "Başarısız", a.next < 0 ? (-a.next) + " gün gecikti" : a.next + " gün"]));
    downloadCSV("sube-tahsilat.csv", rows); toast("Tahsilat listesi indirildi", { icon: "download" });
  };

  return (
    <div className="stack rise">
      <PageHead title="Gelir & Tahsilat" sub="Şubenin abonelik geliri, tahsilat durumu ve platform ücreti" actions={
        <button className="btn btn-light" onClick={exportCsv}><Icon name="download" size={16} />Dışa aktar</button>
      } />

      <div className="grid g-4">
        <StatCard icon="banknote" tone="primary" value={TRY(mrr)} label="Aylık tekrarlı gelir" delta="+%7,1" deltaDir="up" sub="geçen aya göre" anim />
        <StatCard icon="users" tone="success" value={aktif + "/" + aboneler.length} label="Aktif abonelik" sub="tahsilatı tamam" />
        <StatCard icon="alert" tone="warning" value={TRY(gecikenTutar)} label="Bekleyen tahsilat" sub={geciken.length + " öğrenci"} />
        <StatCard icon="building" tone="info" value={TRY(platformUcret)} label="Platform ücreti" sub="aylık · şube" />
      </div>

      <div className="rev-split">
        <Section title="Aylık Gelir Trendi" sub="Son 6 ay · şube toplam tahsilatı" className="rev-chart-card">
          <div className="card-body">
            <div className="rev-bars">
              {REV_TREND.map((r, i) => (
                <div key={r.ay} className="rev-bar-col">
                  <div className="rev-bar-wrap">
                    <span className="rev-bar-val tnum">{Math.round(r.v / 1000)}B</span>
                    <div className="rev-bar" style={{ height: `${(r.v / maxV) * 100}%`, background: i === REV_TREND.length - 1 ? "var(--primary)" : "var(--primary-soft)", "--bc": i === REV_TREND.length - 1 ? "#fff" : "var(--primary-600)" }} />
                  </div>
                  <span className="rev-bar-ay muted">{r.ay}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Platform Aboneliği" sub="Şubenin Uyanık Koç kullanım planı" className="rev-platform-card">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div className="plat-plan">
              <span className="badge badge-info" style={{ height: 22 }}>Kurumsal</span>
              <div className="row" style={{ gap: 6, marginTop: 8 }}><b style={{ fontSize: 19, fontWeight: 800 }} className="tnum">{TRY(platformUcret)}</b><span className="muted" style={{ fontSize: 12 }}>/ay · 50 öğrenciye kadar</span></div>
            </div>
            <div className="plat-rows">
              <div className="plat-row"><span className="muted">Kullanım</span><b>{aboneler.length} / 50 öğrenci</b></div>
              <div className="plat-meter"><span style={{ width: `${(aboneler.length / 50) * 100}%` }} /></div>
              <div className="plat-row"><span className="muted">Sonraki ödeme</span><b>1 Temmuz 2026</b></div>
              <div className="plat-row"><span className="muted">Ödeme yöntemi</span><b className="row" style={{ gap: 6 }}><CardBrandBadge brand="mastercard" size="sm" /> •5571</b></div>
            </div>
            <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => toast("Kapasite yükseltme talebin alındı — ekibimiz seninle iletişime geçecek", { icon: "building" })}><Icon name="arrowUp" size={15} />Kapasiteyi yükselt</button>
          </div>
        </Section>
      </div>

      <Section
        title="Öğrenci Tahsilatları"
        sub="Abonelik bazında tahsilat durumu"
        action={
          <div className="seg" style={{ width: "fit-content" }}>
            <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tümü</button>
            <button className={filter === "paid" ? "on" : ""} onClick={() => setFilter("paid")}>Ödendi</button>
            <button className={filter === "due" ? "on" : ""} onClick={() => setFilter("due")}>Bekleyen</button>
          </div>
        }
      >
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 680 }}>
            <thead><tr><th>Öğrenci</th><th>Veli</th><th>Plan</th><th style={{ textAlign: "right" }}>Aylık</th><th style={{ textAlign: "center" }}>Sonraki</th><th style={{ textAlign: "center" }}>Durum</th><th></th></tr></thead>
            <tbody>
              {list.map((a) => {
                const p = planById(a.planId);
                const st = a.durum === "paid" ? ["success", "Ödendi"] : a.durum === "pending" ? ["warning", "Yaklaşıyor"] : ["danger", "Başarısız"];
                const overdue = a.next < 0;
                return (
                  <tr key={a.ad}>
                    <td><div className="row" style={{ gap: 9 }}><Avatar name={a.ad} size={30} /><b style={{ fontSize: 13, fontWeight: 700 }}>{a.ad}</b></div></td>
                    <td><span className="muted" style={{ fontSize: 12.5 }}>{a.veli}</span></td>
                    <td><div className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: p.color }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</span><span className="muted" style={{ fontSize: 11 }}>{a.cycle === "annual" ? "Yıllık" : "Aylık"}</span></div></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(mrrOf(a))}</span></td>
                    <td style={{ textAlign: "center" }}><span className="tnum" style={{ fontSize: 12.5, color: overdue ? "var(--danger)" : "var(--muted)", fontWeight: overdue ? 700 : 500 }}>{overdue ? `${-a.next} gün gecikti` : `${a.next} gün`}</span></td>
                    <td style={{ textAlign: "center" }}><span className={`badge badge-${st[0]}`} style={{ height: 22 }}>{st[1]}</span></td>
                    <td style={{ textAlign: "right" }}>{a.durum !== "paid" ? <button className="btn btn-light btn-sm" disabled={reminded.has(a.ad)} style={reminded.has(a.ad) ? { opacity: .6 } : null} onClick={() => { setReminded((s) => { const n = new Set(s); n.add(a.ad); return n; }); toast(a.ad + " için ödeme hatırlatması gönderildi", { icon: "send" }); }}><Icon name={reminded.has(a.ad) ? "check" : "send"} size={14} />{reminded.has(a.ad) ? "Hatırlatıldı" : "Hatırlat"}</button> : <button className="icon-btn" style={{ width: 32, height: 32 }} title="Makbuz" aria-label="Makbuz" onClick={() => { downloadText("makbuz-" + a.ad.replace(/\s/g, "-") + ".txt", ["UYANIK KOÇ — TAHSİLAT MAKBUZU", "", "Öğrenci: " + a.ad, "Veli: " + a.veli, "Plan: " + planById(a.planId).name, "Aylık tutar: " + TRY(mrrOf(a)), "Durum: Ödendi"].join("\n")); toast("Makbuz indirildi", { icon: "download" }); }}><Icon name="receipt" size={16} /></button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

Object.assign(window, { BranchRevenuePage });
