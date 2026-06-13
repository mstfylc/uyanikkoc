# Flow — Koç: Öğrenciye Geri Bildirim Notu Gönderme

> Rol: **koç** · Rotalar: `c-assignments` (tamamlanan ödev satırı), `c-exams` (deneme detayı)
> Kaynak: `coach-pages.jsx · CoachNoteModal / CoachAssignmentRow`, `coach-pages2.jsx · ExamStudentDetail`
> Store: `uk_msg_v1` (DM), `uk_odevler_v1` (feedback), `uk_notif_v2` (bildirim)

## Tetikleyiciler
1. **Tamamlanan ödev** satırında (`CoachAssignmentRow`, `status==="done"`) → **"Not"** butonu.
2. **Deneme detayında** (`ExamStudentDetail`) → **"Not gönder"** butonu.

## Adımlar
1. Buton → `CoachNoteModal` (bağlam: ödev başlığı / deneme adı + stat).
2. Koç notu yazar; 4 hazır şablon chip'inden ekleyebilir:
   - "Eline sağlık, güzel ilerleme 👏" · "Bu konuda biraz daha pratik gerekiyor." · "Yanlışlarını deftere eklemeyi unutma." · "Süre yönetimine dikkat edelim."
3. **Gönder** (boşken disabled):
   - `sendMsg("dm:"+student, coach, "coach", "📌 {bağlamBaşlığı} — {metin}")` → koç↔öğrenci DM'ine düşer.
   - bu `sendMsg` öğrenciye **bildirim** üretir (`pushNotif("student", … page:"messages")`).
   - ödev bağlamıysa: `updateOdev(odevId, { feedback: metin })`.
   - toast: "{ad}'e geri bildirim gönderildi".

## Durumlar
- Not yalnız **tamamlanmış** ödevde gönderilebilir (bekleyende buton yok).
- Öğrenci tarafında: Mesajlar'da 📌 ön ekli mesaj + okunmamış rozeti + çan bildirimi.

## Backend
DM mesajı `messages`/`threads`; `assignments.feedback` güncellenir; bildirim `notifications`; gerçek-zaman push.
