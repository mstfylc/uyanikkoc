# Design'den İstenecek Eksikler — Prompt

> Bu prompt, kalan ekranların **birebir (1:1)** kodlanabilmesi için tasarımı/prototipi
> üreten araca verilir. Amaç: PNG referansı olmayan ekranlar + tüm modallar + dark/mobil
> görselleri ve **ekran-bazlı sadakat spec'leri** (dashboard'daki gibi) elde etmek.

---

## Kopyala-yapıştır prompt

```
Uyanık Koç web prototipi (uyanik-koc-dashboard.html, kaynak src/*.jsx) için, mevcut
v6 handoff paketini TAMAMLAYAN bir "eksikler paketi" üret. İki bölüm istiyorum:

== BÖLÜM 1: EKRAN-BAZLI SADAKAT SPEC'LERİ (en kritik) ==
handoff/SADAKAT-SPEC-ogrenci-dashboard.md ile AYNI formatta, aşağıdaki HER ekran için
ayrı bir .md üret. Her spec şunları içersin:
  • Bileşen sırası (yukarıdan aşağıya, grid sınıflarıyla: col-main / g-4 / g-2 …)
  • Her StatCard: ikon · tone · değer kaynağı · TAM Türkçe etiket · delta (sıra birebir)
  • Hero/başlık/rozet metinleri ve yerleşimi
  • Bölüm başlıkları + alt başlıkları (birebir Türkçe metin)
  • Boş/yükleniyor/hover/aktif durumları, modal tetikleyicileri
  • "Sık yapılan sapmalar (YAPMA)" listesi
Ekranlar:
  Öğrenci: schedule, topics, exams, mistakes, assignments, messages, appointments,
           tests, ai-coach, motivation, billing, support, settings, notifications, profile
  Koç:     dashboard, students, c-topics, c-cizelge, c-assignments, c-exams, c-online,
           messages, appointments, tests, reports, revenue, support, settings, profile,
           notifications, feedback, invoices, license
  Veli:    dashboard, p-exams, p-reports, messages, appointments, billing, support,
           settings, profile, notifications

== BÖLÜM 2: PNG EKRAN GÖRÜNTÜLERİ (pixel-perfect QA) ==
Chrome DevTools → "Capture full size screenshot" ile tam-sayfa (kırpılmamış) PNG.
Her ekran/modal için 4 varyant: tema {light, dark} × genişlik {desktop 1440px, mobile 390px}.
Kapsam:
  (a) Bölüm 1'deki TÜM rotalar (PNG'si olmayanlar)
  (b) Mevcut 14 ekranın MOBİL (390px) light+dark hali (desktop zaten var)
  (c) TÜM modallar — açık halde:
      Ödev Ata, Akıllı Ödev (SmartOdev), Yanlış ekle, Toplu yanlış→defter (MistakeBatch),
      Odak Tekrar (ZeroErrorReview), Koç notu (CoachNote), Grup oluştur, Randevu iste,
      Deneme içe aktar, Deneme oluştur/kayıt, Manuel deneme, Geri bildirim, Optik form,
      Öğrenci/Çocuk ekle

== ORTAK KURALLAR ==
• Tüm UI metinleri TAM Türkçe (ç ğ ı İ ö ş ü) — ASCII'ye düşürme.
• Seed veri sabit: Elif Yıldız / Dilek Emen / Ayşe Yıldız; "bugün" = 2026-06-05.
• Topbar rol "pill" artefaktını düzelt (aktif rol doğru vurgulansın).
• İsimlendirme: exports/<rol>/<viewport>-<tema>/<route|modal>.png
    örn: exports/coach/mobile-dark/c-topics.png
         exports/student/desktop-light/smart-odev-modal.png
  Spec'ler: handoff/SADAKAT-SPEC-<rol>-<ekran>.md
• Çıktı: klasör yapısı korunmuş tek bir .zip.
```

---

## Neden bu iki bölüm?

- **Sadakat spec'leri**, dashboard örneğinde olduğu gibi gözle fark edilmeyen sapmaları
  (stat kartı tonu, kart sırası, etiket) yakalatıyor — pixel-perfket için PNG'den daha kesin.
- **PNG'ler** dark/mobil/modal varyantlarını görsel doğrulamak için.

Kaynak `src/*.jsx` zaten elimizde (doğruluk kaynağı), bu yüzden bunlar **bloklayıcı değil**;
ama geldiğinde kalan ~35 ekran + modallar pixel-perfect kapanır.
