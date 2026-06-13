# SADAKAT SPEC — EK · Çalışma Programı: AddBlockModal + Gün görünümü

Kaynak: `src/student-pages.jsx → SchedulePage`, `AddBlockModal`. Rota: öğrenci `schedule`.
Net = `max(0, Doğru − Yanlış/4)`. Tam Türkçe. (Ana spec: `SADAKAT-SPEC-ogrenci-schedule.md`.)

## 1) Gün görünümü (view="day") — `.grid.col-main`
- Üstte gün segmenti (`.seg`): SCHEDULE günleri (bugünde primary nokta) + sonda **`Tüm hafta`** (dashboard ikon → Hafta).
- **`.grid.col-main`:**
  - **SOL** `Section`: başlık `DAYS_FULL[day]` · alt **`{n} çalışma bloğu`** · bugünse `Badge` primary dot **`Bugün`** —
    gövde `BlockCard` listesi (saat | ders renk şeridi | başlık+meta | durum: **`Başla`** → **`Devam ediyor`**+**`Bitir`** → **`Bitti`**).
  - **SAĞ** `.stack`:
    - `.grid.g-2` 2 StatCard: `clock`/primary **`{totalH}s` · "Bu hafta plan"** ; `calendar`/info **`{sessions}` · "Toplam blok"**.
    - `Section` **`Haftalık Çalışma`** · alt **`Günlük tamamlanan saat`** → `BarChart` (max 6, peakIdx 5).
- PageHead sağ: `.seg` **`Gün`**|**`Hafta`** + birincil **`Çalışma bloğu ekle`** (→ AddBlockModal).

## 2) AddBlockModal "Çalışma Bloğu Ekle" (TAM)
Başlık **`Çalışma Bloğu Ekle`** · alt **`{Gün} programına`** · sağ üst kapat (plus 45°). maxWidth 460.
Alanlar (sıra birebir):
1. `.row` **`Başlangıç`** + **`Bitiş`** — `type=time` (yan yana, varsayılan 09:00 / 10:00).
2. **`Ders`** — select (müfredattan; `getCurriculum(sınav)` ders anahtarları).
3. **`Kaynak`** `(kitabın)` — select, **opsiyonel** (`Kaynak seç (opsiyonel)` + öğrencinin kaynakları +
   `Diğer / listede yok`). Kaynak yoksa ipucu: **`Henüz kaynağın yok. "Ödevlerim → Kaynaklarım"dan kitap ekleyebilirsin.`**
4. **`Konu / başlık`** — input (autofocus, ≥2 karakter), örn. `Türev - kural tekrarı`.
5. **`Tür`** — chip'ler: **`Soru çözümü`** · **`Konu tekrarı`** · **`Deneme`** · **`Video ders`** (seçili primary).
6. **Soru çözümü/Deneme seçiliyse** **`Soru çözümü (opsiyonel)`**: `.row` 3 numeric — **`Soru`** / **`Doğru`** / **`Yanlış`**.
   - Canlı gösterim: **`Boş: {n}`** + **`Net: {x.xx}`** (Boş = `max(0, Soru−D−Y)`, Net = `max(0, D−Y/4)`).
   - D+Y > Soru ise hata (danger): **`Doğru + yanlış, soru sayısını aşamaz.`**
- Footer: **`Vazgeç`** · **`Ekle`** (plus) — konu ≥2 karakter ve tutarlı (count uyuşmazlığı yok) ise aktif; eklenince toast **`Çalışma bloğu eklendi`**.

## 5 zorunlu alan
- **Bileşen sırası + grid:** Gün → `col-main` [SOL bloklar | SAĞ g-2 StatCard + BarChart]; modal alan sırası yukarıda.
- **StatCard:** clock/primary "Bu hafta plan" · calendar/info "Toplam blok".
- **Başlık/alt:** "Çalışma Bloğu Ekle" / "{Gün} programına"; "Haftalık Çalışma" / "Günlük tamamlanan saat".
- **Liste/satır yapısı:** BlockCard (saat·renk şeridi·başlık·meta·durum butonu).
- **Boş/durum:** kaynak yok ipucu; D+Y>Soru uyarısı; Başla/Devam/Bitti durumları + toast'lar.

## PNG
`exports/uyum/schedule-gun.png` (light+dark, 1440). **AddBlockModal** portal+fixed olduğundan tarayıcı-içi
araçla yakalanamadı → gerçek DevTools ile aç-yakala (QA reçetesi); açma: "Çalışma bloğu ekle".

## YAPMA
- ❌ ASCII: `Çalışma Bloğu Ekle`, `Soru çözümü`, `Video ders`, `Net`, `Boş`.
- ❌ Net formülünü (`max(0,D−Y/4)`) veya "D+Y soruyu aşamaz" kuralını değiştirmek.
- ❌ Sağ sütundaki 2 StatCard + BarChart'ı kaldırmak; Tür chip setini değiştirmek; Kaynak'ı zorunlu yapmak.
