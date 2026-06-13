# SADAKAT SPEC — Koç · Gelir & Tahsilat (revenue) — KISA

Kaynak: `src/online-deneme.jsx → CoachRevenueGate` → `BranchRevenuePage` (`src/billing-branch.jsx`).
Rota: `revenue` (menüde "Gelir & Tahsilat"). **Yetki kapılı** (`coachCan("gelirGorunur")`). Tam Türkçe.

- **Yetki yoksa:** PageHead **`Gelir & Tahsilat`** · alt **`Kazanç ve tahsilat özetin`** +
  `LockBanner` **`Gelir & Tahsilat görünür değil`** / **`Kuruma bağlı koçlar için bu alanı kurum
  açmadıkça görüntüleyemez. Bireysel koç lisansında veya kurum izin verdiğinde görünür.`**
- **Yetki varsa:** `BranchRevenuePage` — kazanç/tahsilat özeti:
  - StatCard'lar (gelir/tahsil edilen/bekleyen) + tahsilat tablosu (öğrenci · tutar · durum · tarih).
  - ⚠️ **`invoices` (faturalar) bu sayfanın bir parçasıdır** — ayrı rota değil. Fatura/makbuz listesi
    burada (veya öğrenci `billing` tarafında). Para birimi ₺ (`TRY`, tr-TR).

## YAPMA
- ❌ ASCII: `Gelir & Tahsilat`, para birimini `$`/İngilizce biçim.
- ❌ Yetki kilidini (LockBanner) kaldırmak; "Faturalar"ı ayrı sidebar rotası yapmak.
