# Active Screen Backend Plan

Amaç: Mobil uygulamaya dokunmadan, web ekranlarında görünen ama kısmi kalan aksiyonları gerçek backend davranışına bağlamak ve canlıya almak.

## Fazlar

1. Şifre sıfırlama
   - Login ekranındaki "Şifremi unuttum" aksiyonu `#` link olmaktan çıkacak.
   - Demo ortamında güvenli, kullanıcıyı bilgilendiren reset talebi üretilecek.
   - DB ortamında token tablosu üzerinden reset talebi kalıcı tutulacak.

2. Koç konu hedefleri
   - "Hedefleri kaydet" sadece local tick vermeyecek.
   - Öğrenci + koç bazlı haftalık hedefler API üzerinden kaydedilip geri yüklenecek.

3. Randevu kalıcılığı
   - Randevu ayarları ve talepler DB ortamında Prisma ile kalıcı tutulacak.
   - Memory davranışı yalnızca demo/non-DB modunda kalacak.

4. Yönetim paneli kalıcılığı
   - Mevcut admin ekran tasarımı korunacak.
   - DB ortamında `AdminSnapshot` JSON olarak kalıcı tutulacak; mevcut mutasyon davranışı aynı kalacak.
   - Bu faz normalize admin CRM/ERP şeması açmayacak.

5. Doğrulama ve yayın
   - Unit testler, lint, typecheck, build ve mümkün olan e2e/smoke testler çalıştırılacak.
   - Başarılı olursa commit, push ve Vercel canlı deploy yapılacak.

## Notlar

- `apps/mobile` değiştirilmeyecek.
- AI Koç entegrasyonu eklenmeyecek; "Yakında" yüzeyi korunacak.
- CRM dosyalarına ve ortamlarına dokunulmayacak.
