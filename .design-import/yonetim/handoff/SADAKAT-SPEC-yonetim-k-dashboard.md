# SADAKAT SPEC — Kurum Yöneticisi · Dashboard (k-dashboard)

Kaynak: `admin/kurum.jsx → KurumDashboard`. Mod: `kurum`, sayfa `k-dashboard`.
Veri: `getActiveOrg()`, `orgCoaches`. **Yalnızca aktif kurum** (RBAC). Tam Türkçe.

## PageHead
- Başlık **`Merhaba, {ad} 👋`** · alt **`{kurum} · {şube sayısı / tek kurum} · {şehir}`**
- Sağ aksiyonlar: açık **`Dışa aktar`** (CSV → `kurum-ozet.csv`); birincil **`Ekibi yönet`** (users → `k-koclar`).

## Bileşen sırası
1. **Lisans uyarı şeridi** (expiring/overdue/trial ise): `.alert-strip` (overdue=danger, diğeri=warn) + yenileme CTA.
2. **`.grid.g-4`** — 4 StatCard (sıra birebir, delta dahil):
   1. `cap`/primary · `{seats.used}` · **`Aktif öğrenci`** · delta **`{boş} koltuk boş`** ↑
   2. `users`/info · `{coaches.used}` · **`Koç`** · **`{total} kapasite`** (flat)
   3. `banknote`/success · `{TRY(totalCollect)}` · **`Aylık tahsilat`** · **`+%6,2`** ↑
   4. `target`/warning · `{avgNet}` · **`Ortalama net (TYT)`** · **`+4,1`** ↑
3. **`.grid.col-main`**:
   - SOL `Section` **`Öğrenci & gelir gelişimi`** · alt **`Son 12 ay`** · sağda `Badge` success **`Büyüyor`** (`Sparkline`, kurum tonu).
   - SAĞ `Section` **`Lisans kullanımı`** · sağda **`Detay`** (→ k-lisans): `Meter` koltuk/koç(/şube) + **`Sonraki yenileme`**.
4. **`.grid.col-main`**:
   - SOL `Section` — franchise: **`Şube karşılaştırması`** · alt **`Aylık tahsilat`** (`RankBars`); tek kurum:
     **`En iyi koçlar`** · alt **`Öğrenci memnuniyeti`**.
   - SAĞ `Section` **`Öne çıkan koçlar`** · sağda **`Tümü`** (→ k-koclar): koç satırları.

## YAPMA
- ❌ ASCII: `Merhaba`, `Aktif öğrenci`, `Aylık tahsilat`, `Ortalama net (TYT)`, `Lisans kullanımı`.
- ❌ StatCard sırası/etiketleri/delta'ları; franchise↔tek kurum kart farkını (şube vs koç) kaldırmak.
- ❌ Lisans uyarı şeridi koşulunu (expiring/overdue/trial) atlamak; başka kurum verisi göstermek.
