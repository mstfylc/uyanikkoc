# SADAKAT SPEC — Koç · Yıllık Çizelge (c-cizelge) — KISA

Kaynak: `konu-cizelge/coach-cizelge-page.jsx → CoachKonuCizelgePage` → `KonuCizelge` modülü
(`konu-cizelge/cizelge-app.jsx`, stil `konu-cizelge/cizelge.css`). Rota: `c-cizelge` (menüde "Yeni"). Tam Türkçe.

- **PageHead:** başlık **`Yıllık Konu Takip Çizelgesi`** ·
  alt **`Tüm yılın oturum oturum çalışma kaydı · Tekrar / Günlük / Haftalık görünüm`** ·
  sağ aksiyon: açık **`Dışa aktar`** (download).
- **Gövde:** `KonuCizelge` — yıllık ders×konu çizelgesi; **Tekrar / Günlük / Haftalık** görünüm modları;
  oturum oturum çalışma kaydı. Veri: `konu-cizelge/cizelge-data.jsx`. Bu modül kendi CSS'ini
  (`cizelge.css`) kullanır — token'ları tüketir, yeni token tanımlamaz.
- **Durumlar:** hücre durumları (boş/çalışıldı/tekrar) çizelge renk kodu; görünüm modu segmenti.

## YAPMA
- ❌ ASCII: `Yıllık Konu Takip Çizelgesi`, `Dışa aktar`, `Haftalık`.
- ❌ Üç görünüm modunu (Tekrar/Günlük/Haftalık) azaltmak; çizelge modülünü yeniden tasarlamak.
- ❌ `cizelge.css` dışında token üretmek.
