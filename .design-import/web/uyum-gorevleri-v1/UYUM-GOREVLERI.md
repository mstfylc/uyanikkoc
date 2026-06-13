# UYUM GÖREVLERİ — Görsel doğrulamalı düzeltmeler (web uygulaması)

Bu paket, **metin/spec uyumundan ayrı**, davranış + yerleşim doğrulaması gerektiren işleri toplar.
Doğruluk kaynağı: `uyanikkoc-web-source-v5` / `uyanikkoc-web-claudecode-v6` kanonik prototip ve
`handoff/SADAKAT-SPEC-*.md`. Her görevin yanında **kabul kriteri** + **referans** (spec + PNG) vardır.

> Yöntem: prototipi tarayıcıda aç → ilgili ekrana git → Codex çıktısıyla **yan yana karşılaştır** →
> kabul kriterleri sağlanana kadar düzelt. PNG'ler `exports/` altında.

---

## GÖREV 1 — Çalışma Programı (schedule): Gün/Hafta + hafta takvim ızgarası + zengin AddBlockModal
**Rota:** öğrenci `schedule` · **Kaynak:** `src/student-pages.jsx → SchedulePage`, `AddBlockModal` ·
**Spec:** `SADAKAT-SPEC-ogrenci-schedule.md` · **PNG:** `exports/schedule-gun.png`, `exports/schedule-hafta.png`

