/* Envanter & Testler — psikolojik/yetenek testleri. Koç gönderir, öğrenci çözer,
   koç sonucu görüp not alır. localStorage'da kalıcı. Ayrı kategori. */

const TEST_CATALOG = [
  { id: "kaygi", name: "Sınav Kaygısı Ölçeği", icon: "alert", tone: "danger", desc: "Sınav öncesi kaygı düzeyini ölçer.",
    questions: ["Sınavdan önce kalbim hızlanır.", "Bildiğim soruları bile sınavda unuturum.", "Sınav gecesi uyumakta zorlanırım.", "Sınav sırasında ellerim terler.", "Sonuçları düşününce gerilirim."],
    bands: [[0, 2, "Düşük kaygı", "success"], [2, 3.2, "Orta kaygı", "warning"], [3.2, 5, "Yüksek kaygı", "danger"]] },
  { id: "motivasyon", name: "Motivasyon Ölçeği", icon: "bolt", tone: "primary", desc: "Çalışma motivasyonu ve hedef bağlılığı.",
    questions: ["Hedeflerime ulaşacağıma inanıyorum.", "Zorlandığımda pes etmem.", "Çalışmaya başlamak benim için kolaydır.", "Başarısızlık beni daha çok çalıştırır.", "Geleceğim için heyecan duyuyorum."],
    bands: [[0, 2.5, "Düşük", "danger"], [2.5, 3.7, "Orta", "warning"], [3.7, 5, "Yüksek", "success"]] },
  { id: "ogrenme", name: "Öğrenme Stili Envanteri", icon: "book", tone: "info", desc: "Görsel / işitsel / kinestetik baskınlık.",
    questions: ["Bir şeyi görerek daha iyi öğrenirim.", "Sesli tekrar bana yardımcı olur.", "Yaparak/yazarak öğrenmeyi severim.", "Şema ve grafikler işime yarar.", "Ders dinlerken not almam gerekir."],
    bands: [[0, 5, "Karma stil", "primary"]] },
  { id: "dikkat", name: "Dikkat & Odak Testi", icon: "target", tone: "warning", desc: "Çalışırken dikkat sürdürme düzeyi.",
    questions: ["Çalışırken kolayca dikkatim dağılır.", "Telefonum yanımdayken odaklanamam.", "Uzun süre tek konuya çalışabilirim.", "Mola sonrası toparlanmam uzun sürer.", "Gürültülü ortamda çalışamam."],
    bands: [[0, 2.2, "Güçlü odak", "success"], [2.2, 3.4, "Orta", "warning"], [3.4, 5, "Dağınık", "danger"]] },
  { id: "zeka", name: "Çoklu Zeka Testi", icon: "star", tone: "success", desc: "Baskın zeka alanlarını belirler.",
    questions: ["Sayılarla çalışmayı severim.", "Kelimelerle kendimi iyi ifade ederim.", "Görsel/uzamsal düşünürüm.", "Müzik ve ritim ilgimi çeker.", "Grup çalışmasında verimliyim."],
    bands: [[0, 5, "Profil çıkarıldı", "primary"]] },
];
const LIKERT = ["Hiç", "Az", "Orta", "Çok", "Tamamen"];

/* soru tipleri */
const QKINDS = {
  likert: { label: "Katılım ölçeği (1-5)", icon: "chart", hint: "Hiç → Tamamen" },
  yesno:  { label: "Evet / Hayır", icon: "checkCircle", hint: "İki seçenek" },
  scale:  { label: "Derecelendirme (0-10)", icon: "trend", hint: "Sayısal kaydırma" },
  choice: { label: "Çoktan seçmeli", icon: "notebook", hint: "Özel seçenekler" },
};
/* string soru → likert; obje ise olduğu gibi */
function normQ(q) { return typeof q === "string" ? { text: q, kind: "likert" } : { kind: "likert", ...q }; }
function testQuestions(test) { return (test.questions || []).map(normQ); }
/* bir cevabı (kind'e göre) 1-5 puana çevir */
function answerScore(kind, raw, q) {
  if (raw == null) return null;
  if (kind === "likert") return raw + 1;                 // 0..4 -> 1..5
  if (kind === "yesno") return raw ? 5 : 1;              // true/false
  if (kind === "scale") return (raw / 10) * 4 + 1;       // 0..10 -> 1..5
  if (kind === "choice") { const n = (q.options || []).length || 1; return n > 1 ? (raw / (n - 1)) * 4 + 1 : 3; }
  return raw;
}

