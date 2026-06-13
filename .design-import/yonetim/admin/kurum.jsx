/* ============================================================
   KURUM / FRANCHISE YÖNETİCİSİ (1/2)
   Dashboard · Koçlar · Öğrenciler
   activeOrg = getActiveOrg() (yönetilen kurum)
   ============================================================ */

/* deterministik koç/öğrenci listesi üret */
const _coachNames = ["Aslı Korkmaz", "Tolga Şen", "Merve Yıldız", "Can Aydın", "Pelin Demir", "Onur Kaya", "Sıla Arslan", "Berk Yılmaz", "Ece Çelik", "Kaan Doğan", "Nazlı Aksu", "Emir Polat"];
const _studentFirst = ["Elif", "Yusuf", "Zeynep", "Mert", "Defne", "Arda", "Ada", "Eymen", "Nehir", "Kuzey", "Asya", "Poyraz", "Mavi", "Ela", "Çınar", "Duru"];
const _studentLast = ["Yılmaz", "Demir", "Kaya", "Şahin", "Çelik", "Aydın", "Arslan", "Doğan", "Kara", "Koç", "Aksoy", "Polat"];
const _grades = ["12. Sınıf", "11. Sınıf", "Mezun", "10. Sınıf"];

function orgCoaches(org) {
  const out = [];
  let ci = 0;
  org.branches.forEach((b) => {
    for (let i = 0; i < b.coaches; i++) {
      const name = _coachNames[ci % _coachNames.length];
      const students = Math.round(b.students / b.coaches) + ((i % 2) ? 1 : -1);
      out.push({
        id: org.id + "-c" + ci, name, branch: b.name, branchId: b.id,
        students: Math.max(4, students), rating: (4.2 + ((ci * 7) % 8) / 10).toFixed(1),
        status: ci % 11 === 5 ? "trial" : "active", load: Math.min(100, 55 + ((ci * 13) % 45)),
      });
      ci++;
    }
  });
  return out;
}
function orgStudents(org) {
  const out = [];
  const coaches = orgCoaches(org);
  let si = 0;
  org.branches.forEach((b) => {
    for (let i = 0; i < b.students; i++) {
      const fn = _studentFirst[si % _studentFirst.length];
      const ln = _studentLast[(si * 3) % _studentLast.length];
      const coach = coaches.filter((c) => c.branchId === b.id)[i % b.coaches] || coaches[0];
      out.push({
        id: org.id + "-s" + si, name: fn + " " + ln, grade: _grades[si % _grades.length],
        branch: b.name, coach: coach ? coach.name : "—",
        net: 60 + ((si * 11) % 70) + (si % 3) * 5, attend: 70 + ((si * 7) % 30),
        status: si % 17 === 3 ? "risk" : "active",
      });
      si++;
    }
  });
  return out;
}

