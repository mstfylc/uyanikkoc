# Design İstek Promptu — WEB + YÖNETİM kalan ince maddeler (v1)

> Kapsam: yalnızca **web (öğrenci/koç/veli)** + **yönetim (admin)**. **Mobil HARİÇ** (ayrı paket:
> `.design-import/mobile/ISTEK-PROMPTU-MOBIL.md`).
> Ana ekranlar v6'ya göre birebir hizalandı; aşağıdakiler tasarım içeriği/görseli bekleyen
> 3 ince madde. Doğruluk kaynağı: `uyanikkoc-web-claudecode-v6` (`handoff/SADAKAT-SPEC-*.md`).

---

## Kopyala-yapıştır prompt

```
Uyanık Koç WEB + YÖNETİM panelinde kalan 3 ince madde için SADAKAT-SPEC + PNG üret.
Mobil DAHİL DEĞİL. Format: mevcut handoff/SADAKAT-SPEC-* ile aynı (5 zorunlu alan:
bileşen sırası + grid sınıfı · alan/etiket · başlık/alt-başlık metni · tablo/satır yapısı ·
boş/yükleniyor/durum). Token/tasarım sistemi mevcut src/styles.css + tokens.json. Tam Türkçe.

== MADDE 1 — Çalışma Programı (schedule): zengin AddBlockModal + Gün görünümü düzeni ==
Kaynak: src/student-pages.jsx → SchedulePage, AddBlockModal · Rota: öğrenci schedule
İstenen:
• AddBlockModal "Çalışma Bloğu Ekle" TAM spec:
  - Alanlar sırası: Başlangıç/Bitiş (time, yan yana) · Ders (müfredat select) ·
    Kaynak (kitabın, opsiyonel; kaynak yoksa ipucu metni) · Konu/başlık (autofocus) ·
    Tür chip'leri: "Soru çözümü" / "Konu tekrarı" / "Deneme" / "Video ders"
  - Soru çözümü/Deneme seçilince: Soru / Doğru / Yanlış (numeric) + canlı "Boş" ve "Net";
    "Doğru + yanlış, soru sayısını aşamaz." uyarısı; Net = max(0, Doğru − Yanlış/4)
  - Footer: "Vazgeç" / "Ekle" (konu ≥2 karakter ve tutarlıysa aktif)
• Gün görünümü TAM yerleşim: gün segmenti (Pzt…, bugünde primary nokta) + "Tüm hafta";
  .grid.col-main → SOL gün blokları (BlockCard), SAĞ 2 StatCard ("Bu hafta plan"/"Toplam blok") +
  "Haftalık Çalışma" BarChart.
• PNG: schedule-gun (col-main düzeni) + add-block-modal (modal açık), light + dark, desktop 1440.

== MADDE 2 — Ayarlar: "Gizlilik & Güvenlik" sekmesi içeriği ==
Kaynak: src/settings.jsx → SettingsPage, SettingsPrivacyTab · Rota: settings (GENEL)
İstenen:
• "Gizlilik & Güvenlik" sekmesinin TAM içeriği (şifre değişikliği ARTIK "Hesap" sekmesinde —
  burada DEĞİL): hangi bölümler, hangi toggle/alanlar (örn. oturum/cihaz yönetimi, veri/KVKK,
  görünürlük tercihleri…). Her öğenin başlığı + açıklaması + varsayılan durumu.
• PNG: settings-gizlilik (Gizlilik & Güvenlik sekmesi açık), light + dark, desktop 1440.

== MADDE 3 — Koç Online Denemeler (c-online): CoachAccessPanel + LockBanner + oluştur modalı ==
Kaynak: src/online-deneme.jsx → CoachOnlineExams, CoachAccessPanel, OnlineDenemeOlusturModal,
LockBanner · Rota: koç c-online
İstenen:
• CoachAccessPanel "Hesap & Yetkiler" TAM spec: koç tipi segmenti (Bireysel / Kuruma bağlı),
  yetki toggle seti ("Deneme oluşturabilir" · "Deneme silebilir" · "Online deneme kullanabilir" ·
  "Gelir & Tahsilat görebilir") + paket toggle; lisans rozeti (Bireysel lisans / Kuruma bağlı · {kurum}).
• LockBanner durumları: "Online deneme paketi kapalı" · "Deneme oluşturma yetkin yok".
• OnlineDenemeOlusturModal TAM spec: alanlar + cevap anahtarı giriş düzeni (soru sayısı × A–E).
• Silme akışı: "Denemeyi sil?" onayı + toast "Deneme silindi · bildirim oluşturuldu".
• PNG: c-online (AccessPanel + liste), c-online-kilit (LockBanner), online-olustur-modal (modal açık),
  light + dark, desktop 1440.

== ÇIKTI ==
handoff/SADAKAT-SPEC-ek-{schedule-modal,settings-gizlilik,c-online}.md +
exports/<ekran>/<desktop-light|desktop-dark>/<route|modal>.png · klasör yapısı korunmuş tek .zip.
```

---

## Notlar
- Bu 3 madde gelince web+yönetimde "ideal tasarıma göre" hiçbir açık kalmaz.
- **Mobil ayrı** tutuldu — onun talebi `.design-import/mobile/ISTEK-PROMPTU-MOBIL.md`.
- En kritik çıktı yine **SADAKAT-SPEC'leri** (PNG ikincil QA referansı).
