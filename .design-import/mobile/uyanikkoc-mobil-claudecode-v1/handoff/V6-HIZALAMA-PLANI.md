# V6 HİZALAMA PLANI — Mobil (v3 prototip) → v6 öğrenci paritesi

Prototip tabanı **v3**'tür; web **v6** öğrenci modüllerinin bir kısmı mobilde **henüz yok**.
Bu belge: hangi ekran var/yok + yeni v6 ekranlarının native tasarım yönergesi + içerik kaynağı.
Yeni ekranların içerik/davranış doğruluk kaynağı: **`uyanikkoc-web-claudecode-v6/handoff/SADAKAT-SPEC-*`**.

## DURUM TABLOSU
| Ekran (rota) | v3 prototip | v6 hedef | Aksiyon |
|---|---|---|---|
| Login / Üye ol | ✅ var | ✅ | Koru (telefon+SMS / e-posta / kayıt / şifremi unuttum) |
| Ana Sayfa (home) | ✅ var | ✅ + **Takvimim** + **Çalışma Serisi** | **Genişlet:** Takvimim kartı (Ajanda/Hafta/Ay) + Streak kartı ekle |
| Ödevler (odevler) | ✅ liste + ResultSheet | ✅ **Günlük plan / Liste / Takvim** | **Genişlet:** 3 görünüm segmenti; sonuç→Yanlış Defteri köprüsü (sheet) |
| Denemeler (denemeler) | ✅ geçmiş + trend | ✅ + **Net Kaybı Haritası** + **Analiz** + **Online** | **Genişlet:** sekmeler (Sonuçlar/Analiz/Online) + NetGainMap kartı |
| **Yanlış Defteri** | ❌ yok | ✅ Odak Tekrar + Hata Frekansı | **YENİ ekran** (alt tab dışı; Ana Sayfa/Profil kısayolu veya 5. sekme adayı) |
| Konu Takibi (konu) | ✅ ders sekmeleri + ilerleme | ✅ **ısı haritası** | **Genişlet:** müfredat ısı haritası görünümü ekle |
| Program (program) | ✅ var | ✅ | Koru |
| Mesajlar (mesaj) | ✅ var | ✅ | Koru (canlı iletim + okunmamış rozet — web v6) |
| Randevular (randevu) | ✅ var | ✅ | Koru |
| Testler | ❌ yok | ✅ | **YENİ ekran** (envanter/test çöz — web `tests`) |
| Motivasyon (motivasyon) | ✅ var | ✅ | Koru (rozetler + hedef sıralama) |
| Abonelik | ❌ yok | ✅ | **YENİ ekran** (plan/fatura — web `billing`, native) |
| Bildirimler | ❌ ayrı yok | ✅ | **YENİ:** bildirim listesi ekranı + okunmamış rozet |
| Ayarlar | kısmi (Profil içinde) | ✅ | **Ayır:** Hesap/Görünüm/Bildirimler/Gizlilik (web `settings`) |
| Profil (profil) | ✅ var | ✅ | Koru + Ayarlar'a köprü |
| AI Koç | ❌ yok | ✅ **Yakında** | **YENİ:** "Yakında" tanıtım ekranı (web `ai-coach`; input pasif) |

## YENİ v6 EKRANLARI — native tasarım yönergesi
Her biri **web v6 spec'ini** native'e uyarlar (modaller → **bottom-sheet**; tablo → kart/liste; tab → segment):
- **Yanlış Defteri:** özet şeridi (4 sayı) → Sıfır Hata Döngüsü (1→3→7→21) → Hata Frekansı → liste + filtre.
  "Yanlış ekle" ve "Odak tekrar" **bottom-sheet**. Foto: cihaz kamerası/galeri (≤520px). Kaynak: `SADAKAT-SPEC-ogrenci-mistakes.md`.
- **Net Kaybı Haritası:** Denemeler ekranında kart; "Programa ekle" CTA (öğrenci). Kaynak: web `net-gain-map`.
- **Takvimim:** Ana Sayfa'da Ajanda/Hafta/Ay segmenti; ödev+deneme+randevu+tekrar tek akış. Kaynak: `student-agenda`.
- **Testler / Abonelik / Bildirimler / Ayarlar / AI Koç:** ilgili web v6 spec'i + native desen.

## Native uyarlama kuralları (genel)
- Web modal (`ReactDOM.createPortal` overlay) → **RN bottom-sheet** (örn. `@gorhom/bottom-sheet`).
- Web tablo (`.tbl`) → kart listesi / `FlatList` satırları (mobilde yatay tablo yok).
- Web sekme (`.seg`) → native segment control / üst sekme; alt tab bar 5 ana bölüm için.
- StatCard grid (`g-4`) → 2×2 kart ızgarası (mobil genişlik).
- Pull-to-refresh tüm liste ekranlarında; boş/yükleniyor durumları korunur.

## ÖNEMLİ
Bu yeni ekranlar **henüz prototipte YOK** — `exports/` PNG'leri yalnızca v3'te var olan ekranları
kapsar. Yeni ekranlar için **build-spec** (bu plan + ilgili web v6 spec) izlenir; istenirse prototipe de eklenir.
