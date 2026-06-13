# Design İstek Promptu — YÖNETİM (Admin) Paneli

> Yönetim paneli v6 web handoff'unda **kapsam dışı** bırakılmıştı; prod'da `app/yonetim/*`
> ekranları var ama **tasarımı yok**. Bu prompt, mevcut tasarım sistemiyle **birebir uyumlu**,
> sıfırdan bir admin tasarım paketi istemek içindir.

---

## Kopyala-yapıştır prompt

```
Uyanık Koç için YÖNETİM (Admin / Süper Yönetici) panelinin TAM tasarımını üret.
Bu, web öğrenci/koç/veli paneliyle AYNI tasarım sistemini kullanan ayrı bir yüzeydir.

== TASARIM SİSTEMİ (zorunlu — yeni sistem icat etme) ==
• Token/renk/tipografi/spacing/gölge/radius: mevcut src/styles.css :root + [data-theme=dark]
  ve tokens.json ile BİREBİR. Font: Plus Jakarta Sans. Yeni renk/token üretme.
• Mevcut primitifleri kullan: Sidebar + Topbar shell, Section/PageHead, StatCard, Badge,
  tablo (.tbl), filtre seg'leri, modal, toast, ikon seti (src/icons.jsx).
• Açık + koyu tema. Tüm metinler TAM Türkçe (ç ğ ı İ ö ş ü).

== EKRAN ENVANTERİ (prod app/yonetim ile birebir) ==
  • dashboard        — platform genel bakış (KPI stat kartları + grafikler + son aktivite)
  • orgs (Kurumlar)  — liste + detay (orgs/[orgId]): şubeler, koçlar, lisans durumu
  • branches (Şubeler)
  • coaches (Koçlar) — liste + detay (coaches/[coachId]): öğrenciler, performans, gelir
  • students (Öğrenciler) — liste + detay (students/[studentId])
  • managers (Yöneticiler)
  • leads (Aday/Talep)
  • licenses (Lisanslar) + license (tekil lisans)
  • modules (Modüller — özellik aç/kapa)
  • campaigns (Kampanyalar)
  • revenue (Gelir & Tahsilat)
  • reports (Raporlar)
  • support (Destek)
  • settings (Ayarlar)
  • profile (Profil)

== HER EKRAN İÇİN İSTENENLER ==
1) Kaynak JSX (web prototipiyle aynı stil: ayrı bileşen, mock veri + store deseni).
2) SADAKAT-SPEC .md (handoff/SADAKAT-SPEC-ogrenci-dashboard.md formatında):
   bileşen sırası (grid sınıfları), her StatCard'ın ikon·tone·etiket·delta'sı, başlık/alt
   başlık metinleri, tablo kolonları, boş/yükleniyor durumları, "YAPMA" listesi.
3) PNG: tema {light, dark} × genişlik {desktop 1440px, mobile 390px}, tam-sayfa.
4) data-contracts: alan/enum/yetki (RBAC: süper yönetici vs şube yöneticisi sınırları).

== SINIRLAR (Uyanık Koç kuralları) ==
• Marka her yerde "Uyanık Koç". AI Koç "Yakında".
• CRM ayrı yüzeydir; admin paneli CRM verisine/dosyalarına dokunmaz.
• RBAC: süper yönetici (tüm kurumlar) ↔ şube yöneticisi (kendi şubesi) ayrımını netleştir.
• Veri uydurma; eksik/kararsız alanları RISKS bölümünde açıkça listele, kendi başına icat etme.

== İSİMLENDİRME / ÇIKTI ==
• exports/yonetim/<viewport>-<tema>/<route>.png
• handoff/SADAKAT-SPEC-yonetim-<ekran>.md · src/admin-*.jsx · data-contracts/admin-*.json
• Klasör yapısı korunmuş tek .zip.
```

---

## Notlar
- Prod'da admin için zaten `apps/web/app/yonetim/*` + `styles/uk-admin.css` iskeleti var;
  tasarım geldiğinde bunları birebir hizalarız (web panelinde yaptığımız gibi).
- En kritik çıktı yine **SADAKAT-SPEC'leri** (ton/sıra/etiket sapmalarını yakalatıyor).
