# SADAKAT SPEC — Ortak · Destek (support) — KISA

Kaynak: `src/support.jsx → SupportPage({role})`. GENEL menü öğesi (her rolde). Veri: `SSS[role]` (SSS),
`useTickets(me)`. Tam Türkçe.

- **PageHead:** başlık **`Destek`** · alt **`Sık sorulan sorular, yardım ve iletişim`**
- **Bileşen sırası:**
  1. `.grid.g-3` — 3 iletişim kartı (sıra): `message`/primary **`Canlı Destek`** / `Hafta içi 09:00 – 18:00`;
     `bell`/info **`E-posta`** / `destek@uyanikkoc.com`; `ai`/success **`Yardım Merkezi`** / `Rehber ve videolar`.
  2. `.grid.col-main`:
     - SOL `Section` **`Sık Sorulan Sorular`** · alt **`{n} soru · ara veya kategoriye göre filtrele`**:
       arama (`Soru ara…`, `toLocaleLowerCase('tr-TR')`) + kategori chip'leri + akordeon SSS listesi.
     - SAĞ `Section` **`Destek Talebi Oluştur`** · alt **`Sorununu ilet, ekibimiz dönüş yapsın`**:
       **`Konu`** chip'leri (`Teknik sorun / Öneri / Hesap / Diğer`) + **`Mesajın`** textarea + **`Gönder`**
       (≥5 karakter). Gönderince toast **`Destek talebin oluşturuldu · {id}`** + rozet **`En geç 24 saat
       içinde dönüş yapılacak`**.
- **Boş durum (SSS):** sonuç yoksa **`"{arama}" için sonuç yok. Aşağıdan destek talebi oluşturabilirsin.`**

## YAPMA
- ❌ ASCII: `Destek`, `Sık Sorulan Sorular`, `Gönder`. ❌ Arama filtresinde düz `toLowerCase` (i/ı hatası).
- ❌ İletişim kartı 3'lüsünü / iki sütun (SSS + talep) düzenini bozmak.
