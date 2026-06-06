# Latest Handoff

**Son tamamlanan faz:** Mobil tasarım — Koç verimlilik backend'leri (Görevler + Toplu Duyuru)  
**Branch:** `claude/elegant-mccarthy-9tfNd`

## Bu faz (design coach-productivity)

Kaynak: Claude mobil tasarımı (tek dosya, öğrenci/koç/veli). Tasarımdaki backend'siz iki
koç ekranı için API yazıldı:

- **Koç Görevleri** — `GET /api/coach/tasks`, `POST` (action: create | toggle | delete)
  - Model `CoachTask` (text, studentId?, due?, done, priority high|med|low), koç-scope'lu
  - Servis sıralaması: tamamlanmamış → öncelik → en yeni
- **Koç Toplu Duyuru** — `GET /api/coach/announcements`, `POST { title, body, audience }`
  - Model `CoachAnnouncement`; kitle çözümü (veli içeren → veliler, diğer → kadro)
  - Oluşturma kadro/velilere `Notification` üretir; `reach` = gerçek alıcı sayısı
- Her iki özellik DB + bellek (mock) modunda; migration `20260606180000_coach_tasks_announcements`
- **Düzeltme:** `@uyanik/database` paketine eksik `@uyanik/shared` workspace bağımlılığı eklendi
  (billing/online-exam repo'ları kullanıyordu; izole tsc çözemiyordu)

## Test özeti

typecheck ✓ · lint ✓ · unit 51 ✓ (yeni: `coach-productivity.test.ts` 6 test)

> Not: `DATABASE_URL` yok → bellek modunda doğrulandı. DB için `pnpm db:migrate && pnpm db:seed`.

---

## Önceki faz (Review follow-up)

**Son commit:** `1831e36` — `docs(cursor): handoff and run-log for review follow-up`

## Vercel demo (güncel)

- URL: `https://uyanikkoc.vercel.app`
- Health: `/api/health` → `authSecret: "ok"` ise env tamam; yeni secret üretmeye gerek yok
- Login: `student@uyanik.local` / `uyanik123`
- PR merge **gerekmez** — tüm fix'ler `main`'de (`2faf8e1` auth + `91cd19b`…`1831e36` review)

## Bu faz (review follow-up)

- `fix(coach)` — koç rapor özetinde `resolveParentIdForStudent`
- `fix(appointments)` — `resolveCoachIdForStudent`; koç yoksa 404
- `fix(exams)` — CSV import sunucu doğrulaması
- `feat(health)` — `authSecret: ok|missing` teşhisi
- Açık follow-up: mock sabitlerini `lib/constants`'a taşıma (henüz yapılmadı)

Env sorunu yalnızca `authSecret: "missing"` görürseniz — bkz. `docs/deploy/VERCEL.md` (**All Environments**).

## Önceki faz (P14 roster)

- `CoachStudent` modeli + migration `20260604220000_coach_student_roster`
- `GET /api/coach/students` — koç roster listesi
- Ödev/deneme formlarında öğrenci seçimi (dropdown)
- `/coach/students` roster sayfası + detay linkleri
- Seed: `student_002`, `parent_002`, iki koç–öğrenci bağlantısı

## Migration

Yerel: `pnpm db:migrate && pnpm db:seed`

## Test özeti

typecheck ✓ · unit ✓ · build ✓
