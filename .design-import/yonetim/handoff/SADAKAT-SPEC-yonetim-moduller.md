# SADAKAT SPEC — Süper Admin · Modül Bayrakları (moduller)

Kaynak: `admin/superadmin2.jsx → SAModules`. Mod: `superadmin`, sayfa `moduller`.
Veri: `useAdmin().orgs`, `MODULES` (feature flags), `toggleOrgModule`. Tam Türkçe.

## PageHead
- Başlık **`Modül Bayrakları`** · alt **`Hangi kurumda hangi özelliğin açık olduğunu tek tabloda yönet`** (aksiyon yok)

## Bileşen sırası
1. **`Section` — `Kurum × Modül matrisi`** · alt **`Hücreye tıklayarak ilgili kurumun modülünü aç/kapat`**:
   tablo `.tbl` (min-width 880) — satır = kurum (OrgLogo + ad + plan), kolonlar = her `MODULES` öğesi.
   Hücre = aç/kapa ikon-buton: açık → yeşil check (`success-soft`), kapalı → 45° döndürülmüş plus (faint).
   Tıkla → `toggleOrgModule` + toast **`{kurum} · {modül} açıldı/kapatıldı`**.
2. **`.grid.g-2`** — modül özet kartları: her `MODULES` öğesi için ikon + ad (premium ise **`Premium`** rozeti) +
   **`{n}/{toplam} kurumda açık`** + sağda yüzde.

## Modül listesi (`MODULES` — birebir, bkz. data-contracts §2)
Deneme Analizi · Raporlar · Mesajlaşma · Randevu · Veli Paneli · Online Deneme ·
**AI Koç (Yakında — bkz. RISKS)** · Envanter & Testler (Premium).

## YAPMA
- ❌ ASCII: `Modül Bayrakları`, `Kurum × Modül matrisi`, `kurumda açık`.
- ❌ Modül listesini/sırasını değiştirmek; yeni modül eklemek (kapalı set).
- ❌ Hücre aç/kapa renk kodunu (açık=yeşil check, kapalı=faint plus) değiştirmek.
- ❌ Modül erişiminin **yukarıdan akış** kuralını bozmak (kurum kendi modülünü açamaz — bkz. data-contracts §1).
