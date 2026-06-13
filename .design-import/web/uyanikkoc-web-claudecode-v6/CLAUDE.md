# CLAUDE.md — Uyanık Koç Web Uygulaması (Claude Code için kalıcı talimatlar)

Bu paket, **çalışan bir tasarım prototipidir** ve senin görevin onu **birebir (1:1)
gerçek bir production koduna taşımaktır**. Yeni tasarım YAPMA — tasarım/UX kararları verildi.

## 🔴 TÜRKÇE KARAKTER KURALI (en sık yapılan hata — önce bunu oku)
**TÜM kullanıcı-yüzü metinleri TAM Türkçe'dir; diakritikleri ASLA ASCII'ye düşürme.**
`ç ğ ı İ ö ş ü` ve büyükleri (`Ç Ğ İ Ö Ş Ü`) **aynen** kullanılır.

- Doğru: `Günaydın`, `görevin`, `Çalışma`, `sınıf`, `Öğrenci`, `Koç`, `müfredat`, `öğretmen`.
- YANLIŞ: `Gunaydin`, `gorevin`, `Calisma`, `sinif`, `Ogrenci`, `Koc`, `mufredat`, `ogretmen`.
- UI string'lerini **`src/*.jsx` içinden birebir kopyala** — yeniden yazma, sadeleştirme yapma.
- ⚠️ `manifest.txt`, eski `README` ve HTML başlığındaki ASCII yazım **yalnızca araç/path kısıtı**
  yüzündendir (dosya adlarında Türkçe karakter olmasın diye). Bu ASCII stili **arayüz metinlerine
  ASLA sızdırılmaz.** Arayüzün doğruluk kaynağı `.jsx` dosyalarındaki metinlerdir, belgeler değil.
- Tüm dosyalar **UTF-8**; her HTML `<head>`'inde ilk satır `<meta charset="UTF-8">` olmalı.
  API/JSON yanıtlarında `Content-Type: ...; charset=utf-8` ver.
- Türkçe "i" tuzağı: arama/slug/eşleştirme için `toLocaleLowerCase('tr-TR')` ya da locale-bağımsız
  karşılaştırma kullan; DB collation `utf8mb4_turkish_ci` / `tr_TR`.

## 🔴 SADAKAT KURALI — düzen/sıra birebir
Hero başlığı, rozet, kart düzeni ve **grid sırası** prototiple aynı olmalı. Sapma = hata.
Ekran-bazlı kesin yerleşim için: **`handoff/SADAKAT-SPEC-ogrenci-dashboard.md`**.
Diğer ekranları kodlamadan önce ilgili `.jsx`'i açıp yapıyı (grid sınıfları, kart sırası,
metinler) birebir izle; bileşen sırasını değiştirme, kart ekleyip çıkarma.

## Bu paket tek doğruluk kaynağıdır
- Görsel/etkileşim referansı: `uyanik-koc-dashboard.html` (tarayıcıda aç, davranışı incele).
- Tasarım sistemi (renk/tipografi/spacing/gölge/radius): `src/styles.css` `:root` + `[data-theme=dark]`
  ve **`tokens.json`** (ikisi birebir aynıdır — bkz. `VALIDATION.md`). Yeni token/renk ÜRETME.
- İş mantığı: `src/*.jsx` içindeki store fonksiyonları (`let _state` + `localStorage` + listener + `useXxx()`).

## Mutlak kurallar
1. **Yeni ekran/sayfa/akış/bileşen tasarlama.** Envanter kapalıdır — bkz. `handoff/README.md`.
   Eksik/yarım gördüğün bir şey olsa bile kendi başına icat etme; **sor**.
2. **UI'ı birebir uygula:** layout, bileşen yapısı, Türkçe metinler, renkler, boşluklar,
   durumlar (hover/aktif/boş/yükleniyor), modal akışları, açık+koyu tema.
3. **Davranışı store'lardan taşı:** durum geçişleri, hesaplamalar (net, hata frekansı,
   spaced-repetition `nextDue`), filtreler — hepsi `src/*.jsx` içinde izole. Birebir port et.
4. **Mimariyi tek başına değiştirme.** Hedef mimari `handoff/TEKNIK-REHBER-ve-VERI-MODELI.md`
   içindedir; sapma gerekiyorsa önce öner.

## Hedef mimari (özet — detay teknik rehberde)
- Şu an: tek HTML + tarayıcı-içi Babel ile ~55 `<script type="text/babel">`. Production değil.
- Öneri: **Vite + React** (hızlı SPA) veya **Next.js** (tam ürün: API + DB + auth + push).
- `Object.assign(window,{...})` → ES `import/export`. Store deseni → Zustand/Context + React Query.
- `localStorage` → REST/GraphQL + DB (Prisma/Postgres). Anahtar→tablo eşlemesi teknik rehberde.

## Çalıştırma (prototip)
`uyanik-koc-dashboard.html` dosyasını tarayıcıda aç (React/Babel CDN için internet gerekir).
Giriş ekranında rol seç → "Demo bilgileriyle doldur" → "Giriş Yap".
Demo: Öğrenci `elif@uyanikkoc.com` · Koç `dilek@uyanikkoc.com` · Veli `ayse@uyanikkoc.com`.
Tüm durum `localStorage`'da kalıcıdır.

## Belge sırası (önce oku)
1. `handoff/README.md` — ekran/rota envanteri + dosya haritası + mimari.
2. `handoff/TEKNIK-REHBER-ve-VERI-MODELI.md` — veri modelleri + store API + **build rehberi**.
3. `VALIDATION.md` — token paritesi doğrulaması.
