# QA EKRAN GÖRÜNTÜSÜ — CAPTURE ALTYAPISI + DEVTOOLS REÇETESİ (Yönetim Paneli)

PNG'ler **yalnızca QA referansıdır**; doğruluk kaynağı `admin/*.jsx` + `SADAKAT-SPEC-*.md`.

## 0) Mod/sayfa/tema sürücüsü (boot-direct)
Durum `localStorage`'da: `uk_admin_mode`, `uk_admin_pages` (JSON `{mod:sayfa}`), `uk_theme`.
DevTools Console'a yapıştır → istenen ekrana **doğrudan** boot eder:

```js
// mode: 'superadmin' | 'kurum' | 'coach'  ·  page: rota anahtarı  ·  theme: 'light' | 'dark'
function ukAdminGo(mode, page, theme='light'){
  localStorage.setItem('uk_admin_mode', mode);
  const p = JSON.parse(localStorage.getItem('uk_admin_pages')||'{}'); p[mode]=page;
  localStorage.setItem('uk_admin_pages', JSON.stringify(p));
  localStorage.setItem('uk_theme', theme);
  location.reload();
}
// örnek: ukAdminGo('superadmin','kurumlar','light');  ukAdminGo('kurum','k-dashboard','dark');
```
> Detay sayfaları (kurum-detay/koc-detay/k-coach-detay/k-student-detay) bir karttan/tablodan
> drill-in ile açılır; boot sonrası ilgili listede satıra tıkla.

## 1) Tam-sayfa PNG — Chrome DevTools
Ekrana `ukAdminGo(...)` ile gel → DevTools (F12) → Cmd/Ctrl+Shift+P → **"Capture full size screenshot"**.

## 2) Tema (light + dark) · 3) Viewport (desktop 1440 / mobile 390)
Tema: `ukAdminGo(mode,page,'dark')`. Viewport: DevTools Device Toolbar (Cmd/Ctrl+Shift+M) → 1440 / 390.
390px'te topbar mod switcher ikon-only olur, hamburger menü açılır (admin.css responsive — VERSION.md).

## 4) İsimlendirme
`exports/yonetim/<viewport>-<tema>/<route>.png` — örn. `exports/yonetim/desktop-light/kurumlar.png`,
`exports/yonetim/desktop-dark/k-dashboard.png`.

## 5) Bu repodaki curated set
`exports/yonetim/desktop-light/` ve `desktop-dark/` altında temsilî ekranlar (tüm modlardan).
Tam matris (her rota × light/dark × desktop/mobile) yukarıdaki reçeteyle üretilir.

## 6) Bilinen araç sınırı
Tarayıcı-içi html-to-image, `createPortal`+`position:fixed` **modalleri** yakalayamaz (açık modal
yerine sayfayı alır) ve **mobil** medya sorgularını otomasyonda tetikleyemez. Modal/mobil kareler için
**gerçek Chrome DevTools** kullan (yukarıdaki yöntem). Sayfa-içi gezinmede sidebar aktif vurgusu
bayatlayabilir; kesin kare için her zaman **boot-direct** kullan.
