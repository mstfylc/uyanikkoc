# SADAKAT SPEC — Ortak · Mesajlar (messages)

Kaynak: `src/messaging.jsx → MessagesPage({role})` (+ `GroupModal`). Rota: `messages` (3 rolde de aynı bileşen).
Veri: `useMsg()` store (`uk_msg_v1`), `channelsFor(me, role, msg)`. Tam Türkçe. İki sütun: kanal listesi + sohbet.

## Yapı (iki panelli)
- **SOL — kanal listesi:** arama kutusu (`q`, `toLocaleLowerCase('tr-TR')` ile filtre);
  **Gruplar** ve **Birebir (DM)** ayrı bölümler. Her satır `.chan-row`:
  - grup → users ikonlu kare; DM → `Avatar`.
  - ad + son mesaj zamanı; son mesaj önizleme (`Sen: …` / grup'ta `Ad: …`); okunmamış varsa
    `.chan-unread` sayaç rozeti (sohbet açılınca `markChannelRead` ile temizlenir).
  - Koç rolünde üstte **grup oluştur** aksiyonu → `GroupModal`.
- **SAĞ — sohbet:** seçili kanal başlığı; mesaj baloncukları (kendi mesajın sağda primary);
  **"yazıyor…"** göstergesi (`typingCh`, simüle); altta mesaj yazma + gönder.
  - DM'de mesaj atınca 1.5–2.7 sn sonra **otomatik yanıt** (`MSG_REPLIES`); kanal sessizse yanıt yok.

## Boş durumlar
- Hiç kanal yoksa: PageHead **`Mesajlar`** · alt **`Henüz sohbet yok`**.

## GroupModal (Koç · Grup Oluştur)
- Alanlar: **`Grup adı`** (autofocus) · **`Açıklama (opsiyonel)`** · **`Üyeler`** (segment **`Öğrenciler`**/**`Veliler`**,
  seçili sayaç rozeti, tıkla-seç satırları check ile).
- Footer: düzenlemede **`Grubu sil`** (onaylı) + **`Kaydet`**; yeni grupta **`Grup Oluştur`**.

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Mesajlar`, `Grup Olustur`, `yaziyor`.
- ❌ Okunmamış sayaç rozetini / "yazıyor…" göstergesini atlamak.
- ❌ DM otomatik-yanıt simülasyonunu öğrenci tarafında da kapatmak (prototipte DM'de açık;
  backend'e geçişte WebSocket/SSE ile gerçek karşı taraf — bkz. teknik rehber).
- ❌ Arama filtresinde Türkçe `toLocaleLowerCase('tr-TR')` yerine düz `toLowerCase` kullanmak (i/ı hatası).
- ❌ Gruplar / DM ayrımını tek listede birleştirmek.
