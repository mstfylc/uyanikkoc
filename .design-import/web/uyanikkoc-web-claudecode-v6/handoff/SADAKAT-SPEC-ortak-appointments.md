# SADAKAT SPEC — Öğrenci/Veli · Randevular (appointments)

Kaynak: `src/appointments-ui.jsx → StudentAppointmentsPage` (+ `ApptRequestModal`).
Rota: `appointments` (öğrenci ve veli paylaşır; veli metinleri biraz farklı). Veri: `useAppts()`,
`useApptSettings()`. Tam Türkçe.

## PageHead
- Başlık **`Randevular`**
- Alt (öğrenci): **`Koçunla online, yüz yüze veya telefonla görüşme planla`**
- Alt (veli): **`Çocuğunun koçuyla online, yüz yüze veya telefonla görüşme planla`**
- Sağ aksiyon: birincil **`Randevu İste`** (plus) → `ApptRequestModal`; hak dolduysa pasif (opacity .5).

## Bileşen sırası
1. **Kota kartı** (`.card`): target ikon (46px) + metin:
   - Hak varsa: **`Bu hafta {used}/{limit} randevu kullandın`** (limit 0 ise **`Sınırsız randevu hakkın var`**) +
     alt **`Koçunun müsait saatlerinden seçim yapabilirsin.`**
   - Hak dolduysa: alt **`Haftalık randevu hakkın doldu. Gelecek hafta tekrar dene.`**
   - Sağda `.dots` kullanım göstergesi (kullanılan ✓, kalan +). Haftalık limit: öğrenci 2, veli 1 (ayarlardan).
2. **`Section` — `Randevularım`** · alt **`{n} talep`**: `ApptRow` listesi; boş: **`Henüz randevu talebin yok.`**

## ApptRequestModal (`Randevu İste`)
- Başlık **`Randevu İste`** · alt **`Koç Dilek Emen · müsait saatlerden seç`**.
- Alanlar: **`Görüşme türü`** (segment: online/yüz yüze/telefon — `APPT_MODE`, koç açtıysa) →
  **`Gün`** (müsait gün chip'leri) → **`Saat`** (gün seçilince slot chip'leri) → **`Konu (ops.)`** input.
- Footer: **`Vazgeç`** / **`Talep Gönder`** (geçerliyse) → toast **`Randevu talebin gönderildi — koç onayı bekleniyor`**;
  buton anlık **`Gönderildi`** olur.
- Koç hiç tür açmadıysa: **`Koç şu an randevu kabul etmiyor.`**

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Randevular`, `Randevu Iste`, `Görüşme türü`.
- ❌ Öğrenci/veli alt başlık metnini karıştırmak.
- ❌ Kota kartını/`.dots` göstergesini atlamak; limit mantığını (öğrenci 2 / veli 1) sabitlemek yerine ayarlardan okumamak.
- ❌ Modalde gün→saat bağımlılığını (gün seçilmeden saat çıkmaz) kaldırmak.
