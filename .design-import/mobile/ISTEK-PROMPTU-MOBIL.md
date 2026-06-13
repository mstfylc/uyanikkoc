# Design İstek Promptu — MOBİL Uygulama (v6 güncel)

> `.design-import/mobile/` altında bir mobil tasarım var ama **v6 öncesi**: yeni modüller
> (Yanlış Defteri, Net Kaybı Haritası, Akıllı Ödev sinyalleri, Takvimim, Sıfır Hata Döngüsü,
> Hata Frekansı, mesaj bildirimleri) eksik. Bu prompt, **v6 ile hizalı güncel mobil tasarım**
> + ekran-bazlı spec + native render istemek içindir.

---

## Kopyala-yapıştır prompt

```
Uyanık Koç ÖĞRENCİ MOBİL uygulamasının v6 ile HİZALI tam tasarımını üret (React Native /
Expo hedefli). Web v6 ile aynı marka/dil; native kalıplar (alt tab bar, safe-area, gesture).

== TASARIM DİLİ ==
• Renk/tipografi/spacing: web tokens.json ile tutarlı (mobil ölçeklerine uyarlı).
  Font: Plus Jakarta Sans. Açık + koyu tema. Tüm metinler TAM Türkçe (ç ğ ı İ ö ş ü).
• Native desenler: alt tab bar (5 sekme), header, bottom-sheet/modal, pull-to-refresh,
  iOS + Android güvenli alanlar.

== EKRAN ENVANTERİ (v6 modülleri DAHİL) ==
Alt sekmeler: Ana Sayfa · Ödevler · Denemeler · Program · Profil
Tüm ekranlar:
  • Login (telefon/OTP + e-posta) + Üye ol
  • Ana Sayfa: hero + Çalışma Serisi + Takvimim kartı + öncelikli ödev + stat'lar
  • Ödevler: Günlük plan / Liste / Takvim görünümleri (varsayılan Günlük plan), sonuç gir (D/Y/B)
  • Denemeler: sonuçlar + Net Kaybı Haritası + ders bazında net + Analiz + Online deneme/optik
  • Yanlış Defteri (YENİ): yanlış ekle (foto), Sıfır Hata Döngüsü (Odak Tekrar), Hata Frekansı
  • Konu Takibi: müfredat ısı haritası + ders sekmeleri + ince özet şeridi
  • Program (Çalışma Programı / haftalık)
  • Mesajlar: koç + grup, okunmamış rozeti, bildirim
  • Randevular: liste + randevu iste
  • Testler (envanter)
  • Motivasyon
  • Abonelik (billing)
  • Bildirimler
  • Ayarlar
  • Profil
  • AI Koç — "Yakında" placeholder (tam ekran yapma)

== HER EKRAN İÇİN İSTENENLER ==
1) Kaynak referans (tek-dosya RN/JSX prototip, mevcut uk-screens.jsx stilinde) + mock veri.
2) SADAKAT-SPEC .md (web dashboard spec formatında): bileşen sırası, kart ikon·tone·etiket,
   başlık metinleri, alt tab bar davranışı, boş/yükleniyor/hover-basılı durumları, "YAPMA".
3) PNG render: platform {iOS 390×844, Android 360×800} × tema {light, dark}, tam-ekran;
   modallar/bottom-sheet'ler açık halde ayrıca.

== SINIRLAR (Uyanık Koç kuralları) ==
• Marka her yerde "Uyanık Koç". AI Koç "Yakında". Tek şube modeli.
• Sadece ÖĞRENCİ uygulaması (koç/veli/admin değil). Native token oturumu (Bearer + refresh),
  web NextAuth cookie oturumuna paralel — ona dokunma.
• Ortak mantık web ile paylaşılır (net/streak/spaced-repetition aynı kurallar).
• Veri uydurma; eksik/kararsız alanları RISKS'te listele.

== İSİMLENDİRME / ÇIKTI ==
• exports/mobil/<platform>-<tema>/<route|modal>.png
  örn: exports/mobil/ios-dark/yanlis-defteri.png
• handoff/SADAKAT-SPEC-mobil-<ekran>.md · src/uk-screens-v6-*.jsx
• Klasör yapısı korunmuş tek .zip.
```

---

## Notlar
- Prod: `apps/mobile/` (Expo Router). Ekranlar: `(tabs)/` + `sub/` + `login`.
- Tasarım geldiğinde mevcut mobil ekranları web'de yaptığımız gibi birebir hizalarız;
  v6 modülleri (Yanlış Defteri, Net Kaybı, Takvimim) yeni ekran olarak eklenir.
- En kritik çıktı yine **SADAKAT-SPEC'leri**.
