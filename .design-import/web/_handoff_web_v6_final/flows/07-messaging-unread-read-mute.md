# Flow — Mesajlaşma: Okunmamış / Okundu / Sessize Alma + Canlı İletim

> Roller: koç / öğrenci / veli · Rota: `messages` · Store: `uk_msg_v1`, `uk_notif_v2`
> Kaynak: `messaging.jsx`

## Mesaj gönderme + okunmamış
1. Kullanıcı bir kanalda mesaj yazıp gönderir → `sendMsg(channelId, me, role, text)`:
   - Mesaj thread'e eklenir (saat damgalı).
   - **Alıcı rolleri** hesaplanır (`_msgRecipientRoles`): DM → karşı taraf rolü; grup → üye rollerinden gönderen hariç.
   - Her alıcı rol için `unread[role::channelId]++`.
   - Her alıcı role **bildirim** (`pushNotif`) — başlık DM'de "{gönderen}'dan mesaj", grupta "{grup} · {ad}".
2. Kanal listesinde okunmamış kanal: son mesaj **bold + text-2**, saat **primary-600**, sağda `.chan-unread` sayaç rozeti.

## Okundu
- Kullanıcı kanalı açtığında / kanalda yeni mesaj geldiğinde `markChannelRead(role, channelId)` → `unread[role::channelId]` silinir → rozet kaybolur, ağırlık normale döner.

## Sessize alma (mute)
- Sohbet üst barında **çan** ikon-butonu → `muted` set'ine ekler/çıkarır (oturum içi `useState`); sessizdeyken ikon **danger** renk.
- toast: "Sohbet sessize alındı" / "Bildirimler açıldı".
- **Etki:** sessize alınan DM'de **otomatik yanıt simülasyonu çalışmaz** (`scheduleReply` erken döner).
> Not: prototipte mute oturumluk (kalıcı değil). Backend'de kullanıcı-kanal mute tercihi DB'de saklanmalı + bildirim bastırma sunucuda.

## Canlı iletim (prototip simülasyonu)
- **DM'de** kullanıcı mesaj atınca, kanal sessizde değilse:
  - "yazıyor…" göstergesi (`.msg-typing`) açılır (`typingCh`).
  - 1.5–2.7 sn sonra karşı taraf rolünden `MSG_REPLIES` havuzundan rastgele yanıt `sendMsg` ile gelir.
- **Gruplarda** otomatik yanıt yoktur.
> Backend: simülasyon kaldırılır; WebSocket/SSE ile gerçek "typing" + gerçek karşı taraf; `unread` sunucu kaynaklı.

## Durumlar
- **empty:** hiç kanal yok → "Mesajlar — Henüz sohbet yok".
- **read:** rozet yok, normal ağırlık.
- **unread:** rozet + bold.
- **muted:** çan danger, otomatik yanıt yok.
- **typing:** 3 nokta animasyonu (yalnız DM).

## Görünürlük / yetki kapsamı
`channelsFor(me, role)` — koç: tüm öğrenci/veli DM + tüm gruplar; öğrenci: yalnız koç DM + üyesi grupları; veli: yalnız çocuğun koçu DM + üyesi grupları. **Görünürlük = gönderme yetkisi**; backend'de zorunlu kılınmalı.
