/* Paylaşılan müfredat store'u — SINAV TÜRÜNE göre (YKS / LGS).
   ders → konu grubu (alt kırılım) → konular. localStorage'da kalıcı. */

const YKS_DEFAULT = {
  "Türkçe": [
    { grup: "Anlam Bilgisi", konular: ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf"] },
    { grup: "Dil Bilgisi", konular: ["Ses Bilgisi", "Sözcük Türleri", "Cümlenin Ögeleri"] },
    { grup: "Yazım & Anlatım", konular: ["Yazım Kuralları", "Noktalama", "Anlatım Bozuklukları"] },
  ],
  "Matematik": [
    { grup: "Sayılar", konular: ["Temel Kavramlar", "Bölme & Bölünebilme", "Rasyonel Sayılar", "Üslü Sayılar", "Köklü Sayılar"] },
    { grup: "Cebir", konular: ["Çarpanlara Ayırma", "Oran – Orantı", "Problemler"] },
    { grup: "Fonksiyonlar & Polinomlar", konular: ["Kümeler", "Fonksiyonlar", "Polinomlar"] },
    { grup: "Analiz", konular: ["Türev"] },
  ],
  "Geometri": [
    { grup: "Temel & Açı", konular: ["Temel Kavramlar", "Açılar"] },
    { grup: "Çokgenler", konular: ["Üçgenler", "Çokgenler", "Dörtgenler"] },
    { grup: "Çember & Analitik", konular: ["Çember", "Analitik Geometri", "Katı Cisimler"] },
  ],
  "Fizik": [
    { grup: "Mekanik", konular: ["Fizik Bilimine Giriş", "Hareket (Kinematik)", "Kuvvet ve Newton", "İş – Güç – Enerji"] },
    { grup: "Elektrik & Manyetizma", konular: ["Elektrik", "Manyetizma"] },
    { grup: "Dalgalar & Optik", konular: ["Dalgalar", "Optik"] },
  ],
  "Kimya": [
    { grup: "Temel Kimya", konular: ["Kimya Bilimi", "Atom ve Periyodik Sistem", "Türler Arası Etkileşim"] },
    { grup: "Madde & Karışımlar", konular: ["Maddenin Halleri", "Karışımlar"] },
    { grup: "Hesaplamalar", konular: ["Mol Kavramı", "Kimyasal Tepkimeler", "Kimyasal Hesaplamalar", "Asitler ve Bazlar"] },
  ],
  "Biyoloji": [
    { grup: "Hücre", konular: ["Canlıların Ortak Özellikleri", "Hücre", "Hücre Bölünmesi"] },
    { grup: "Kalıtım & Sınıflandırma", konular: ["Kalıtım", "Sınıflandırma"] },
    { grup: "Sistemler", konular: ["Ekosistem", "Dolaşım Sistemi", "Solunum Sistemi"] },
  ],
};

const LGS_DEFAULT = {
  "Türkçe": [
    { grup: "Anlam Bilgisi", konular: ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf"] },
    { grup: "Dil Bilgisi", konular: ["Fiilimsiler", "Cümlenin Ögeleri", "Fiilde Çatı", "Cümle Türleri", "Anlatım Bozuklukları"] },
    { grup: "Yazım & Noktalama", konular: ["Yazım Kuralları", "Noktalama İşaretleri", "Sözel Mantık"] },
  ],
  "Matematik": [
    { grup: "Sayılar", konular: ["Çarpanlar ve Katlar", "Üslü İfadeler", "Kareköklü İfadeler"] },
    { grup: "Cebir", konular: ["Cebirsel İfadeler", "Doğrusal Denklemler", "Eşitsizlikler"] },
    { grup: "Geometri & Veri", konular: ["Üçgenler", "Eşlik ve Benzerlik", "Dönüşüm Geometrisi", "Olasılık", "Veri Analizi"] },
  ],
  "Fen Bilimleri": [
    { grup: "Dünya & Madde", konular: ["Mevsimler ve İklim", "Basınç", "Madde ve Endüstri"] },
    { grup: "Canlılar & Enerji", konular: ["DNA ve Genetik Kod", "Basit Makineler", "Enerji Dönüşümleri"] },
    { grup: "Elektrik", konular: ["Elektrik Yükleri ve Enerji"] },
  ],
  "T.C. İnkılap Tarihi": [
    { grup: "Milli Mücadele", konular: ["Bir Kahraman Doğuyor", "Milli Uyanış", "Milli Bir Destan"] },
    { grup: "Cumhuriyet", konular: ["Çağdaş Türkiye Yolunda", "Atatürkçülük", "Demokratikleşme"] },
  ],
  "Din Kültürü": [
    { grup: "İnanç & İbadet", konular: ["Kader İnancı", "Zekât ve Sadaka"] },
    { grup: "Din & Hayat", konular: ["Din ve Hayat", "Hz. Muhammed'in Örnekliği", "Kur'an'da Akıl ve Bilgi"] },
  ],
  "İngilizce": [
    { grup: "Units 1-4", konular: ["Friendship", "Teen Life", "In the Kitchen", "On the Phone"] },
    { grup: "Units 5-8", konular: ["The Internet", "Adventures", "Tourism", "Chores"] },
  ],
};

const EXAM_TYPES = ["YKS", "LGS"];
const CURRICULUM_KEY = "uk_curriculum_v2";
const clone = (o) => JSON.parse(JSON.stringify(o));
const DEFAULTS = { YKS: YKS_DEFAULT, LGS: LGS_DEFAULT };

let _all = (() => {
  try {
    const s = localStorage.getItem(CURRICULUM_KEY);
    if (s) { const p = JSON.parse(s); if (p.YKS && p.LGS) return p; }
  } catch (e) {}
  return clone(DEFAULTS);
})();

const _listeners = new Set();
function getCurriculum(type = "YKS") { return _all[type] || _all.YKS; }
function setCurriculum(type, next) {
  _all = { ..._all, [type]: typeof next === "function" ? next(_all[type]) : next };
  try { localStorage.setItem(CURRICULUM_KEY, JSON.stringify(_all)); } catch (e) {}
  _listeners.forEach((l) => l());
}
function resetCurriculum(type) {
  if (type) setCurriculum(type, clone(DEFAULTS[type]));
  else { _all = clone(DEFAULTS); try { localStorage.setItem(CURRICULUM_KEY, JSON.stringify(_all)); } catch (e) {} _listeners.forEach((l) => l()); }
}

function useCurriculum(type = "YKS") {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const l = () => force((x) => x + 1);
    _listeners.add(l);
    return () => _listeners.delete(l);
  }, []);
  return _all[type] || _all.YKS;
}

Object.assign(window, { YKS_DEFAULT, LGS_DEFAULT, EXAM_TYPES, getCurriculum, setCurriculum, resetCurriculum, useCurriculum });
