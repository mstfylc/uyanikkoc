# Handoff 25 Web/Yonetim Kontrolu

Kaynak paket: `C:/Users/musta/Downloads/uyanikkoc (25).zip`

Mobil uygulama kapsama alinmadi. Kontrol, `Uyanik Koc - Dashboard Paketi v2` icindeki web, yonetim ve handoff modulleri uzerinden yapildi.

## Ekran Eslesmesi

| Handoff alani | Repo karsiligi | Durum |
|---|---|---|
| Ogrenci dashboard / konu / odev / program / deneme / motivasyon / mesaj / test / fatura / destek | `apps/web/app/student/*` + ilgili paneller | Var, canli route kontrolu OK |
| Koc dashboard / ogrenciler / konu / yillik cizelge / odev ata / deneme / mesaj / randevu / test / feedback / rapor / lisans | `apps/web/app/coach/*` + `components/coach/*` | Var, canli route kontrolu OK |
| Veli dashboard / deneme / rapor / mesaj / randevu / fatura / destek | `apps/web/app/parent/*` | Var, canli route kontrolu OK |
| Super Admin ve Kurum yonetim ekranlari | `/yonetim/*` + `components/admin/*` | Var, canli route kontrolu OK |
| Yillik Cizelge liste/cizelge anahtari ve ayri ekran | `CoachTopicsPanel`, `CoachAnnualTopicsPanel`, `KonuCizelge` | Var |
| Kaynak takibi/katalog | `StudentResourcesCard`, `KaynakKatalogModal`, `/api/student/sources` | Var, API aksiyonu OK |
| Online deneme optik | `OptikFormModal`, `/api/*/online-exams` | Var, create/submit/review OK |
| Test builder ve cok tipli cozme | `TestBuilderModal`, `StudentTestsPanel`, `/api/*/tests` | Var, custom test create OK |
| Mesaj gruplari | `GroupCreateModal`, `/api/coach/groups` | Var, create/member update OK |
| Randevu telefon + slot tipi + rol limitleri | `AppointmentsPanel`, appointment service/schema | Eksik parent POST kapatildi |

## Canli Aksiyon Kontrolu

- Student sources: GET/POST/DELETE denendi.
- Coach rating: student POST, coach summary GET denendi.
- Support ticket: POST ve close PATCH denendi.
- Motivation broadcast: coach POST, student latest GET denendi.
- Online exam: coach create, student list/submit/review denendi.
- Test builder: coach custom test create, coach/student list denendi.
- Message group: coach create ve member PATCH denendi.
- Appointment: coach settings PATCH, student phone appointment POST denendi.
- Appointment parent POST ilk kontrolde `405` verdi; bu eksik giderildi.

## Yapilan Duzeltme

- `Appointment.requesterRole` eklendi (`student` / `parent`).
- Randevu aktif limit sayimi requester role bazli hale getirildi.
- `/api/parent/appointments` icin POST eklendi.
- Parent randevu ekranina `Randevu Iste` akisi eklendi.
- Randevu modalinda secilen gorusme tipini desteklemeyen slotlar filtrelendi.
- Ogrenci randevu limiti `weeklyLimitStudent` alanindan okunacak hale getirildi.

## Lokal Dogrulama

- `pnpm --filter @uyanik/database generate`
- `pnpm typecheck`
- `pnpm --filter @uyanik/web lint`
- `pnpm test:unit`
- `pnpm --filter @uyanik/web build`