/* ---- Kurum Dashboard ---- */
function KurumDashboard({ goto }) {
  const a = useAdmin();
  const o = getActiveOrg();
  const coaches = orgCoaches(o);
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0);
  const avgNet = 96; // örnek kurum geneli ortalama net
  const trend = [142, 151, 148, 163, 159, 172, 168, 181, 178, 190, 186, 198];
  const dl = daysLeft(o.renewsAt);

  return (
    <div className="stack rise">
      <PageHead title={`Merhaba, ${o.owner.name.split(" ")[0]} 👋`} sub={`${o.name} · ${o.type === "franchise" ? o.branches.length + " şube" : "tek kurum"} · ${o.city}`}
        actions={<><button className="btn btn-light" onClick={() => downloadCSV("kurum-ozet.csv", [["Metrik", "Değer"], ["Öğrenci", o.seats.used], ["Koç", o.coaches.used], ["Aylık tahsilat", totalCollect]])}><Icon name="download" size={16} />Rapor indir</button>
          <button className="btn btn-primary" onClick={() => goto("k-koclar")}><Icon name="users" size={16} />Ekibi yönet</button></>} />

      {(o.status === "expiring" || o.status === "overdue" || o.status === "trial") ? (
        <div className={`alert-strip ${o.status === "overdue" ? "danger" : "warn"}`}>
          <span className="as-ic"><Icon name={o.status === "overdue" ? "alert" : "clock"} size={18} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13.5 }}>{o.status === "overdue" ? "Lisans ödemeniz gecikti" : o.status === "trial" ? "Deneme sürümündesiniz" : "Lisansınızın süresi yakında doluyor"}</b>
            <div className="muted" style={{ fontSize: 12.5 }}>{dl < 0 ? `${-dl} gün önce sona erdi.` : `${dl} gün kaldı.`} {o.status === "trial" ? "Kesintisiz devam için planınızı etkinleştirin." : "Kesinti yaşamamak için yenileyin."}</div>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => goto("k-lisans")}>Lisansı yönet<Icon name="chevronRight" size={15} /></button>
        </div>
      ) : null}

      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={o.seats.used} label="Aktif öğrenci" delta={`${o.seats.total - o.seats.used} koltuk boş`} deltaDir="up" />
        <StatCard icon="users" tone="info" value={o.coaches.used} label="Koç" delta={`${o.coaches.total} kapasite`} deltaDir="flat" />
        <StatCard icon="banknote" tone="success" value={TRY(totalCollect)} label="Aylık tahsilat" delta="+%6,2" deltaDir="up" />
        <StatCard icon="target" tone="warning" value={avgNet} label="Ortalama net (TYT)" delta="+4,1" deltaDir="up" />
      </div>

      <div className="grid col-main">
        <Section title="Öğrenci & gelir gelişimi" sub="Son 12 ay" action={<span className="badge badge-success"><Icon name="trend" size={13} />Büyüyor</span>}>
          <div className="card-body">
            <Sparkline data={trend} w={640} h={120} color={o.tone} />
          </div>
        </Section>
        <Section title="Lisans kullanımı" action={<button className="link-btn" onClick={() => goto("k-lisans")}>Detay</button>}>
          <div className="card-body" style={{ gap: 16, display: "flex", flexDirection: "column" }}>
            <Meter icon="cap" label="Öğrenci koltuğu" used={o.seats.used} total={o.seats.total} />
            <Meter icon="users" label="Koç" used={o.coaches.used} total={o.coaches.total} />
            {o.type === "franchise" ? <Meter icon="building" label="Şube" used={o.branches.length} total={orgPlanById(o.planId).branches} /> : null}
            <div className="between" style={{ paddingTop: 6, borderTop: "1px solid var(--border)" }}><span className="muted" style={{ fontSize: 12.5 }}>Sonraki yenileme</span><b className="tnum" style={{ fontSize: 13 }}>{fmtShort(o.renewsAt)}</b></div>
          </div>
        </Section>
      </div>

      <div className="grid col-main">
        {o.type === "franchise" ? (
          <Section title="Şube karşılaştırması" sub="Aylık tahsilat" action={<button className="link-btn" onClick={() => goto("k-subeler")}>Şubeler</button>}>
            <div className="card-body"><RankBars items={o.branches.map((b) => ({ l: b.name, v: b.collect }))} fmt={(v) => TRY(v)} color={o.tone} /></div>
          </Section>
        ) : (
          <Section title="En iyi koçlar" sub="Öğrenci memnuniyeti">
            <div className="card-body"><RankBars items={coaches.slice(0, 5).map((c) => ({ l: c.name, v: parseFloat(c.rating) }))} max={5} fmt={(v) => "★ " + v} color={o.tone} /></div>
          </Section>
        )}
        <Section title="Öne çıkan koçlar" action={<button className="link-btn" onClick={() => goto("k-koclar")}>Tümü</button>}>
          <div className="card-body" style={{ padding: 0 }}>
            {coaches.slice(0, 5).map((c) => (
              <div key={c.id} className="list-row">
                <Avatar name={c.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 13.5, display: "block" }}>{c.name}</b><span className="muted" style={{ fontSize: 12 }}>{c.branch} · {c.students} öğrenci</span></div>
                <span className="badge badge-warning" style={{ height: 22 }}><Icon name="star" size={12} fill />{c.rating}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ---- Koçlar ---- */
function KurumCoaches() {
  const o = getActiveOrg();
  const coaches = orgCoaches(o);
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const list = coaches.filter((c) => (branch === "all" || c.branchId === branch) && c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="stack rise">
      <PageHead title="Koçlar" sub={`${coaches.length} koç · ${o.coaches.total} kapasite`}
        actions={<><button className="btn btn-light" onClick={() => downloadCSV("koclar.csv", [["Koç", "Şube", "Öğrenci", "Puan", "Doluluk"], ...coaches.map((c) => [c.name, c.branch, c.students, c.rating, c.load + "%"])])}><Icon name="download" size={16} />Dışa aktar</button>
          <button className="btn btn-primary"><Icon name="plus" size={16} />Koç davet et</button></>} />

      <div className="grid g-3">
        <StatCard icon="users" tone="primary" value={coaches.length} label="Toplam koç" />
        <StatCard icon="star" tone="warning" value={(coaches.reduce((s, c) => s + parseFloat(c.rating), 0) / coaches.length).toFixed(1)} label="Ortalama puan" />
        <StatCard icon="cap" tone="success" value={Math.round(coaches.reduce((s, c) => s + c.students, 0) / coaches.length)} label="Koç başına öğrenci" />
      </div>

      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        {o.type === "franchise" ? (
          <div className="seg" style={{ flexWrap: "wrap" }}>
            <button className={branch === "all" ? "on" : ""} onClick={() => setBranch("all")}>Tüm şubeler</button>
            {o.branches.map((b) => <button key={b.id} className={branch === b.id ? "on" : ""} onClick={() => setBranch(b.id)}>{b.name.replace(" Şubesi", "")}</button>)}
          </div>
        ) : <div />}
        <div className="searchbox" style={{ maxWidth: 260 }}><Icon name="search" size={17} /><input placeholder="Koç ara..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>

      <Section>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 720 }}>
            <thead><tr><th>Koç</th>{o.type === "franchise" ? <th>Şube</th> : null}<th>Öğrenci</th><th>Puan</th><th>Doluluk</th><th>Durum</th><th></th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td><div className="name"><Avatar name={c.name} size={34} /><div><b>{c.name}</b><span>Koç</span></div></div></td>
                  {o.type === "franchise" ? <td><span className="muted" style={{ fontSize: 12.5 }}>{c.branch}</span></td> : null}
                  <td><span className="tnum" style={{ fontWeight: 700 }}>{c.students}</span></td>
                  <td><span className="badge badge-warning" style={{ height: 22 }}><Icon name="star" size={12} fill />{c.rating}</span></td>
                  <td style={{ minWidth: 120 }}><div className="meter-bar" style={{ width: 100 }}><span style={{ width: c.load + "%", background: c.load > 90 ? "var(--danger)" : c.load > 75 ? "var(--warning)" : "var(--success)" }} /></div></td>
                  <td><StatusBadge status={c.status} sm /></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-light btn-sm" onClick={() => toast(c.name + " · öğrenci atama paneli", { icon: "users" })}>Öğrenci ata</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      {list.length === 0 ? <EmptyState icon="users" title="Koç bulunamadı" /> : null}
    </div>
  );
}