const TASSIGN_KEY = "uk_test_assign_v1";
let _tassign = (() => { try { const s = localStorage.getItem(TASSIGN_KEY); if (s) return JSON.parse(s); } catch (e) {} return [
  { id: "t1", student: "Elif Yıldız", testId: "kaygi", status: "completed", score: 3.6, band: "Yüksek kaygı", bandTone: "danger", coachNote: "Nefes egzersizi ve deneme rutini öneril di.", sentAt: Date.now() - 4 * 86400000, completedAt: Date.now() - 2 * 86400000 },
  { id: "t2", student: "Elif Yıldız", testId: "motivasyon", status: "sent", score: null, band: null, coachNote: "", sentAt: Date.now() },
  { id: "t3", student: "Burak Demir", testId: "dikkat", status: "completed", score: 2.0, band: "Güçlü odak", bandTone: "success", coachNote: "", sentAt: Date.now() - 3 * 86400000, completedAt: Date.now() - 86400000 },
]; })();
const _tListeners = new Set();
function persistTassign() { try { localStorage.setItem(TASSIGN_KEY, JSON.stringify(_tassign)); } catch (e) {} _tListeners.forEach((l) => l()); }
function getTassign() { return _tassign; }
function sendTest(student, testId) { _tassign = [{ id: "t" + Date.now(), student, testId, status: "sent", score: null, band: null, bandTone: null, coachNote: "", sentAt: Date.now() }, ..._tassign]; persistTassign(); }
function completeTest(id, score, band, bandTone) { _tassign = _tassign.map((t) => t.id === id ? { ...t, status: "completed", score, band, bandTone, completedAt: Date.now() } : t); persistTassign(); }
function remindTest(id) { _tassign = _tassign.map((t) => t.id === id ? { ...t, remindedAt: Date.now(), reminders: (t.reminders || 0) + 1 } : t); persistTassign(); }
function setTestNote(id, note) { _tassign = _tassign.map((t) => t.id === id ? { ...t, coachNote: note } : t); persistTassign(); }
function useTassign() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _tListeners.add(l); return () => _tListeners.delete(l); }, []);
  return _tassign;
}
function testById(id) { return _allTests().find((t) => t.id === id); }

/* ---- özel (koç oluşturduğu) testler ---- */
const CUSTOM_TESTS_KEY = "uk_custom_tests_v1";
let _customTests = (() => { try { const s = localStorage.getItem(CUSTOM_TESTS_KEY); if (s) return JSON.parse(s); } catch (e) {} return []; })();
function _allTests() { return [..._customTests, ...TEST_CATALOG]; }
function useTests() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _tListeners.add(l); return () => _tListeners.delete(l); }, []);
  return _allTests();
}
function addCustomTest(test) {
  const id = "ct" + Date.now();
  _customTests = [{ ...test, id, custom: true }, ..._customTests];
  try { localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(_customTests)); } catch (e) {}
  _tListeners.forEach((l) => l());
  return id;
}
function deleteCustomTest(id) {
  _customTests = _customTests.filter((t) => t.id !== id);
  try { localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(_customTests)); } catch (e) {}
  _tListeners.forEach((l) => l());
}
function scoreBand(test, score) {
  for (const [lo, hi, label, tone] of test.bands) if (score >= lo && score <= hi) return { label, tone };
  return { label: "—", tone: "muted" };
}

Object.assign(window, { TEST_CATALOG, LIKERT, QKINDS, normQ, testQuestions, answerScore, getTassign, sendTest, completeTest, remindTest, setTestNote, useTassign, testById, scoreBand, useTests, addCustomTest, deleteCustomTest });
