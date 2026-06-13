# SADAKAT SPEC — Mobil · Alt ekranlar (sub-router)

Kaynak: `mobile/uk-screens3.jsx` + `mobile/uk-v4.jsx`. Alt ekranlar **stack push** ile açılır;
tab bar gizlenir, üstte **geri** (chevronLeft) + başlık. Home hızlı erişim / Profil'den açılır. Tam Türkçe.

## Ekranlar
- **Konu Takibi (`konu`):** ders sekmeleri + konu ilerleme listesi (tamamlandı / %…).
  *v6: müfredat **ısı haritası** ekle (web `topics`).*
- **Kaynaklarım (`kaynaklar`):** kitap/kaynak takibi (aktif/bitti/beklemede + %) + **`Ekle`** (bottom-sheet).
- **Randevular (`randevu`):** yaklaşan randevular + yeni randevu (**Yüz yüze / Online / Telefon** + slot) — bottom-sheet.
- **Mesajlar (`mesaj`):** koç ile sohbet (baloncuk + giriş). *v6: canlı iletim + okunmamış rozet.*
- **Motivasyon (`motivasyon`):** koç motivasyon notu + koç değerlendirme (5 yıldız). *v6: rozetler + hedef sıralama.*
- **Destek (`destek`):** SSS + destek talebi.

## Ortak native kurallar
Üstte geri + başlık; tab bar gizli. Formlar/aksiyonlar **bottom-sheet**. Pull-to-refresh listelerde.

## YAPMA
- ❌ ASCII: `Konu Takibi`, `Kaynaklarım`, `Randevular`, `Mesajlar`, `Motivasyon`, `Destek`.
- ❌ Alt ekranda tab bar'ı görünür bırakmak; geri butonunu kaldırmak.
- ❌ Randevu türlerini (Yüz yüze/Online/Telefon) veya değerlendirme yıldızını değiştirmek.
