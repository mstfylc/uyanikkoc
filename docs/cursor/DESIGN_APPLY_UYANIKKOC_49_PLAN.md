# Design Apply — uyanikkoc-mobil-source-v3 (Aşama 3: Mobil)

**Kaynak:** `uyanikkoc-mobil-source-v3` (kanonik). React Native / Expo (`apps/mobile`).
Token'lar web ile ortak marka (#534AB7); primary tonları + dark nötrler mobil-kanonik (OLED, kasıtlı).
**Tarih:** 2026-06-10 · **Branch:** `claude/youthful-turing-r4dx7y`

## 1. Token foundation (uygulandı)

Canlı `apps/mobile/src/lib/theme.ts` kaynak palete hizalandı (drift kapandı):
- `muted` #767A90 → **#6B6F85** · `primary600` #463DA6 → **#47409D**
- soft renkler: success/warning/danger/info-soft kaynak değerlerine çekildi
- Tam `palette` (light + **dark**) + semantik token seti eklendi (surface2/3, borderStrong, text2, ring, primary300/700, glow, onPrimary). `ukColors` geriye dönük uyumlu, değerler `palette.light`'tan türetiliyor.
- Doğrulama: mobile typecheck ✓ · lint ✓.

## 2. Yapısal denetim — 3 rol (kaynak) vs canlı

Canlı `apps/mobile` **yalnız ÖĞRENCİ rolünü** içeriyor (`auth.tsx: role: "student"` sabit).

| Rol | Kaynak (v3) | Canlı | Durum |
|-----|-------------|-------|-------|
| **Öğrenci** | 5 tab (home/odevler/denemeler/program/profil) + 6 sub | 5 tab + 5 sub | ~VAR · **`destek` sub eksik** |
| **Veli** | 5 tab (Ana/Ödevler/Denemeler/Raporlar/Profil) + quick-access (mesaj/randevu/ödeme) | — | **TAMAMEN EKSİK** |
| **Koç** | 5 tab (Bugün/Öğrenciler/Mesajlar/Program/Profil) + derin akışlar (öğrenci detay, deneme/ödev atama, duyuru, görevler) | — | **TAMAMEN EKSİK** |

### Öğrenci sub karşılaştırma
Canlı: appointments, messages, motivation, resources, topics → **eksik: `support` (Destek)**.

## 3. Boşluk büyüklüğü

- **Öğrenci `destek` sub:** küçük, tekil ekran.
- **Veli rolü:** yeni rol kabuğu + 5 tab + 3 quick-access ekran + veri/API bağlama.
- **Koç rolü:** yeni rol kabuğu + 5 tab + ~5 derin akış (uk-coach2..5) + veri/API bağlama.
- Ayrıca mobil auth rol modeli (`role: "student"` sabit) genişletilmeli; veli/koç için mobil API'ler (`/api/mobile/*`) gerekebilir.

> Veli + Koç mobil uygulamaları, canlı mobil yüzeyin ~2/3'ünü oluşturan **devasa net-yeni inşa**.
> Bu, "gap doldurma"dan öte ayrı bir proje; RN olduğu için sandbox'ta görsel doğrulama da sınırlı.
> Uygulama scope'u/sırası kullanıcı kararına bırakıldı.

## Durum

- Token paritesi: **tamam** (drift kapandı, dark eklendi).
- Öğrenci yüzeyi büyük ölçüde hizalı (1 sub eksik).
- Veli + Koç rolleri eksik → büyük inşa, scope onayı bekliyor.
