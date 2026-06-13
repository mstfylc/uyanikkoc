# Görsel QA — Kabul Kontrol Listesi (acceptance-checklist)

> Codex'in `apps/web`'e uyguladığı her v6 yüzeyi, kanonik prototiple karşılaştırılarak işaretlenir.
> Referans: bu paketteki `exports/*` PNG'leri + `indir/uyanikkoc-web-source-v5/` canlı prototip (her iki tema, desktop+mobil).

## 0. Tasarım sistemi temeli (her şeyden önce)
- [ ] `:root` ve `[data-theme="dark"]` değişkenleri `tokens/*` ile **birebir** (özellikle `--muted` light = **#6B6F85**, eski #767A90 DEĞİL).
- [ ] `--surface` dark = `#181C2B` (kaynaktaki çift tanımın ikincisi).
- [ ] Font: Plus Jakarta Sans (400–800) yüklü; `--font` stack doğru; `.tnum` sayılarda tabular-nums.
- [ ] radius (9/13/18/24), shadow (sm/md/lg/primary), sidebar-w 264, header-h 70 doğru.
- [ ] `color-mix()` ve `.app` arka plan radial-gradient'leri korunmuş.

## 1. Shell & navigasyon
- [ ] Sidebar nav-item rest/hover/active stilleri (active = primary-soft + primary-600 + border color-mix).
- [ ] "Yeni"/"Yakında" nav-tag ve nav-count (ödev "4", mesaj "5") konum/renk.
- [ ] Topbar: crumb, rol seg (≤760 gizli), arama (≤1160 gizli), tema toggle, NotifBell, user-pop.
- [ ] ≤880px: sidebar gizlenir, bottom-nav görünür (role'e göre 4 + Menü), nav-item min-height 44.
- [ ] Tema toggle `<html data-theme>` ile çalışır; tüm yüzeyler iki temada da doğru.

## 2. Yanlış Defteri (student `mistakes`)
- [ ] 4 özet kutusu (toplam/açık/kapandı/bugün tekrar) ikon+tone doğru.
- [ ] ZeroErrorLoop: due satırları, stage noktaları (4), "Tekrar ettim", boş-durum "döngü temiz".
- [ ] HataFrekansiCard: yatay barlar (tone renkli), teşhis cümlesi, "En sık yanlış konular".
- [ ] MistakeAddModal: 6 hata-tipi toggle (seçili = tone border/renk), foto ekleme/önizleme, "1→3→7→21" notu.
- [ ] MistakeRow: thumbnail/placeholder, badge'ler, durum, sil.
- [ ] Odak Tekrar modalı: ilerleme çubuğu, kart, "Tekrar ettim/Atla", bitiş ekranı.

## 3. Besleme akışları
- [ ] Ödev sonucu `y>0` → MistakeBatchModal otomatik (max 12 slot), bulk + satır hata tipi.
- [ ] Deneme analizi "Yanlışları deftere ekle" yalnız `y>0` öncelikli konu varsa görünür (max 14 slot).

## 4. Net Kaybı Haritası
- [ ] Manşet cümle + 3 kazanç kartı (rank, band, ders renk, +estNet, lever badge, trend, faktör barları).
- [ ] Rol CTA: coach "Ödev ata", student "Programa ekle", parent CTA YOK.
- [ ] "Sıradaki fırsatlar" listesi + v1/v2 notu.

## 5. Akıllı Ödev (coach `c-assignments`)
- [ ] Analiz bloğu (4 sinyal + zayıf ders chip'leri + öneri cümlesi).
- [ ] Ayarlar: yoğunluk/odak/güne böl/kaynak + 2 toggle → değişince plan yeniden üretilir.
- [ ] Gün blokları + satır düzenleme (konu/tür/soru/sil), boş gün metni.
- [ ] Foot özet ("{N} ödev · {soru} soru · {gün} gün"); "Planı ata" → "Atandı!".

## 6. Takvimim (student dashboard)
- [ ] Ajanda/Hafta/Ay seg; filtre şeridi (Tümü/Ödev/Deneme/Randevu/Tekrar sayaçlı).
- [ ] Ajanda grupları (Gecikmiş/Bugün/Yarın/tarih), Hafta 7 kolon, Ay 6×7 + tür noktaları + seçili gün listesi.
- [ ] Item renk/ikon kaynak türüne göre doğru; tıklama ilgili sayfaya gider.

## 7. Mesajlaşma + Bildirim
- [ ] İki panel: kanal listesi (Gruplar/Birebir) + sohbet; okunmamış rozet+bold; saat primary-600.
- [ ] Balon stilleri (kendi primary/beyaz sağ, karşı surface sol), "yazıyor…" (DM), gönder butonu.
- [ ] Sessize al (çan danger, otomatik yanıt yok); okundu → rozet temizlenir.
- [ ] Koç: Grup Oluştur/Üyeler modalı; görünürlük rolü doğru (student yalnız koç DM + grupları).
- [ ] NotifBell rozet + açılır liste; tıklayınca ilgili sayfaya.

## 8. Koç geri bildirim & atama
- [ ] Tamamlanan ödevde "Not" + deneme detayında "Not gönder" → CoachNoteModal (4 şablon).
- [ ] Gönder → DM'e 📌 mesaj + öğrenciye bildirim + (ödevse) feedback.
- [ ] CoachKonuPage'de yanlış grubu/konu satırı/NetGainMap "Ödev ata" → OdevAtaModal önyüklü.

## 9. Veli içgörüleri
- [ ] VeliDashboard: NetGainMap (CTA yok) + HataFrekansi (role=coach) + KaynakTracker (readonly).
- [ ] Yalnız çocuğun verisi; hiçbir değiştirme aksiyonu yok.

## 10. Durumlar (her modülde)
- [ ] empty / loading / error / disabled durumları kontrol edildi (bkz. data-contracts/*).
- [ ] Toast metinleri birebir (component spec'lerdeki Türkçe metinler).
- [ ] Boş-durum metinleri birebir.

## 11. Responsive & erişim
- [ ] Breakpoint davranışları (1160/880/760/720/640/520/400) doğru.
- [ ] Dokunma hedefi ≥44px (mobil).
- [ ] `prefers-reduced-motion`: .rise/animasyonlar kapanır; içerik görünür.
- [ ] Modal: overlay tıkla-kapat, ESC, focus, scroll kilidi.

## İmza
- [ ] Tüm rotalar 4 varyantta (desktop-light/dark, mobile-light/dark) görsel diff eşiğinin altında (bkz. allowed-diff-threshold.md).