Codex sürümünde eksik/sade kalan kısım: **Gün/Hafta görünüm segmenti** ve **haftalık takvim ızgarası**.
Kabul kriterleri:
- [ ] PageHead sağında `.seg`: **`Gün`** (calendar ikon) | **`Hafta`** (dashboard ikon). Varsayılan **Gün**.
- [ ] **Gün görünümü:** gün segmenti (Pzt…, bugünde primary nokta) + sonda **`Tüm hafta`**;
      `.grid.col-main` → SOL gün blokları (`BlockCard`), SAĞ 2 StatCard (**`Bu hafta plan`**/**`Toplam blok`**) +
      **`Haftalık Çalışma`** BarChart.
- [ ] **Hafta görünümü:** `Section` **`Haftanın Tümü`** → **`.wk-cal`** ızgarası (min-width 760, yatay kaydırma):
      saat sütunu + gün sütunları, bloklar konumlandırılmış (`.wk-block`), bugün sütunu vurgulu,
      blok tıklanınca başla/bitir.
- [ ] **BlockCard durum akışı:** Başla → "Devam ediyor" + **Bitir** → "Bitti" (toast'lar dahil).
- [ ] **AddBlockModal "Çalışma Bloğu Ekle":** Başlangıç/Bitiş (time) · Ders (müfredat) · Kaynak (kitabın, ops.) ·
      Konu/başlık · Tür chip'leri (`Soru çözümü/Konu tekrarı/Deneme/Video ders`) · Soru çözümü/Deneme'de
      Soru/Doğru/Yanlış + canlı **Boş**/**Net** + "D+Y soruyu aşamaz" uyarısı. Net = `max(0, D − Y/4)`.
- [ ] Tüm metinler tam Türkçe (`Çalışma Programı`, `Tüm hafta`, `gün` değil ASCII).

---

## GÖREV 2 — Ödev sonucu → Yanlış Defteri / Koç notu köprüleri
**Rotalar:** öğrenci `assignments` · koç `c-assignments` ·
**Kaynak:** `src/odev-student.jsx` (sonuç gir), `src/yanlis-defteri.jsx → MistakeBatchModal`,
`src/coach-pages.jsx → CoachNoteModal` · **Spec:** `SADAKAT-SPEC-ogrenci-assignments.md`,
`SADAKAT-SPEC-koc-c-assignments.md`

Codex sürümünde eksik kalan: ödev tamamlama akışındaki **iki köprü**.
Kabul kriterleri (öğrenci · assignments):
- [ ] Ödev sonucu girilirken (D/Y/B) **yanlış varsa** otomatik **`MistakeBatchModal`** (Toplu yanlış→defter)
      açılır; seçilen yanlışlar hata tipiyle Yanlış Defteri'ne (`uk_mistakes_v1`) eklenir.
- [ ] Eklenen yanlışlar Sıfır Hata Döngüsü'ne girer (stage 0, nextDue +1 gün).

Kabul kriterleri (koç · c-assignments):
- [ ] **Tamamlanan** ödev satırında **`Not gönder`** → **`CoachNoteModal`**.
- [ ] Not, koç↔öğrenci DM'ine `sendMsg` ile düşer → öğrenciye **bildirim**; ödevse `updateOdev(id,{feedback})`.
- [ ] Deneme detayında (`coach-pages2.jsx · ExamStudentDetail`) de "Not gönder" aynı modalı açar.

> PNG: modal portal olduğu için curated set'te yok; **gerçek tarayıcıda** tetikleyip doğrula
> (assignments → sonuç gir; c-assignments → tamamlanan satır → Not gönder).

---

## GÖREV 3 — Ayarlar: şifre değiştirme "Hesap" sekmesinde
**Rota:** `settings` (GENEL) · **Kaynak:** `src/settings.jsx → SettingsPage`, `SettingsAccountTab` ·
**Spec:** `SADAKAT-SPEC-ortak-settings.md` · **PNG:** `exports/settings-hesap.png`

Kabul kriterleri:
- [ ] Sekme sırası: **`Müfredat`** (yalnız koç) · **`Hesap`** · **`Görünüm`** · **`Bildirimler`** · **`Gizlilik & Güvenlik`**.
- [ ] **Şifre değiştirme `Hesap` sekmesindedir** (ayrı sekme/sayfa DEĞİL): Mevcut şifre · Yeni şifre
      (**`En az 6 karakter`**) · Yeni şifre (tekrar, **`Şifreler eşleşmiyor`**) · **`Şifreyi güncelle`** (geçerliyse aktif).
- [ ] `Hesap` sekmesinde ayrıca **`Oturum`** bölümü → **`Çıkış Yap`** (danger).

---

## GÖREV 4 — Online Denemeler (c-online): tasarımda var, prod'da ayrı rota yok
**Rota:** koç `c-online` · **Kaynak:** `src/online-deneme.jsx → CoachOnlineExams` ·
**Spec:** `SADAKAT-SPEC-koc-c-online.md` · **PNG:** `exports/exams-online.png` (öğrenci tarafı Online sekmesi)

Durum: Bu ekran **tasarımda mevcut** (koç sidebar'ında `c-online`), prod uygulamasında ayrı rota
olmayabilir. **Karar gerekiyor:**
- [ ] Eğer prod'a eklenecekse: `CoachOnlineExams` birebir uygulanır (paket/yetki kilidi `LockBanner`,
      "Oluşturduğun Online Denemeler" listesi, oluştur modalı). Öğrenci tarafı: Denemeler → **Online Deneme** sekmesi.
- [ ] Eğer eklenmeyecekse: koç sidebar'ından `c-online` menü öğesi kaldırılır **ve** öğrenci Denemeler'deki
      "Online Deneme" sekmesi gizlenir (tutarlılık). RISKS'e not düş.
> Bu bir **ürün kararı** — kendiliğinden ekleme/çıkarma yapma, önce onay al.

---

## Özet kontrol listesi
| # | Görev | Tür | Referans |
|---|---|---|---|
| 1 | schedule Gün/Hafta + .wk-cal + AddBlockModal | yerleşim+davranış | spec + 2 PNG |
| 2 | assignments/c-assignments → MistakeBatch & CoachNote köprüleri | davranış (modal) | spec (modal, DevTools ile doğrula) |
| 3 | settings şifre → Hesap sekmesi | yerleşim | spec + PNG |
| 4 | c-online ekle/kaldır kararı | ürün kararı | spec + PNG |
