# DATA CONTRACTS — Mobil (native oturum + veri)

## 1) Kimlik / oturum — native token (NextAuth'a paralel)
Mobil, web ile **aynı backend**i kullanır; kimlik **native token oturumu** ile yürür (web NextAuth
session cookie'sinin mobil karşılığı).
- **Giriş:** Telefon + **SMS OTP** (ana akış) / e-posta+şifre (alternatif) / kayıt / şifremi unuttum.
- **Token akışı:** `POST /auth/otp/start` → `POST /auth/otp/verify` → `{ accessToken, refreshToken }`.
  Access kısa ömürlü; refresh ile yenilenir. **Expo SecureStore**'da saklanır (Keychain/Keystore).
- **Yetki:** yalnızca **öğrenci** rolü (mobil ürün öğrenci-only). Token rol içerir; rol ≠ student ise mobil reddeder.
- **Web NextAuth ↔ mobil token:** ortak kullanıcı/oturum tablosu; mobil JWT, NextAuth ile aynı imza/issuer.
  Çıkış: token iptal + SecureStore temizliği.

## 2) Tasarım tokenları — `theme.ts` (TEK köprü)
`palette.light/dark` (marka #534AB7, web v6 ile birebir) · `typography.scale` · `spacing` ·
`radiusBase × radiusScale` · `iconSize` · `elevation` (iOS shadow* + Android elevation) · `devices`.
`tokens.json` ile birebir; `$platformNotes` dark OLED ton sapmasını belirtir.

## 3) Veri modülleri (web v6 store'larına eşlenir)
Mobil ekranlar web ile **aynı veri modeli/uçları** kullanır (kaynak: `uyanikkoc-web-claudecode-v6`):
| Mobil ekran | Web store / uç | Anahtar |
|---|---|---|
| Ödevler | odev-store | `assignments` |
| Denemeler | tests/exams | `exams` |
| Yanlış Defteri | mistakes-store | `mistakes` (+ spaced repetition `nextDue`) |
| Konu Takibi | konu-store | `topic_status` |
| Kaynaklarım | kaynak-tracker | `student_sources` |
| Mesajlar | messaging | `messages/threads` (WebSocket/SSE) |
| Randevular | appointments | `appointments` |
| Motivasyon | motivation | `motivation` |
| Bildirimler | notifications | `notifications` (push: APNs/FCM) |
| Abonelik | billing | `billing` |

## 4) Native-özel
- **Push:** Expo Notifications (APNs/FCM); bildirim → ilgili ekrana derin link.
- **Foto (Yanlış Defteri):** kamera/galeri → ≤520px küçült → yükle (web'de dataURL; native'de object storage).
- **Offline:** kritik listelerde önbellek (React Query persist) — opsiyonel, v2.
- **Spaced repetition** (`nextDue`) sunucuda hesaplanır; yerel bildirimle hatırlatma.

## 5) Tek şube
Mobil öğrenci tek kuruma/şubeye bağlıdır; çoklu şube/kurum seçimi **yoktur** (RISKS).