/* ---- Öğrenciler ---- */
function KurumStudents() {
  const o = getActiveOrg();
  const students = orgStudents(o);
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [page, setPage] = useState(0);
  const per = 12;
  const filtered = students.filter((s) => (branch === "all" || s.branch === o.branches.find((b) => b.id === branch)?.name) && s.name.toLowerCase().includes(q.toLowerCase()));
  const pages = Math.ceil(filtered.length / per);
  const shown = filtered.slice(page * per, page * per + per);
  const risk = students.filter((s) => s.status === "risk").length;

  return (
    <div className="stack rise">
      <PageHead title="Öğrenciler" sub={`${students.length} öğrenci · ${o.seats.total - students.length} koltuk boş`}
        actions={<><button className="btn btn-light" onClick={() => downloadCSV("ogrenciler.csv", [["Öğrenci", "Sınıf", "Şube", "Koç", "Net", "Devam"], ...students.map((s) => [s.name, s.grade, s.branch, s.coach, s.net, s.attend + "%"])])}><Icon name="download" size={16} />Dışa aktar</button>
          <button className="btn btn-primary"><Icon name="plus" size={16} />Öğrenci ekle</button></>} />

      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={students.length} label="Toplam öğrenci" />
        <StatCard icon="target" tone="success" value={Math.round(students.reduce((s, x) => s + x.net, 0) / students.length)} label="Ortalama net" />
        <StatCard icon="checkCircle" tone="info" value={"%" + Math.round(students.reduce((s, x) => s + x.attend, 0) / students.length)} label="Ortalama devam" />
        <StatCard icon="alert" tone="danger" value={risk} label="Risk altında" />
      </div>

      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        {o.type === "franchise" ? (
          <div className="seg" style={{ flexWrap: "wrap" }}>
            <button className={branch === "all" ? "on" : ""} onClick={() => { setBranch("all"); setPage(0); }}>Tümü</button>
            {o.branches.map((b) => <button key={b.id} className={branch === b.id ? "on" : ""} onClick={() => { setBranch(b.id); setPage(0); }}>{b.name.replace(" Şubesi", "")}</button>)}
          </div>
        ) : <div />}
        <div className="searchbox" style={{ maxWidth: 260 }}><Icon name="search" size={17} /><input placeholder="Öğrenci ara..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
      </div>

      <Section>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 760 }}>
            <thead><tr><th>Öğrenci</th><th>Sınıf</th>{o.type === "franchise" ? <th>Şube</th> : null}<th>Koç</th><th>Net</th><th>Devam</th><th></th></tr></thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id}>
                  <td><div className="name"><Avatar name={s.name} size={34} /><div><b>{s.name}{s.status === "risk" ? <span className="badge badge-danger" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Risk</span> : null}</b><span>Öğrenci</span></div></div></td>
                  <td><span className="muted" style={{ fontSize: 12.5 }}>{s.grade}</span></td>
                  {o.type === "franchise" ? <td><span className="muted" style={{ fontSize: 12.5 }}>{s.branch.replace(" Şubesi", "")}</span></td> : null}
                  <td><span style={{ fontSize: 12.5 }}>{s.coach}</span></td>
                  <td><span className="tnum" style={{ fontWeight: 700 }}>{s.net}</span></td>
                  <td><span className="tnum" style={{ color: s.attend < 80 ? "var(--warning)" : "var(--text-2)" }}>%{s.attend}</span></td>
                  <td style={{ textAlign: "right" }}><button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => toast(s.name + " profili", { icon: "cap" })}><Icon name="chevronRight" size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 ? (
          <div className="between" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
            <span className="muted" style={{ fontSize: 12.5 }}>{filtered.length} öğrenci · sayfa {page + 1}/{pages}</span>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn btn-light btn-sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Önceki</button>
              <button className="btn btn-light btn-sm" disabled={page >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}>Sonraki</button>
            </div>
          </div>
        ) : null}
      </Section>
    </div>
  );
}

Object.assign(window, { KurumDashboard, KurumCoaches, KurumStudents, orgCoaches, orgStudents });
