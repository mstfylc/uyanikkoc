# Component Spec — Ödev Plan Item & Koç Geri Bildirim

> Kaynak: `src/odev-student.jsx` (`OdevCard`, `OdevResultModal`, `OdevDailyPlan`, `OdevCalendar`, `StudentOdevList`), `src/coach-pages.jsx` (`CoachAssignmentRow`, `CoachNoteModal`)
> Store: `uk_odevler_v1` (`odev-store.jsx`)
> Stiller: `.lrow`, `.lr-icon`, `.lr-title`, `.lr-meta`, `.odev-cal-*`, `.ata-srcinfo` (`src/styles.css`, `src/odev-ata.css`)

## `OdevCard` (öğrenci ödev satırı)
`.lrow` (tamamlanınca `.done`):
- **İkon** `.lr-icon`: arka `color-mix(in srgb, <ders rengi> 13%, transparent)`, renk = ders rengi, ödev türü ikonu.
- **Orta:** `.lr-title` (konu) + `.lr-meta` (ders chip renk swatch + tür etiketleri + "{count} soru" + kaynak (book ikon)). Not varsa "📌 {note}" rozeti. Tamamlanıp sonuç varsa: ✓{d} ✕{y} ○{b} + `badge-primary` "net {…}".
- **Sağ:** done → `Badge success` "Bitti"; değilse → `btn-primary btn-sm` ("Sonuç Gir" / "Tamamla"). Altında bitiş tarihi (gecikmişse danger "Gecikti · …"). **Gecikme eşiği:** `due < 2026-06-05`.

## `OdevResultModal` (sonuç girişi — D/Y/B)
- `max-width 440`. `needsResult` (soru/test türü) ise 3 input (Doğru/Yanlış/Boş) + canlı **net** kutusu (`d - y/4`). Aksi: "tamamla" onayı.
- **Kaydet:** `updateOdev(id, { status:"done", result })` → toast.
- **Yanlış Defteri beslemesi:** sonuç kaydedilirken `y > 0` ise `MistakeBatchModal` açılır; `batchSlots` = `min(y,12)` adet `{subject, topic, qType:"klasik"}` (bkz. flows/odev-result-to-mistakes.md).

## Ödev görünümleri (öğrenci `assignments` rotası)
- **`OdevDailyPlan` (varsayılan görünüm):** "Geciken görevler" Section (varsa) + günlük gruplar ("Bugün/Yarın/…"). Bugün boşsa yine "Bugün" başlığı + teşvik metni.
- **`OdevCalendar`:** ay ızgarası; gün hücresinde ders renkli noktalar (done→success, gecikmiş→danger). Gün seçince o günün listesi.
- **`StudentOdevList`:** hafta seç (Bugün/Yarın + `WEEKS`) → "Atanan Ödevler".

## `CoachAssignmentRow` (koç — Ödev & Görev satırı)
`.lrow`: öğrenci avatarı + konu·öğrenci + meta (ders chip + tür + soru + kaynak + tarih(gecikmişse danger)). Not varsa "📌". Tamamlanıp sonuç varsa ✓/✕/○ + net + "%{çözüm}". Sağ: done → `Badge success` ("Sonuç girildi"/"Tamamlandı") + **"Not"** butonu (`CoachNoteModal`); değilse `Badge warning/danger` (Bekliyor/Gecikti).

## `CoachNoteModal` (koç → öğrenciye geri bildirim notu)
- `max-width 470`. Head: primary-soft `lr-icon` + `send` ikon · "Geri bildirim gönder" · {öğrenci}.
- Bağlam şeridi `.ata-srcinfo` (ödev/deneme ikonu + başlık + stat).
- textarea + 4 hazır şablon chip (`yd-type`): "Eline sağlık, güzel ilerleme 👏" / "Bu konuda biraz daha pratik gerekiyor." / "Yanlışlarını deftere eklemeyi unutma." / "Süre yönetimine dikkat edelim."
- Foot: muted "Mesaj olarak iletilir · öğrenciye bildirim gider" + `btn-ghost` Vazgeç + `btn-primary` Gönder (disabled boşken).
- **Gönder:** `sendMsg("dm:"+student, coach, "coach", "📌 {başlık} — {metin}")` + (ödevse) `updateOdev(id, { feedback })` + toast "{ad}'e geri bildirim gönderildi". Mount: `CoachAssignmentRow` (tamamlanan ödev) ve `coach-pages2.jsx · ExamStudentDetail` (deneme detayı).

## Enum referansı
`ODEV_TYPES`: soru(Soru Çözümü, needsResult) / video(Video İzleme) / konu(Konu Çalışması) / test(Deneme/Test, fixed). `WEEKS`: w0..w3. `EXAM_SORU`: YKS 120 / LGS 90. Demo "bugün": `ODEV_TODAY = 2026-06-05`. Tam alanlar: data-contracts/assignments.json.
