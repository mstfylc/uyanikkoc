# Flow — Koç: Yanlışlardan / Net Haritasından Ödev Atama

> Rol: **koç** · Rota: `c-topics` (Konu Takibi) · Store: `uk_mistakes_v1` (oku) → `uk_odevler_v1` (yaz)
> Kaynak: `coach-konu.jsx · CoachKonuPage`, `yanlis-defteri.jsx · CoachMistakesCard`, `net-gain-map.jsx`, `coach-odev-ata.jsx · OdevAtaModal`

## Mount düzeni (CoachKonuPage)
Bir öğrenci seçiliyken sayfada sırayla:
1. **NetGainMap** (role="coach") — `onPick={(a) => openAta(a.subject, a.topic)}`.
2. **CoachMistakesCard** — `onAssign={(s, t) => openAta(s, t)}`.
3. **HataFrekansiCard** (role="coach", salt-görüntüleme).
4. Konu ısı tablosu (her satırda "Ödev ata" → `openAta(subj, topic)`).
Tümü tek **`OdevAtaModal`**'ı `initialSubject`/`initialTopic` önyüklü açar.

## Adımlar (yanlışlardan)
1. **CoachMistakesCard** öğrencinin açık yanlışlarını `subject::topic` ile gruplar; her grupta baskın hata tipi + "{n} yanlış" + alt konular.
2. Grup satırında **"Ödev ata"** → `openAta(subject, topic)` → `OdevAtaModal` ders+konu önyüklü açılır.
3. Koç kaynak/soru sayısı/tür/not/bitiş seçer → **Ata** → `handleAssign(items, note, due)` → `addOdevler(...)` → toast ("ödev atandı").

## Adımlar (net haritasından)
- NetGainMap top kartında / sıradaki satırda **"Bu konuya ödev ata"** (coach) → aynı `openAta(subject, topic)` → OdevAtaModal.

## Durumlar
- **empty:** öğrenci hiç yanlış eklememişse CoachMistakesCard "Bu öğrenci henüz yanlış eklemedi."; NetGainMap `top` boşsa hiç render olmaz.
- **salt-görüntüleme yok:** koç görünümünde her zaman ödev-atama CTA'ları aktiftir.

## Backend
Yanlış verisi öğrenciden okunur (yetki: koç ↔ kendi öğrencisi); ödev `assignments` insert; öğrenciye bildirim.
