# SADAKAT SPEC — Süper Admin · Kurum Detayı (kurum-detay)

Kaynak: `admin/admin-extra3.jsx → SAOrgDetail` (override — taban `superadmin2.jsx`; SON tanım kazanır).
Mod: `superadmin`, sayfa `kurum-detay` (Kurumlar kartından drill-in). Veri: `getOrg`, `orgPlanById`,
`orgPlans`, `viewerAccess`. Tam Türkçe. `editable = viewerAccess === "full"`.

## Üst başlık
- Geri linki **`Kurumlara dön`** + `OrgLogo` (56) + ad + `StatusBadge`.
- Alt: **`Franchise ağı / Tek kurum · {şehir} · Sahip: {owner}`**.
- Sağ aksiyonlar: açık **`İletişim`** (message → MessageComposeModal); birincil
  **`Lisansı yenile`** (refresh) — dondurulmuşsa **`Aktifleştir`**.

## Bileşen sırası
1. **`LicenseHero`** — lisans özet hero (plan, kapasite, yenileme).
2. **`Tabs`** — **`Özet`** · **`Şubeler`** (franchise'ta çoğul, count) · **`Lisans & Plan`** · **`Modüller`**.
3. **Özet sekmesi** (`.grid.col-main`):
   - SOL: `.grid.g-3` StatCard (`cap`/primary **`Aktif öğrenci`** · `users`/info **`Koç`** · `banknote`/success
     **`Aylık tahsilat`**) + `Section` **`Şube performansı`** · alt **`Aylık tahsilat karşılaştırması`** (`RankBars`) +
     **`SubscriberNotes`** (abone notu ekle/listele).
   - SAĞ: `Section` **`Kurum bilgileri`** (Yetkili/E-posta/Telefon/Sözleşme başlangıcı) +
     **yalnızca editable ise** `Section` **`Lisans işlemleri`**: **`Planı yükselt / değiştir`** ·
     **`Koltuk paketi ekle (+25)`** · **`Lisansı dondur`** (danger).
4. **Şubeler sekmesi:** `Section` başlık **`Şubeler/Şube`** · alt **`{n} konum · toplam {n} öğrenci`** —
   tablo: **`Şube`** · **`Öğrenci`** · **`Koç`** · **`Aylık tahsilat`** (sağ) · **`Durum`** (ortalı).
5. **Lisans & Plan sekmesi:** `Section` **`Lisans planı`** · alt **`Plan değişikliği anında kapasite ve
   modülleri günceller`** — `.grid.g-3` plan kartları (`lic-plan`, seçili=`sel`, popüler bayrağı).
6. **Modüller sekmesi:** `Section` **`Modül erişimi`** · alt **`Bu kuruma açık özellikleri yönet — değişiklikler
   anında uygulanır`** — `ModuleGrid` (editable değilse `readOnly`).
- **Dondur onayı:** `ConfirmModal` **`Lisansı dondur?`** (danger).

## RBAC (önemli)
`viewerAccess !== "full"` (destek yetkilisi) ise: Lisans işlemleri gizli, plan/modül değişimi **kilitli**
(salt-görüntüleme). Bkz. `data-contracts.md`.

## YAPMA
- ❌ ASCII: `Kurum Detayı`, `Lisans & Plan`, `Şube performansı`, `Modül erişimi`.
- ❌ 4 sekme sırasını/etiketlerini; SubscriberNotes'u veya editable gating'i atlamak.
- ❌ Taban (`superadmin2`) sürümünü port etmek — **override (`admin-extra3`) esastır**.
