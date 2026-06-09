# HANDOFF_CONTRACT.md

Bu dosya, **Claude Design** (tasarım üretici) ile **Codex / Claude Code** (kod üretici) arasındaki teslim sözleşmesidir. Her iki taraf da bu dosyayı tek kaynak olarak kabul eder. "Ne verilir / ne verilmez" buradan netleşir. Bu sözleşmeye uymayan teslim **reddedilir ve yeniden yapılır**.

Marka: Uyanık — lacivert `#1F3864`, turuncu `#E08A2B`.
Hedef stack: Metronic v9 tabanlı, React 19 + TypeScript + Vite + Tailwind v4, `@mansis/api-client-ts` + react-query.

---

## 0. Temel kurallar (her iki taraf)

1. **Sadece en güncel versiyon.** `v1`, `old`, `draft`, `copy`, `yedek`, `eski` gibi isimli hiçbir dosya teslime girmez.
2. **Belirsizse son değiştirilme tarihine göre seç**, ve neden seçildiğini manifest'e yaz.
3. **Eksik teslim yasak.** Bir öğe eksikse teslim durdurulur ve raporlanır; yarım paket geçmez.
4. **Scope dışı üretim yasak.** Spec'te olmayan ekran/component/renk uydurulmaz.
5. **Tek doğruluk kaynağı token'lardır.** Renk/spacing/tipografi hiçbir yerde hardcode edilmez.

---

## 1. Claude Design → TESLİM ETMESİ GEREKENLER

```
_handoff/
├── manifest.json
├── tokens/
│   ├── colors.json
│   ├── typography.json
│   └── spacing.json
├── components/
│   └── <Component>.spec.md
├── screens/
│   └── <Screen>/
│       ├── desktop.png
│       └── mobile.png
├── assets/
│   ├── icons/
│   └── images/
└── README.md
```

### manifest.json (zorunlu — paketin omurgası)
Her öğe için: dosya adı, versiyon, son değiştirilme tarihi, tür.
```json
{
  "generated_at": "2026-06-10T12:00:00+03:00",
  "brand": { "lacivert": "#1F3864", "turuncu": "#E08A2B" },
  "items": [
    { "path": "tokens/colors.json", "type": "token", "version": "1.4", "modified": "2026-06-09" },
    { "path": "components/Button.spec.md", "type": "component", "version": "2.1", "modified": "2026-06-10" },
    { "path": "screens/Dashboard/desktop.png", "type": "screen", "version": "3.0", "modified": "2026-06-10" }
  ],
  "excluded": [
    { "path": "screens/Dashboard/desktop_v1.png", "reason": "eski versiyon" }
  ]
}
```

### tokens/
- `colors.json`: marka renkleri + tüm scale (50–900), semantic isimler (primary, danger, surface...).
- `typography.json`: font ailesi, size, weight, line-height, letter-spacing.
- `spacing.json`: spacing skalası, radius, shadow, z-index.
- **Kural:** kod bu dosyalardan türetilir; tasarım da bunlara uyar. Çatışma olursa token kazanır.

### components/<Component>.spec.md
Her component için zorunlu içerik:
- Tüm state'ler: `default / hover / active / focus / disabled / error / loading`
- Props ve değerleri
- Ölçüler (padding, height, radius) — token referansıyla (örn. `radius-md`, sayı değil)
- Metronic karşılığı (varsa hangi Metronic component'inden türediği)

### screens/<Screen>/
- `desktop.png` + `mobile.png` (responsive breakpoint'ler zorunlu)
- Optimize edilmiş (her biri makul boyutta, 5MB+ ham export yasak)

### assets/
- `icons/`: SVG, optimize (gereksiz metadata temizlenmiş)
- `images/`: doğru format (foto → webp/jpg, grafik → png/svg), gerekiyorsa @1x/@2x

### README.md
- Paketin nasıl kullanılacağı
- Token → Tailwind/CSS eşlemesi
- Metronic component eşleme tablosu

---

## 2. Claude Design → TESLİM ETMEMESİ GEREKENLER

- ❌ Eski versiyonlar (`v1`, `old`, `draft`, `copy`, `yedek`)
- ❌ Kaynak tasarım dosyaları (`.fig` ve raw export'lar) — Codex okuyamaz, paketi şişirir
- ❌ Optimize edilmemiş dev PNG'ler
- ❌ Kullanılmayan / terk edilmiş ekran ve component'ler
- ❌ `node_modules`, cache, `.DS_Store`, geçici dosyalar
- ❌ Manifest'te yer almayan hiçbir dosya

---

## 3. Codex / Claude Code → ÜRETTİĞİ KODDA OLMASI GEREKENLER

```
admin-web/src/
├── styles/tokens.css            # tokens/*.json'dan türetilmiş CSS değişkenleri
├── components/ui/<Component>.tsx
└── ... (mevcut yapıya uygun)
```

- **Token bağlılığı:** renk/spacing/tipografi yalnız CSS değişkeni veya Tailwind config üzerinden. `#1F3864` gibi hardcode **yasak**.
- **State tamlığı:** component'in tüm state'leri spec'teki listeyle birebir eşleşir.
- **Mevcut pattern korunur:** `@mansis/api-client-ts` + react-query binding'leri bozulmaz.
- **Dosya yerleşimi mevcut yapıya uyar**, yeni klasör icat edilmez.

---

## 4. Codex / Claude Code → ÜRETMEMESİ GEREKENLER

- ❌ Spec'te olmayan ekstra component/sayfa (scope dışı)
- ❌ Tasarımdan kopuk yeni renk/spacing/font değeri uydurmak
- ❌ `_handoff/` içindeki kaynak dosyaları repo'ya kopyalamak
- ❌ Çalışan mevcut API binding'lerini yeniden yazmak
- ❌ Hardcode stil değerleri

---

## 5. Teslim öncesi DOĞRULAMA (her iki taraf çalıştırır)

**Claude Design teslimden önce:**
1. Planlanan her öğeyi manifest ile eşleştir.
2. Eksik veya eski versiyon varsa **DUR**, raporla, paketi gönderme.
3. Manifest'i Mustafa'ya göster, onay al, sonra paketle.

**Codex / Claude Code üretimden önce:**
1. `manifest.json` oku — eksik öğe varsa dur, sor.
2. Token dosyalarını CSS/Tailwind'e bağla, hardcode taraması yap.
3. Üretilen her component'i spec state listesiyle karşılaştır.
4. Scope dışı hiçbir şey üretme; spec'te olmayanı sorarak netleştir.

---

## 6. Ret koşulları (teslim otomatik reddedilir)

- Manifest yok veya eksik
- Eski versiyon paket içinde
- Responsive (mobile/desktop) eksik
- Component state'leri eksik
- Hardcode renk/spacing tespit edildi
- Scope dışı dosya üretildi
