# Component Spec — Mesajlaşma + Bildirim

> Kaynak: `src/messaging.jsx` (`MessagesPage`, `GroupModal`, store), `src/notifications.jsx` (`NotifBell`, `pushNotif`)
> Stiller: `.msg-shell`, `.msg-list`, `.msg-thread`, `.msg-body`, `.chan-row`, `.chan-unread`, `.chan-gico`, `.msg-typing`, `.msg-sec` (`src/styles.css`)
> Store anahtarları: `uk_msg_v1` (mesaj), `uk_notif_v2` (bildirim)
> Rota: tüm rollerde `messages` (App shell `MessagesPage` ile özel-render eder).

## `MessagesPage({ role })` — iki panelli sohbet
**`.msg-shell`** = sol kanal listesi (`.msg-list`) + sağ sohbet (`.msg-thread`). Mobilde tek panel.

### Sol — kanal listesi
- Üst: arama kutusu ("Sohbet ara...").
- Bölümler: **Gruplar** (`.msg-sec`) → grup kanalları; **Birebir**/"Koçun" → DM kanalları.
- **Kanal satırı** `.chan-row` (aktif `.on`): grup ikonu (`.chan-gico`) ya da `Avatar` 42 + ad + son mesaj önizleme + saat + **okunmamış rozeti** `.chan-unread`.
  - **Okunmamış stili:** son mesaj metni `text-2` + bold; saat `primary-600`; sayı rozeti.

### Görünürlük / yetki (`channelsFor`)
- **coach:** tüm gruplar + tüm öğrenci DM'leri ("Öğrenci") + tüm veli DM'leri ("Veli · {çocuk}'in velisi").
- **student:** yalnız koçuyla DM (`dm:{kendi adı}`, pinned "Koçun") + üyesi olduğu gruplar.
- **parent:** yalnız çocuğun koçuyla DM + üyesi olduğu gruplar.
> Görünürlük = gönderme yetkisi. Backend'de bu kapsam sunucuda zorunlu kılınmalı.

### Sağ — sohbet
- Üst bar: avatar/grup ikonu + ad + (grup ise üye adları / DM ise alt etiket). Grup + coach ise **"Üyeler"** butonu (`GroupModal` edit). **Sessize al** ikon-butonu (`bell`; sessizdeyken danger renk).
- **Gövde** `.msg-body`: balonlar — kendi mesajım sağ (`--primary` arka, beyaz metin, radius `14 14 4 14`), karşı sol (`--surface` + border, radius `14 14 14 4`). Grup'ta karşı tarafın adı+rolü üstte (primary-600). Saat altta faint.
- **"yazıyor…"** göstergesi `.msg-typing` (3 nokta) — DM'de otomatik yanıt simülasyonu sırasında.
- **Girdi:** input + `btn-primary` gönder (icon `send`, boşken disabled).

## Canlı iletim + bildirim (`sendMsg`)
`sendMsg(channelId, from, role, text, opts?)`:
1. Mesajı thread'e ekler (saat damgalı).
2. **Alıcı rolleri** (`_msgRecipientRoles`) hesaplar (DM: karşı taraf; grup: üye rollerinden gönderen hariç).
3. Her alıcı rol için **okunmamış sayacı** artırır (`_msg.unread[role::channel]`).
4. `opts.silent` değilse her alıcı role **`pushNotif(role, {icon:"message", tone:"info", title, desc, page:"messages"})`** üretir.
- **DM otomatik yanıt:** kullanıcı DM'de mesaj atınca, kanal sessizde değilse 1.5–2.7 sn sonra karşı taraftan `MSG_REPLIES` havuzundan rastgele yanıt (`scheduleReply`) + "yazıyor…".
- **Okundu:** sohbet açılınca / yeni mesajda `markChannelRead(role, channelId)` sayaç siler.
> Backend: simülasyon (otomatik yanıt) kaldırılır; WebSocket/SSE ile gerçek karşı taraf. `unread` sunucuda tutulur.

## `GroupModal` (koç — grup oluştur / üye yönet)
Portal modal `max-width 480`. Alanlar: grup adı, açıklama, üyeler (seg: Öğrenciler/Veliler; `src-item` satırlarıyla çoklu seçim + sayaç). Foot: (edit ise) "Grubu sil" (onaylı) + "Grup Oluştur"/"Kaydet" (disabled: ad<2 veya üye 0). Aksiyonlar: `createGroup`/`updateGroupMembers`/`deleteGroup` → toast.

## `NotifBell` + bildirim
Topbar'da çan; okunmamış bildirim sayısı rozetli. Açılır liste (`uk_notif_v2`). `pushNotif(role, item)` rol bazlı bildirim kuyruğuna ekler. Tıklayınca `goPage(item.page)`.

## Durumlar
- **Boş:** hiç kanal yoksa PageHead "Mesajlar — Henüz sohbet yok".
- **Okunmamış:** rozet + bold; **okundu:** rozet kaybolur, normal ağırlık.
- **Sessiz:** otomatik yanıt yok, çan ikonu danger; toast "Sohbet sessize alındı" / "Bildirimler açıldı".

## Demo veri
Koç: "Dilek Emen". Öğrenciler/veliler `MSG_STUDENTS`/`MSG_PARENTS`. 3 seed grup (g1 öğrenci, g2 veli, g3 karma) + DM thread'leri (`msgSeed`).
