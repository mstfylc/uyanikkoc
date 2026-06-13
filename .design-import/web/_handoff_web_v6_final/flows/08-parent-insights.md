# Flow — Veli: Panel İçgörüleri (salt-görüntüleme)

> Rol: **veli** · Rota: `dashboard` (Genel Bakış) · Demo çocuk: `CHILD = "Elif Yıldız"`
> Kaynak: `parent.jsx · VeliDashboard`

## İçerik (Genel Bakış sırası)
1. Hero — "Çocuğunuz {ad}'in gelişimi · Koç Dilek Emen".
2. Özet stat kutuları (haftalık ödev tamamlama, son deneme neti vb.).
3. Haftalık Ödevler · Koç notları (pinned) · Randevular · Çalışma programı özetleri.
4. **NetGainMap** — `student={CHILD} sinav="YKS" role="parent"` → **salt-görüntüleme** (hiçbir CTA yok; sadece en hızlı net fırsatları + sıradakiler).
5. **HataFrekansiCard** — `student={CHILD} role="coach"` → çocuğun gerçek yanlış verisinden hata tipi dağılımı + teşhis (salt-görüntüleme).
   > Not: kaynakta veli için bilinçli olarak `role="coach"` geçilir (koç-stili alt başlık "{çocuk} · son 14 gün"; boş-durumda gizlenir, öğrenci-stili boş metin gösterilmez).
6. **KaynakTracker** — `student={CHILD} editable={false}` (salt-görüntüleme kaynak takip).

## Veri kaynakları (hepsi gerçek store)
`useOdevler`(CHILD) · `useExams` · `useNotes`(CHILD) · `useAppts`(CHILD) · `useSched`(CHILD) · `getMistakes`(CHILD) (NetGainMap + HataFrekansi içinden).

## Yetki kapsamı
Veli **yalnız kendi çocuğunun** verisini görür; hiçbir değiştirme aksiyonu yoktur (ödev atama, yanlış ekleme, not gönderme YOK). Mesajlarda yalnız çocuğun koçu + üyesi olduğu gruplar.

## Durumlar
- NetGainMap `top` boşsa render olmaz.
- HataFrekansi (role=coach) total=0 ise gizlenir.
- Deneme yoksa "Deneme Sonuçları" boş-durum kartı.

## Backend
Veli ↔ çocuk ilişkisi yetkiyle sınırlandırılmalı (veli yalnız bağlı öğrencinin read-only verisi). İçgörüler sunucu hesaplı.
