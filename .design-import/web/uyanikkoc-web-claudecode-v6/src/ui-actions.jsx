/* Paylaşılan aksiyon yardımcıları — toast bildirimleri + dosya indirme.
   Butonlara gerçek geri bildirim ve çıktı sağlar. */

/* ---- toast ---- */
function toast(msg, opts = {}) {
  window.dispatchEvent(new CustomEvent("uk-toast", { detail: { msg, icon: opts.icon || "check", tone: opts.tone || "success", id: Date.now() + Math.random() } }));
}

function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const onToast = (e) => {
      const t = e.detail;
      setItems((p) => [...p, t]);
      setTimeout(() => setItems((p) => p.filter((x) => x.id !== t.id)), 3200);
    };
    window.addEventListener("uk-toast", onToast);
    return () => window.removeEventListener("uk-toast", onToast);
  }, []);
  if (items.length === 0) return null;
  return ReactDOM.createPortal((
    <div className="toast-host">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          <span className="toast-ic"><Icon name={t.icon} size={16} stroke={2.5} /></span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  ), document.body);
}

/* ---- dosya indirme ----
   Üretimde (gerçek site) klasik <a download> indirmesi çalışır. Ancak önizleme
   gibi sandbox'lı/cross-origin iframe'lerde tarayıcı indirmeyi sessizce engeller.
   Bu yüzden çok katmanlı bir geri-dönüş kullanıyoruz:
   1) normal indirme dene → 2) iframe ise yeni sekmede aç → 3) o da engellenirse
   içeriği kopyalanabilir bir pencerede göster. Böylece her ortamda gerçek çıktı alınır. */
function _inIframe() { try { return window.self !== window.top; } catch (e) { return true; } }
function _nativeDownload(url, filename) {
  try {
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { try { document.body.removeChild(a); } catch (e) {} }, 100);
    return true;
  } catch (e) { return false; }
}
function _downloadFallbackModal(filename, text) {
  const ex = document.getElementById("uk-dl-modal"); if (ex) ex.remove();
  const ov = document.createElement("div");
  ov.id = "uk-dl-modal";
  ov.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(17,20,45,.55);display:flex;align-items:center;justify-content:center;padding:24px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;";
  const card = document.createElement("div");
  card.style.cssText = "background:#fff;color:#1a1d33;width:min(720px,100%);max-height:82vh;display:flex;flex-direction:column;border-radius:16px;box-shadow:0 30px 80px rgba(10,12,30,.45);overflow:hidden;";
  const head = document.createElement("div");
  head.style.cssText = "padding:18px 22px;border-bottom:1px solid #ececf3;display:flex;align-items:center;gap:12px;";
  head.innerHTML = '<div style="flex:1;min-width:0"><div style="font-weight:800;font-size:16px">İndirilecek dosya: ' + filename + '</div><div style="font-size:12.5px;color:#6b6f88;margin-top:2px">Önizleme penceresi otomatik indirmeyi engelledi. İçeriği kopyalayın veya “İndir”e tekrar basın.</div></div>';
  const body = document.createElement("div");
  body.style.cssText = "padding:16px 22px;overflow:auto;";
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.readOnly = true;
  ta.style.cssText = "width:100%;height:340px;border:1px solid #e1e2ec;border-radius:10px;padding:12px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;resize:vertical;background:#fbfbfe;color:#22253d;";
  body.appendChild(ta);
  const foot = document.createElement("div");
  foot.style.cssText = "padding:14px 22px;border-top:1px solid #ececf3;display:flex;gap:10px;justify-content:flex-end;";
  const mkBtn = (label, primary) => { const b = document.createElement("button"); b.textContent = label; b.style.cssText = "border:0;border-radius:10px;padding:10px 16px;font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit;" + (primary ? "background:#534AB7;color:#fff;" : "background:#ececf5;color:#3a3d57;"); return b; };
  const copyBtn = mkBtn("Kopyala", false);
  copyBtn.onclick = () => { ta.select(); try { document.execCommand("copy"); } catch (e) {} try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) {} copyBtn.textContent = "Kopyalandı ✓"; setTimeout(() => copyBtn.textContent = "Kopyala", 1600); };
  const dlBtn = mkBtn("Yeni sekmede aç", false);
  dlBtn.onclick = () => { const u = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })); window.open(u, "_blank"); };
  const closeBtn = mkBtn("Kapat", true);
  closeBtn.onclick = () => ov.remove();
  foot.appendChild(copyBtn); foot.appendChild(dlBtn); foot.appendChild(closeBtn);
  card.appendChild(head); card.appendChild(body); card.appendChild(foot);
  ov.appendChild(card);
  ov.addEventListener("mousedown", (e) => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
  setTimeout(() => ta.select(), 60);
}
function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  if (!_inIframe()) {
    _nativeDownload(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  // iframe (önizleme): önce yeni sekmede açmayı dene, o da engellenirse modal göster
  let win = null;
  try { win = window.open(url, "_blank"); } catch (e) { win = null; }
  if (win) {
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }
  // popup engellendi → içeriği oku ve kopyalanabilir pencerede göster
  try {
    blob.text().then((txt) => _downloadFallbackModal(filename, txt));
  } catch (e) {
    // çok eski tarayıcı: FileReader
    const fr = new FileReader();
    fr.onload = () => _downloadFallbackModal(filename, fr.result);
    fr.readAsText(blob);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function downloadText(filename, content, mime = "text/plain;charset=utf-8") {
  downloadBlob(filename, new Blob(["\uFEFF" + content], { type: mime }));
}
function downloadCSV(filename, rows) {
  const esc = (v) => {
    const s = String(v == null ? "" : v);
    return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = rows.map((r) => r.map(esc).join(";")).join("\r\n");
  downloadText(filename, csv, "text/csv;charset=utf-8");
}

Object.assign(window, { toast, ToastHost, downloadText, downloadCSV, downloadBlob });
