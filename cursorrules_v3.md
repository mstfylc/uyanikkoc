# Uyanık Koç — Cursor Kuralları

## Proje kimliği
- Uygulama adı: **Uyanık Koç** (kullanıcıya görünen her yerde)
- Ana marka: **Uyanık Kütüphane**
- Eski belgelerde "SınavKoç" geçebilir — yok say, "Uyanık Koç" kullan

---

## Değişmez kararlar

| Konu | Karar |
|------|-------|
| CRM | Tamamen ayrı sunucu, ayrı DB — hiçbir dosyasına dokunma |
| AI Koç | `AI_COACH_ENABLED=false` — OpenAI çağrısı yazma |
| Şube/franchise | Şemada hazır, UI'da `SINGLE_BRANCH_MODE=true` — şube UI yazma |
| Mobil | `apps/mobile` placeholder — içine kod yazma |
| Auth | NextAuth/Auth.js — başka yöntem ekleme |
| DB | Prisma + PostgreSQL — sorgu doğrudan component'e yazılmaz |
| Validation | Zod — her input/output için zorunlu |
| Ortak mantık | `packages/shared` içine yaz — component'e gömme |

---

## ⛔ Sert kurallar — hiçbir istisnası yok

### 1. Dosya limiti
Bir görevde **maksimum 8 dosya** değiştirilir.
Test, config, sayfa dahil hepsi sayılır.
8'i geçeceksen görevi böl, onay iste. Devam etme.

### 2. Mock/memory data yeri
Yalnızca `apps/web/mocks/` veya `apps/web/fixtures/` altında.
`lib/memory/`, `lib/fake/`, `lib/demo/` gibi klasörler yasaktır.
**Mevcut `apps/web/lib/memory/` → ilk uygun fazda `apps/web/mocks/` altına taşı.**

### 3. CRM izolasyonu
`CRM_DATABASE_URL` kullanma. CRM dosyalarına dokunma.
Bağlantı yalnızca `CrmLink` bridge tablosu ve readonly alanlar.

### 4. Server component güvenliği
`window`, `document`, `localStorage`, `KTApp`, `KTMenu` server component içinde yasak.
Metronic JS init: yalnızca `"use client"` + `useEffect`.

### 5. Rol güvenliği
Rol kontrolü sadece UI'da yapılmaz.
`lib/auth/api-guard.ts` her API route'da zorunlu.

---

## Klasör yapısı

```
apps/web          → Next.js 14 App Router (ana geliştirme)
apps/mobile       → Placeholder — dokunma
apps/worker       → Sonraki faz
packages/shared   → net, risk, streak hesaplamaları
packages/contracts → Zod sözleşmeleri
packages/database  → Prisma client
packages/tokens   → Renk/rol tokenları
packages/ui-web   → Ortak web UI
```

---

## Metronic v9.4.13 Tailwind — kullanım

**Versiyon:** Metronic v9 Tailwind HTML Demo1
**Kaynak:** `C:\Users\musta\Downloads\themeforest-rHhO3AmH-metronic-responsive-admin-dashboard-template\metronichtml\`

**Asset konumları (kopyalandıktan sonra):**
```
/assets/metronic/css/core.bundle.css    (~53 KB)
/assets/metronic/css/styles.css         (~494 KB)
/assets/metronic/js/core.bundle.js      (~680 KB)
/assets/metronic/js/layouts/demo1.js
```

**HTML yapısı referansı:**
```
Dashboard: dist/html/demo1/dashboards/dark-sidebar.html
Login:     dist/html/demo1/authentication/branded/sign-in.html
```

**İkon sistemi:** `<i className="ki-outline ki-{name} text-{size}x" />`
Örnek: `<i className="ki-outline ki-home-2 text-2xl" />`

**KTApp init:**
```typescript
// hooks/useMetronic.ts — "use client" + useEffect içinde
setTimeout(() => {
  if (window.KTApp) window.KTApp.init()
}, 100)
```

**Tailwind NOT:** Metronic v9'un derlenmiş CSS'i kullanılır (`styles.css`).
Projeye ayrıca `tailwind.config` veya `@tailwind` directive ekleme.
Tailwind sınıfları styles.css içinde hazır gelir.

---

## Demo kullanıcılar

Şifre: `uyanik123`

| Email | Rol |
|-------|-----|
| admin@uyanik.local | admin |
| branch@uyanik.local | branch |
| coach@uyanik.local | coach |
| student@uyanik.local | student |
| parent@uyanik.local | parent |

---

## Env değişkenleri

```
DEMO_AUTH_ALLOW_IN_MEMORY=true   → memory/mocks (test/dev)
DEMO_AUTH_ALLOW_IN_MEMORY=false  → Prisma/PostgreSQL (production)
AI_COACH_ENABLED=false           → asla true yapma
SINGLE_BRANCH_MODE=true          → asla false yapma
```

---

## Şu anki öncelik sırası

```
1. lib/memory/ → mocks/ taşıma (kural düzeltme)
2. Metronic asset kopyalama + root layout
3. AppLayout + Sidebar + Header
4. Login sayfası + 3 dashboard UI
5. Supabase bağlantısı
6. Vercel deploy (uyanikkoc.com)
7. İç test
─────────────────────── (henüz sırada değil)
8. AI Koç chat
9. Ödeme sistemi
10. Native mobil
11. Admin paneli
12. Franchise UI
```

---

## Her görev sonu rapor

```
Değişen dosyalar: [liste — 8'i geçmemeli]
pnpm typecheck: ✓/✗
pnpm lint: ✓/✗
pnpm test:unit: ✓/✗
Demo akış çalışıyor mu: ✓/✗
CRM etkilenmedi mi: ✓
AI flag dokunulmadı mı: ✓
Bilinen eksikler: [varsa]
```

---

## Yasaklar

```
✗ CRM okuma/yazma/import
✗ AI_COACH_ENABLED=true
✗ OpenAI API çağrısı
✗ 8'den fazla dosya değiştirme
✗ Mock data lib/ altına koyma
✗ Prisma sorgusu doğrudan component'e
✗ Rol kontrolü sadece UI'da
✗ Server component içinde window/document
✗ apps/mobile içine kod
✗ Yeni dependency gerekçesiz ekleme
✗ Metronic için ayrıca tailwind.config kurma
```
