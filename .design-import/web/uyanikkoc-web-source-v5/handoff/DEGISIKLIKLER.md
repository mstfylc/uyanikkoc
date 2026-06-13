# Değişiklikler — Web Uygulaması v4

Bu sürümde tamamlanan tüm güncellemeler (28 madde).

## Giriş & Hesap
- **Üye ol akışı (yeni):** Çok adımlı kayıt — rol (Bireysel Koç / Öğrenci) → bilgiler →
  koç ise plan seçimi → kod doğrulama → bitti. `src/auth.jsx`.
- **Profil tercihleri:** Bildirimler anahtarı gerçek toggle (kalıcı), koyu tema düzeltildi.

## Çalışma Programı (öğrenci)
- "Başla" artık anında "bitti" yapmıyor → **Başla → Devam ediyor → Bitir**.
- **Blok ekle**: kaynak seçimi (öğrencinin kitapları) + soru/doğru/yanlış girişi (net otomatik).
- Ders listesi öğrencinin sınav türüne (YKS/LGS) göre gelir.

## Konu Takibi
- **Öğrenci:** Sayfa **sınav türüne göre** (YKS/LGS müfredatı) gelir; bitirilen konu
  altında öğrencinin kaynakları "bitirdim" diye işaretlenebilir (kalıcı).
- **Koç:** Bir konuda **birden fazla kaynak**; üstteki kaynak çiplerine tıklayınca
  liste filtrelenir. **Soru Takibi grafiği** yenilendi (gün-gün / haftalık-aylık +
  önceki haftalara gidiş, gradient çubuklar).
- Responsive düzeltmeler.

## Denemeler — Kayıt & Üyelik (yeni sistem)
- **Öğrenci:** "Denemeye kayıt ol" çalışır (kayıt modalı; paket kapsamı mı ödeme mi).
- **Koç:** "Deneme Oluştur" + kayıtlı öğrenci sayısı + her kayıtta **ödeme/paket durumu**
  ve **katılım (yüz yüze / online optik)**. `src/deneme-kayit.jsx`.
- **Üyelik (2 plan):** *Yüz Yüze Deneme Paketi* · *Aylık Kargo Üyeliği*. Kargo üyeleri
  denemeyi **online optik formdan** doldurmak zorunda. Abonelik sayfasına eklendi (öğrenci+veli).
- **Demo veri:** Denemeler Excel'den içe aktarılmış gibi 3 demo deneme ile dolu
  (koç + öğrenci + veli analizleri). `src/deneme-import.jsx`.

## Ödev Atama
- "Soru" yanında **"Test"** birimi seçilebilir (her kitabın test soru sayısı farklı
  olabildiği için test adedi girilir). Toplu + tekil atama. `src/coach-odev-ata.jsx`.

## Koç Paneli
- Dashboard ve Öğrencilerim'de öğrenci satırına **tıklayınca detay sayfasına** gidilir.
- Öğrenci tablosunda **kolon başlığına tıklayınca sıralama** (tamamlama/net/durum).
- **Raporlar** geliştirildi: "En çok gelişen / İlgi gerektiren" kartları,
  Tümü/Bekleyen/Gönderilen filtresi. `src/coach-pages.jsx`.

## Veli
- Deneme sonuçları demo denemelerden beslenir; **gelişim raporları** demo onaylı
  raporlarla dolu (`src/reports.jsx`). Abonelik + deneme üyeliği görünür.

## Ayarlar (yeniden tasarım)
- Sekmeler: **Müfredat** (koç) · **Hesap** · **Görünüm** (tema seçimi) ·
  **Bildirimler** · **Gizlilik & Güvenlik** (şifre değiştir + çıkış). `src/settings.jsx`.

## Destek / SSS
- SSS genişletildi (koç/öğrenci/veli setleri) + **arama** ve **kategori filtresi**.

## Tasarım Sistemi
- Profil "Hazır ikonlar": lise/LGS'ye uygun eğlenceli set (roket, kupa, oyun kolu,
  müzik, kulaklık, basket, ampul…). `src/icons.jsx`.
- Motivasyon **rozetleri** çeşitlendirildi (12 rozet, madalya tarzı, renk + ikon).
- **Karanlık mod** kontrastı: yüzey/kenarlık tonları ayrıştırıldı; paneller ve metin
  net okunur. `src/styles.css`.
- Genel responsive iyileştirmeler (tablolar yatay kaydırılır, grid'ler tek kolona düşer).

## YKS / LGS
- Öğrenci sayfaları öğrencinin sınav türüne göre (auth `sub` alanından) müfredat
  ve ders listesini gösterir. `studentSinav()` yardımcı fonksiyonu eklendi.
