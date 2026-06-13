# QA EKRAN GÖRÜNTÜSÜ — CAPTURE ALTYAPISI + DEVTOOLS REÇETESİ

PNG'ler **yalnızca QA referansıdır**; doğruluk kaynağı `src/*.jsx`. Bu belge, herhangi bir
ekranı/modalı **deterministik** olarak (light/dark × desktop/mobile) yakalamanın reçetesidir.

## 0) Rol/sayfa/tema'yı koddan sürme (localStorage sürücüsü)
Uygulama durumu `localStorage`'da: `uk_auth_v1` (giriş), `uk_role`, `uk_page_<role>`, `uk_theme`.
DevTools Console'a yapıştır → sayfayı **doğrudan** istenen ekrana boot eder:

```js
// rol: 'student' | 'coach' | 'parent'  ·  page: rota anahtarı  ·  theme: 'light' | 'dark'
function ukGo(role, page, theme='light'){
  saveAuth({ ...DEMO_USERS[role], remember:true });
  localStorage.setItem('uk_role', role);
  localStorage.setItem('uk_page_'+role, page);
  localStorage.setItem('uk_theme', theme);
  location.reload();
}
// örnek:
ukGo('coach','c-topics','light');
```

> ⚠️ **ÖNEMLİ — boot-direct kullan, sayfa-içi gezinme ile yakalama.** Ağır modüller
> (özellikle `KonuCizelge` = c-cizelge) sayfa-içi geçişte DOM'da "yapışıp" yanlış kare
> verebilir; ayrıca sidebar aktif vurgusu geçiş anında bayatlayabilir. Her kare için
> `ukGo(...)` ile **tek sayfaya boot et**, reload bitince yakala. Böylece içerik + sidebar
> aktif vurgusu + crumb tutarlı olur.

Sayfa-içi (reload'suz) hızlı gezinme gerekiyorsa (yalnızca hafif sayfalar):
```js
window.dispatchEvent(new CustomEvent('uk-nav',{ detail:{ page:'exams' }}));
```

## 1) Tam-sayfa (kırpılmamış) PNG — Chrome DevTools
1. Hedef ekrana `ukGo(...)` ile gel.
2. DevTools aç (F12) → **Cmd/Ctrl+Shift+P** → **"Capture full size screenshot"**.
   (Tüm scroll yüksekliğini tek PNG'ye alır — bu projedeki uzun sayfalar için doğru yöntem budur.)

## 2) Tema — light + dark
`ukGo(role,page,'light')` ve `ukGo(role,page,'dark')`. Tema `data-theme` + CSS değişkenleriyle
çalışır; dark token-sürücülü olduğu için layout değişmez (ikincil öncelik).

## 3) Viewport — desktop 1440px / mobile 390px
DevTools **Device Toolbar** (Cmd/Ctrl+Shift+M) → genişlik gir:
- **desktop:** 1440 (sidebar görünür)
- **mobile:** 390 (sidebar gizlenir, alt navigasyon `.bottom-nav` görünür — `< 760px` kırılımı)
Mobilde layout farklı olduğu için **Ana Sayfa / Ödevler / Yanlış Defteri / Denemeler** kilit ekranları değerlidir.

## 4) Modal yakalama (açık halde)
Önce ilgili sayfaya boot et, sonra tetikleyiciyi Console'dan veya elle aç, sonra full-size capture.
| Modal | Sayfa (ukGo) | Açma |
|---|---|---|
| Ödev Ata | coach · c-assignments | "Ödev Ata" butonu (`.btn-primary`) |
| Akıllı Ödev | coach · c-assignments | "Akıllı Ödev" (`.btn-smart`) |
| Yanlış ekle | student · mistakes | "Yanlış ekle" |
| Toplu yanlış→defter | student · assignments | ödev sonucu gir (D/Y/B) |
| Odak Tekrar | student · mistakes | "Odak tekrar" |
| Koç notu | coach · c-assignments | tamamlanan ödevde "Not gönder" |
| Grup oluştur | coach · messages | "Grup oluştur" |
| Randevu iste | student · appointments | "Randevu İste" |
| Deneme içe aktar | coach · c-exams | "Deneme İçe Aktar" |
| Deneme oluştur/kayıt | student · exams | "Denemeye kayıt ol" / "Sonuç gir" |
| Manuel deneme | coach · c-exams | "Manuel Giriş" |
| Optik form | student · exams → Online | online denemeyi çöz |
| Öğrenci/Çocuk ekle | coach · students | "Öğrenci ekle" |

## 5) İsimlendirme (zorunlu)
`exports/<rol>/<viewport>-<tema>/<route|modal>.png`
- örn. `exports/coach/mobile-dark/c-topics.png`, `exports/student/desktop-light/smart-odev-modal.png`

## 6) Topbar rol "pill" doğruluğu
Aktif rol topbar'da `.seg.tb-roles button.on` ile vurgulanır (beyaz zemin + gölge + primary metin).
Bu prototipte **doğru çalışır** — gerçek koda taşırken `.seg button.on` stilini birebir uygula ki
aktif rol yanlış/çift vurgulanmasın.

## 7) Bilinen capture artefaktı (bu repo'daki otomatik kareler)
`exports/` altındaki hazır kareler tarayıcı-içi araçla alındı. Bazı sayfa-içi gezinmeli karelerde
**sidebar aktif vurgusu içerikle anlık uyuşmayabilir** (yakalama-zamanlaması yarışı; canlı app doğru).
Kesin/temiz kare için yukarıdaki **boot-direct + DevTools full-size** yöntemini kullan.
