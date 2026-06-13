# SADAKAT SPEC — Ortak · Abonelik & Ödeme (billing) — KISA

Kaynak: `src/billing.jsx → BillingPage`. Rota: `billing` (öğrenci + veli; menüde "Abonelik").
Veri: `useBilling()` (`uk_billing*`), `TRY()` para biçimi (₺, tr-TR).

- **PageHead:** başlık **`Abonelik & Ödeme`** · alt **`Koçluk paketini, faturalarını ve ödeme yöntemlerini yönet`**
- **Bileşen sırası:** `.seg-tabs` 3 sekme → **`Abonelik`** (sub) · **`Faturalar`** · **`Kartlar`**.
  - **Abonelik:** `Section` **`Plan & Yenileme`** · alt **`Planını yükselt, faturalama dönemini değiştir
    veya yenilemeyi yönet`** + plan kartları → `checkout` (`BillingCheckout`).
  - **Faturalar:** `.grid.g-3` StatCard (sıra): `receipt`/primary **`Toplam fatura`** · `banknote`/success
    **`Ödenen tutar`** (`TRY`) · `calendar`/info **`Son ödeme`**. Altında `Section` **`Fatura & Ödeme Geçmişi`** ·
    alt **`Geçmiş ödemelerini görüntüle ve makbuzları indir`** → tablo `.tbl` (min-width 640).
  - **Kartlar:** `Section` **`Kayıtlı Kartlar`** · alt **`Yenilemeler ve yeni ödemeler için kullanılır`** +
    **`Kart ekle`** aksiyonu.
- **Tablo kolonları (Fatura & Ödeme Geçmişi):** Tarih · Açıklama/Plan · Tutar · Durum · Makbuz (indir).
- **Boş durum:** kart yoksa "Kayıtlı kartın yok" tarzı + kart ekle çağrısı.

## YAPMA
- ❌ ASCII: `Abonelik & Ödeme`, `Faturalar`, `Ödenen tutar`. ❌ Para birimini `$`/İngilizce biçim yapmak (₺, tr-TR).
- ❌ 3 sekmeyi (Abonelik/Faturalar/Kartlar) azaltmak; StatCard `g-3` sırasını değiştirmek.
