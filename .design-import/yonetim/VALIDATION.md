# DOGRULAMA RAPORU — Yonetim Paneli

Paket: `uyanikkoc-admin-source-v4` · Tarih: 2026-06-10
Yontem: canli prototip 3 modda gezilerek (window.__adminNav) her ekran render +
konsol hatasi acisindan tarandi; token'lar styles.css'ten parse edilip karsilastirildi.

## [x] CSS token sayisi = tokens.json, degerler ayni
- `src/styles.css` `:root` token sayisi: **38** · `tokens.json` (light): **38**
- Uyumsuzluk: **yok** · dark override: **31**, eslesme tam.
- admin.css `:root` token TANIMLAMAZ — tasarim sistemi token'larini ORTAK kullanir.

## [x] Marka token'i web uygulamasiyla tutarli
- `--primary` (light) = **#534AB7** (web ile ayni). `tokens.json` web v5 ile birebir.

## [x] Iki+ rolun tum ekranlari HTML'de mevcut (gercekte 3 mod)
Canli tarama sonucu (paket HTML'i, temiz localStorage):
- **Super Admin (13 ekran):** genel, kurumlar, lisanslar, koclar, gelir, raporlar,
  talepler, kampanyalar, lisans-turleri, moduller, destek, ayarlar, profile — hepsi render, **cokme yok**.
- **Kurum Yoneticisi (11 ekran):** k-dashboard, k-koclar, k-ogrenciler, k-subeler,
  k-lisans, k-gelir, k-paketler, k-raporlar, k-yoneticiler, k-ayarlar, profile — **cokme yok**.
- **Bireysel Koc (6 ekran):** bk-lisans, bk-feedback, bk-planlar, bk-paketler,
  bk-faturalar, profile — **cokme yok**.
- **Detay/drill-in (4):** kurum-detay, koc-detay, k-coach-detay, k-student-detay — calisir.
- Onceki bozuk kok HTML'de coken 4 ekran (SAReports, SAPlans, KurumPackages,
  CoachPackages) bu pakette **render oluyor** (dogrulandi).

## [x] Calismayan buton / eksik ekran / aktif olmayan sayfa kontrolu
- Tum menu ogeleri bir ekrana baglidir (MODES.items <-> renderPage tam eslesir).
- Org karti, "Yonet", filtre, arama, mod switcher, tema, profil, hamburger calisir.
- Bos/aktif olmayan sayfa bulunmadi.

## Mobil uyumluluk (390px'te dogrulandi)
- Topbar yatay tasma: **yok** (mode-seg ikon-only; scrollWidth=clientWidth).
- Yan menu: hamburger gorunur (display:grid), tiklayinca sidebar aciliyor (transform:none,
  left:0), 12 nav ogesi erisilebilir.
- Icerik ekranlari (genel/kurumlar/gelir/raporlar/talepler): yatay tasma **yok**.
- Web-app'ten miras 96px alt bosluk panelde 40px'e cekildi (bos alan giderildi).

## [x] Ciplak/rastgele renk yok (tasarim sistemi)
- Tasarim-sistemi CSS'i (styles.css, billing.css, admin.css) **tamamen token tabanli**.
  `.lic-hero.warn/.danger/.info` ciplak hex gradyanlari token'a baglandi.
- Geriye kalan literal renkler **veridir, token degil** ve kasitlidir:
  (a) kurum kimlik renkleri + marka-rengi secici paletleri (org.tone, ORG_TONES,
      PLAN_COLORS) — kullanicinin sectigi kuruma-ozel kimlik renkleri;
  (b) ucuncu taraf entegrasyon marka renkleri (Meta #1877F2, Google #EA4335,
      Jotform #FF6100) — resmi marka renkleri, degismemeli.
  Bunlar tasarim token'i degildir; semantik token kapsamina girmez.

## [x] Eski surumler "eski" isaretli, kanonik net
- `VERSION.md`'de tablo halinde; kanonik = `uyanikkoc-admin-source-v4`.
- 6 olu dosya (kurum-pages*, solo-pages, super-pages*) pakete alinmadi, belgelendi.

## [x] Hicbir path'te bosluk / Turkce karakter yok (ASCII)
- Tum klasor/dosya adlari ASCII; HTML adi `uyanik-koc-yonetim-paneli.html`.

## Acik not — z-index
- z-index token degil; literal (topbar 20, sidebar 30/210, modal 100, toast 120,
  sidebar-backdrop 200, bottom-nav 150). `tokens.json > zindex` altinda belgeli.
