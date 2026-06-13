# RISKS & GAPS — Yönetim Paneli (sınırlar + uydurma riski)

Bu prototip **tasarım doğruluk kaynağıdır**; aşağıdaki sınırlar gerçek koda geçişte korunmalıdır.
Eksik/belirsiz bir şey görürsen **kendin icat etme — bu listeye ekle ve sor.**

## Kesin sınırlar (DEĞİŞTİRME)
1. **Marka sabit: "Uyanık Koç".** Logo/isim/marka rengi (`#534AB7`) prototiple aynı. Yeni marka adı üretme.
2. **AI Koç = "Yakında".** `aiKoc` modülü plan kataloğunda var ama ürün yüzeyi **henüz aktif değil**;
   "Yakında" olarak işaretli kalır. Aktif AI Koç akışı/ekranı tasarlama.
3. **CRM'e dokunma.** Demo & Üyelikler (leads) ekranı yalnızca panel-içi lead listesi/durumudur;
   harici CRM entegrasyonu, satış hunisi otomasyonu vb. **kapsam dışı** — ekleme.
4. **Veri uydurma yok.** Yeni metrik, kart, kolon, ekran, modül veya alan **icat etme**.
   Ekran seti `handoff/EKRANLAR.md` ile kapalıdır; veri modeli `data-contracts.md` ile sınırlıdır.

## Bilinen boşluklar / netleştirilecekler (backend'e geçişte)
- **RBAC zorlaması simülasyon.** Prototipte mod switcher serbest geçiş verir; gerçekte kurum
  yöneticisi yalnızca kendi kurumunu görür, modlar arası geçiş **yetkiyle** sınırlıdır (data-contracts §1).
- **Modül paketi tek yönlü.** Kurum yöneticisi modül açamaz; süper admin atar (UI bunu yansıtır,
  backend zorlamalı).
- **Ödeme/checkout simüle.** `billing-checkout` gerçek ödeme sağlayıcıya bağlanmalı (iyzico/Stripe vb.).
- **Şube modeli kurum altında.** Süper Admin'de şube ayrı sayfa değil; kurum detayının alt bilgisidir
  (`kurum-detay`). Şube CRUD'u Kurum modunda (`k-subeler`).
- **Lisans yenileme/durum geçişleri** (active→expiring→overdue) prototipte tarih-türevli; backend'de
  cron/faturalama olayına bağlanmalı.
- **Demo veri tohumu** gerçek değildir (KAMPÜS, Zirve, Hedef Akademi vb. örnek kurumlardır) —
  production seed/migration ayrı tanımlanmalı.

## Kapsam dışı / ölü kod (PORT ETME)
`admin/kurum-pages.jsx`, `kurum-pages2.jsx`, `solo-pages.jsx`, `super-pages.jsx`, `super-pages2.jsx`,
`super-pages3.jsx` — eski veri modeli (`CURRENT_KURUM`/`BRANCHES`); hiçbir kanonik HTML yüklemez.
**Bu paketin admin/ klasöründe bunlar yoktur**; canlı repo'da görürsen yok say.

## Tasarım doğruluk kaynağı (KORU)
`src/styles.css` + `tokens.json` (web ile ORTAK, açık+koyu) · `admin/admin.css` (panel sınıfları:
`.mode-seg`, `.meter*`, `.lic-hero*`, `.org-logo`, `.alert-strip`, `.switch`, `.fb-card`, `.task-row`).
Override deseni: bileşen en son `admin-extra2/3/4.jsx`'te tanımlanmışsa **o** esastır (EKRANLAR.md'de işaretli).
