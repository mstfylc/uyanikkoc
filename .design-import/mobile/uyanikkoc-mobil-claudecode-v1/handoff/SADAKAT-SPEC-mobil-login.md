# SADAKAT SPEC — Mobil · Login / Üye ol

Kaynak: `mobile/uk-screens.jsx → LoginScreen`. PNG: `exports/mobil/ios-light/login.png`.
Native: tek ekran, safe-area, klavye-uyumlu (KeyboardAvoidingView). Tam Türkçe.

## Adımlar (state: enter / otp / register / forgot)
- **enter:** marka başlığı + **`Hedefe giden yolda yanındayız`** + alt metin; **`Telefon numarası`**
  (TR +90 prefix, numeric); **`Beni hatırla`** toggle; birincil **`SMS Kodu Gönder`** (no geçerli olunca aktif);
  ayraç altında **`E-posta ile giriş`**; **`Kayıt ol`** + **`Kurumundan davet iste`** linkleri.
  En altta **`Kullanım Koşulları`** + **`Gizlilik Politikası`** onayı.
- **otp:** tek-kutu/6-haneli kod girişi → otomatik doğrula → giriş.
- **register / forgot:** kayıt ve şifre sıfırlama adımları.

## Native notlar
- Telefon doğrulama: backend `POST /auth/otp/start` → `verify` (data-contracts §1); token SecureStore.
- "E-posta ile giriş" alternatif akış. Marka rengi #534AB7, hero degrade.

## YAPMA
- ❌ ASCII: `SMS Kodu Gönder`, `E-posta ile giriş`, `Kayıt ol`.
- ❌ OTP'yi çok-adımlı modal yapmak (tek ekran, klavye-uyumlu); marka metnini değiştirmek.
