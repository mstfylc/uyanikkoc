# SADAKAT SPEC — Bireysel Koç · Lisansım (bk-lisans)

Kaynak: `admin/coach-license.jsx → CoachMyLicense`. Mod: `coach`, sayfa `bk-lisans`.
Veri: `getMyCoach()`, `coachPlanById`, `daysLeft`. Tam Türkçe. **Yalnızca kendi lisansı** (RBAC).

## PageHead
- Başlık **`Lisansım`** · alt **`Bireysel koç aboneliğini yönet`** (aksiyon yok)

## Bileşen sırası
1. **Uyarı şeridi** (trial / kalan ≤14 gün / overdue ise): `.alert-strip` + yenileme/yükselt CTA.
2. **`.grid.col-main`**:
   - SOL `.stack`:
     - `Section` **`Plan & yenileme`**: otomatik yenileme toggle (`renew-toggle`) + plan/yenileme bilgisi.
     - `Section` **`Kapasite kullanımı`**: `Meter` **`Öğrenci kapasitesi`** (used/total, 999=∞).
     - `Section` **`Dahil modüller`**: `ModuleGrid readOnly` (koç plan modülleri — değiştirilemez).
   - SAĞ `.stack`:
     - `Section` **`Hızlı bakış`**: Plan · durum · yenileme · ücret KPI'ları.
     - `Section` **`Faturalar`** · sağda **`Tümü`** (→ `bk-faturalar`): son 3 fatura.

## YAPMA
- ❌ ASCII: `Lisansım`, `Plan & yenileme`, `Kapasite kullanımı`, `Dahil modüller`, `Hızlı bakış`.
- ❌ `ModuleGrid`'i düzenlenebilir yapmak (plan modülü salt-okunur; yükseltme `bk-planlar`'dan).
- ❌ 999 kapasite için `∞` göstermemek; başka koçun verisini göstermek.
