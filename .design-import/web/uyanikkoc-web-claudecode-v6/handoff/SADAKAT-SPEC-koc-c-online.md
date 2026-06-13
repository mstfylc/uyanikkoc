# SADAKAT SPEC — Koç · Online Denemeler (c-online)

Kaynak: `src/online-deneme.jsx → CoachOnlineExams` (+ `CoachAccessPanel`, `OnlineDenemeOlusturModal`,
`LockBanner`). Rota: `c-online`. Yetki/paket kapılı. Tam Türkçe.

## PageHead
- Başlık **`Online Denemeler`** · alt **`Online deneme oluştur, cevap anahtarını belirle, öğrencilere yayınla`**
- Sağ aksiyon: paket açık **ve** yetki varsa birincil **`Online Deneme Oluştur`** (plus) → modal.

## Bileşen sırası
1. **`CoachAccessPanel`** — `Section` **`Hesap & Yetkiler`** · alt **`Bireysel koç tüm yetkilere sahiptir;
   kuruma bağlı koçun yetkilerini kurum belirler`** · sağda lisans rozeti (**`Bireysel lisans`** / **`Kuruma bağlı · {kurum}`**).
   Demo: koç tipi segment (Bireysel / Kuruma bağlı) + yetki toggle'ları (**`Deneme oluşturabilir`** ·
   **`Deneme silebilir`** · **`Online deneme kullanabilir`** · **`Gelir & Tahsilat görebilir`**) + paket toggle.
2. **Kilit banner'ı** (`LockBanner`) koşullu:
   - Paket kapalı: **`Online deneme paketi kapalı`**
   - Yetki yok: **`Deneme oluşturma yetkin yok`**
3. **`Section` — `Oluşturduğun Online Denemeler`** · alt **`{n} deneme`**:
   satır = notebook ikon + ad + `{tip} · {n} soru · Cevap anahtarı: {k}/{n}` (+ PDF adı) + **`Sil`**/**`Kilitli`** (yetkiye göre).
   Boş: **`Henüz online deneme oluşturmadın.`**
- **Silme onayı:** **`Denemeyi sil?`** → silince bildirim + toast **`Deneme silindi · bildirim oluşturuldu`**.

## YAPMA
- ❌ ASCII: `Online Denemeler`, `Cevap anahtarı`, `Oluşturduğun Online Denemeler`.
- ❌ Paket/yetki kilit mantığını (LockBanner) kaldırmak; "Sil" butonunu yetki yokken aktif yapmak.
- ❌ CoachAccessPanel yetki toggle setini değiştirmek.
