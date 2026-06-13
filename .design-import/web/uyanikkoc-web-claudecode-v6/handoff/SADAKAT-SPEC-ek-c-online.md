# SADAKAT SPEC — EK · Koç Online Denemeler: Yetki paneli + Kilit + Oluştur modalı

Kaynak: `src/online-deneme.jsx → CoachOnlineExams`, `CoachAccessPanel`, `OnlineDenemeOlusturModal`,
`LockBanner`. Rota: koç `c-online`. Tam Türkçe. (Ana spec: `SADAKAT-SPEC-koc-c-online.md`.)

## PageHead
- Başlık **`Online Denemeler`** · alt **`Online deneme oluştur, cevap anahtarını belirle, öğrencilere yayınla`**
- Sağ aksiyon: paket açık **ve** `denemeOlustur` yetkisi varsa birincil **`Online Deneme Oluştur`** (plus → modal).

## 1) CoachAccessPanel — `Section` "Hesap & Yetkiler"
- Alt: **`Bireysel koç tüm yetkilere sahiptir; kuruma bağlı koçun yetkilerini kurum belirler`** ·
  sağda lisans rozeti: **`Bireysel lisans`** (success/users) / **`Kuruma bağlı · {kurum}`** (info/building).
- **Koç tipi (demo)** segmenti: **`Bireysel`** / **`Kuruma bağlı`**.
- **Yetki toggle'ları** (`.switch`; bireyselde hepsi açık+kilitli, kurumda kurum belirler):
  **`Deneme oluşturabilir`** (`denemeOlustur`) · **`Deneme silebilir`** (`denemeSil`) ·
  **`Online deneme kullanabilir`** (`onlineDeneme`) · **`Gelir & Tahsilat görebilir`** (`gelirGorunur`).
- **`Online deneme paketi (süper admin/kurum)`** toggle + alt: **`Paket kapalıysa yetki açık olsa bile oluşturulamaz`**.

## 2) LockBanner (koşullu)
- Paket kapalı: **`Online deneme paketi kapalı`** / **`Bu özellik kuruma/koça tanımlı bir paket modülüdür.
  Süper admin / kurum bu paketi açmadan online deneme oluşturulamaz.`**
- Paket açık ama yetki yok: **`Deneme oluşturma yetkin yok`** / **`{kurum} bu yetkiyi vermedi. Kuruma bağlı
  koçlar yalnızca kurum izniyle online deneme oluşturabilir.`**

## 3) "Oluşturduğun Online Denemeler" — `Section`
Alt **`{n} deneme`**; satır = notebook ikon + ad + `{tip} · {n} soru · Cevap anahtarı: {k}/{n}` (+PDF adı) +
**`Sil`** / **`Kilitli`** (yetkiye göre). Boş: **`Henüz online deneme oluşturmadın.`**
- **Silme onayı** (`ConfirmModal`): **`Denemeyi sil?`** / **`{ad} kaldırılacak. Bu işlem için bildirim oluşturulur.`**
  → silince toast **`Deneme silindi · bildirim oluşturuldu`** + `pushNotif`.

## 4) OnlineDenemeOlusturModal (TAM) — maxWidth 520
Başlık **`Online Deneme Oluştur`** · sağ üst kapat. Alanlar (sıra birebir):
1. **`Deneme adı`** — input (≥2 karakter), örn. `TYT Genel Deneme #8`.
2. `.grid.g-2`: **`Tür`** (select: TYT/AYT/YKS/LGS) + **`Soru sayısı`** (number, 1–200, varsayılan 20).
3. **`Cevap anahtarı`** — etiket yanında **`({A–E veya A–D} · {girilen}/{soru})`**:
   - **textarea** — harf dizisi **yapıştır/gir** (örn. `ABCDE BCDEA ...`). ⚠️ **Bubble/şık ızgarası DEĞİL** —
     serbest harf girişi; `parseAnswerKey` ile A–E (LGS'de A–D) dışı temizlenir.
   - **`PDF'ten içe aktar`** (file, pdf, opsiyonel → referans; toast **`PDF eklendi: {ad}`**).
   - Sağda durum rozeti: **`Tam`** (success) / **`{girilen}/{soru}`** (warning).
   - Alt ipucu: **`PDF eklersen referans olarak saklanır; cevap anahtarını harf dizisi olarak yapıştır/gir.`**
   - LGS → **A–D** (4 şık), diğer → **A–E** (5 şık).
- Footer: **`Vazgeç`** · **`Oluştur`** — geçerli (ad>1 + soru>0 + anahtar uzunluğu = soru sayısı) ise aktif.
  Kaydedince toast **`Online deneme oluşturuldu ve öğrencilere yayınlandı 📝`**.

## 5 zorunlu alan
- **Bileşen sırası:** PageHead → CoachAccessPanel → (LockBanner koşullu) → "Oluşturduğun Online Denemeler" listesi → (Oluştur/Sil modalleri).
- **StatCard:** yok (yetki/liste ekranı).
- **Başlık/alt metinleri:** yukarıda birebir.
- **Liste/satır yapısı:** deneme satırı (ikon + ad + tip·soru·anahtar + Sil/Kilitli); modal alanları yukarıda.
- **Boş/durum/kilit:** "Henüz online deneme oluşturmadın."; LockBanner iki hali; cevap anahtarı Tam/eksik; silme onayı + toast.

## PNG
`exports/uyum/c-online.png` + `c-online-kilit.png` (light+dark, 1440). **OnlineDenemeOlusturModal**
portal+fixed → tarayıcı-içi araçla yakalanamadı; gerçek DevTools ile aç-yakala (QA reçetesi; "Online Deneme Oluştur").

## YAPMA
- ❌ ASCII: `Online Denemeler`, `Hesap & Yetkiler`, `Cevap anahtarı`, `Online deneme paketi kapalı`.
- ❌ Cevap anahtarını **bubble ızgarası** olarak yapmak — kanonik kontrol **textarea (harf dizisi)** + Tam/eksik göstergesi.
- ❌ Paket/yetki kilit mantığını (LockBanner) kaldırmak; "Sil"i yetki yokken aktif yapmak.
- ❌ LGS'de A–E göstermek (LGS = A–D); geçerlilik kuralını (anahtar uzunluğu = soru sayısı) gevşetmek.
