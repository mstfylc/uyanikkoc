# SADAKAT SPEC — Mobil · Ana Sayfa (home)

Kaynak: `mobile/uk-screens.jsx → HomeScreen`. PNG: `exports/mobil/ios-light/home.png`. Tab: **Ana Sayfa**.
Native: ScrollView + pull-to-refresh, safe-area top. Tam Türkçe.

## Bileşen sırası (yukarıdan)
1. **Selam + Çalışma Serisi (streak):** `Günaydın` + ad; seri (flame) göstergesi.
2. **Hero:** **`Bugün N ödevin var`** + hedef/koç; **`Ödevlere git`** CTA.
3. **Stat kartları (2×2):** bu hafta çalışma (saat) · net · tamamlama vb. (web `g-4` → mobilde 2×2).
4. **Bugünün ödevleri:** liste + **`Sonuç Gir`** (→ ResultSheet bottom-sheet).
5. **Hızlı erişim:** alt ekran kısayolları (Konu Takibi · Kaynaklarım · Randevular · Mesajlar · Motivasyon · Destek).

## v6 EKLENECEK (V6-HIZALAMA-PLANI)
- **Takvimim kartı** (Ajanda/Hafta/Ay segmenti; ödev+deneme+randevu+tekrar) — web `student-agenda`.
- **Çalışma Serisi kartı** (gün üst üste + rekor + hafta noktaları) — web StreakCard.

## YAPMA
- ❌ ASCII: `Bugün N ödevin var`, `Ödevlere git`, `Sonuç Gir`.
- ❌ Stat kartlarını yatay tabloya çevirmek (mobilde 2×2 kart); hero+streak'i kaldırmak.
- ❌ Sonuç girişini ayrı sayfa yapmak — **bottom-sheet** (ResultSheet).
