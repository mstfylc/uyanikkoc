# SADAKAT SPEC — Veli · Genel Bakış (dashboard)

Kaynak: `src/parent.jsx → VeliDashboard`. Rota: `dashboard`. `CHILD = "Elif Yıldız"`.
Veli görünümü **salt-okunur**. Mount: `NetGainMap`, `HataFrekansiCard`, `KaynakTracker`. Tam Türkçe.

## Bileşen sırası
1. **`.hero`** (koyu): eyebrow **`Merhaba 👋`**; `<h2>` **`Çocuğunuz {ad}'in gelişimi`**;
   alt **`Koç Dilek Emen · 11. Sınıf Sayısal · Hedef YKS 2026`**; sağ rozet (cap) **`Veli Paneli`**.
2. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `target`/success · `%{rate}` · **`Bu hafta ödev tamamlama`**
   2. `clipboard`/warning · bekleyen · **`Bekleyen ödev`**
   3. `chart`/primary · son net · **`Son deneme neti`**
   4. `flame`/danger · `12` · **`Çalışma serisi (gün)`**
3. **`.grid.col-main`**:
   - SOL `Section` **`Haftalık Ödevler`** · alt **`{çocuk} · bu hafta`** · sağda `Badge` **`{done}/{n} tamam`**:
     ödev satırları (ikon + konu + ders chip + varsa net + Bitti/Bekliyor). Boş: **`Bu hafta ödev yok.`**
   - SAĞ `.stack`:
     - `Section` **`Koçtan Notlar`** · alt **`Önemli uyarılar`** (sabitlenmiş notlar; boş: **`Henüz not yok.`**)
     - `Section` **`Yaklaşan Randevu`** (onaylı randevular; boş: **`Onaylı randevu yok.`**)
4. **`NetGainMap` role="parent"** — Net Kaybı Haritası (CTA YOK, salt-görüntüleme).
5. **`HataFrekansiCard`** — çocuğun hata frekansı (salt-görüntüleme).
6. **`KaynakTracker` editable={false}** — kaynak takibi (düzenlenemez).

## YAPMA
- ❌ ASCII: `Çocuğunuz`, `Bu hafta ödev tamamlama`, `Koçtan Notlar`, `Çalışma serisi (gün)`.
- ❌ Veli tarafına aksiyon/CTA eklemek — NetGainMap'te "ödev ata"/"programa ekle" YOK (salt-okunur).
- ❌ StatCard sırası/etiketleri; KaynakTracker'ı `editable` yapmak.
- ❌ Sıralamayı bozmak: hero → g-4 → (ödevler+notlar/randevu) → NetGainMap → HataFrekansı → KaynakTracker.
