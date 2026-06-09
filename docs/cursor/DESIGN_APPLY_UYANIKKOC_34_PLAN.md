# Uyanikkoc 34 - Superadmin v3 Uygulama Plani ve Raporu

Kaynak paket: `C:/Users/musta/Downloads/uyanikkoc (34).zip`

Kaynak klasor: `.design-import/uyanikkoc-34/indir/Uyanik Koc - Yonetim Paneli v3`

## Kapsam

- Mobil uygulama kapsam disi tutuldu.
- CRM dosyalari ve env/upload/log alanlarina dokunulmadi.
- Kaynak tasarim kodu esas alindi: `kaynak/admin/leads.jsx`, `kaynak/admin/settings.jsx`, `kaynak/admin/admin-data.jsx`, `handoff/YENI_EKRANLAR.md`.

## Risk Report

Bu faz iki yeni superadmin ekranini, route baglantisini, ortak admin snapshot tiplerini, memory mutation katmanini ve ikon haritasini beraber gerektirdigi icin AGENTS.md'deki 8-10 dosya sinirini asiyor. Degisiklikler yine sadece web yonetim/admin yuzeyiyle sinirli tutuldu.

## Uygulama Adimlari

1. Kaynak paket acildi ve handoff dosyalari okundu.
2. Superadmin menusu `Demo & Uyelikler` route'u ile genisletildi.
3. `SALeads` tasarimi `SuperLeads` olarak uygulandi.
4. `SASettings` tasarimi `SuperSettings` olarak uygulandi.
5. `/yonetim/settings` superadmin icin `SuperSettings`, kurum icin mevcut `BranchSettings` gosterecek hale getirildi.
6. `demoRequests`, `signups`, `integrations` veri alanlari admin snapshot tiplerine ve mock seed'e eklendi.
7. Handoff aksiyonlari admin mutation servisine eklendi: demo talebi ekleme/silme, durum, randevu, not, entegrasyon bagla/kes/guncelle.
8. Yeni ikonlar SVG haritasina eklendi: `phone`, `trash`, `link`, `ki-clipboard`, `ki-exit-down`, `ki-trash`, `ki-shield-cross`, `ki-phone`.

## Tasarim Karsilastirmasi

Uygulanan:

- Demo talepleri kart listesi, durum filtresi, arama, huni ve kaynak dagilimi.
- Yeni demo talebi modalinda kurum/koc turu, iletisim, kaynak, plan ve not alanlari.
- Detay modalinda asama stepper'i, randevu alani, gorusme notlari ve not silme.
- Kayip akisinda zorunlu neden ve `Kayip nedeni: ...` not kaydi.
- Yeni uyelik & satin alma tablosu, 30 gun gelir/uyelik ozetleri ve CSV indir.
- Ayarlar sayfasinda `Ekip & Erisim` ve `Basvuru Kaynaklari` sekmeleri.
- Tam yetki/destek yetkilisi rolleri, davet, rol degistirme, kaldirma.
- Meta, Google, Jotform ve Webhook entegrasyon kartlari, bagla/yonet/kes akislari.
- Destek yetkilisi icin ayarlarda salt goruntuleme kurali.

Fark / bilincli entegrasyon notu:

- Handoff'taki entegrasyonlar gercek OAuth/webhook yerine mevcut admin memory/service yuzeyine baglandi. Repo mevcut mimarisi bu ekranda kalici gercek entegrasyon tablosu kullanmiyor; UI ve mutation yuzeyi hazir.
- `setIntegration` UI tarafindan direkt cagrilmiyor ama handoff aksiyon listesiyle uyum icin backend mutation olarak eklendi.

Atlanan satir / alan:

- Bilinen atlanan UI alani yok.
- Mobil uygulama alanlari talimat geregi islenmedi.

## Test Plani

- `pnpm --filter @uyanik/web typecheck`
- `pnpm --filter @uyanik/web lint`
- `pnpm --filter @uyanik/web test -- __tests__/admin-mutation-scope.test.ts __tests__/rbac.test.ts __tests__/icons.test.ts`
- `pnpm test:unit`
- `pnpm --filter @uyanik/web build`
- Local Playwright smoke: admin login, `/yonetim/leads`, `/yonetim/settings`, temel buton/modal aksiyonlari.
- Production smoke: gercek superadmin login, `/yonetim/leads`, `/yonetim/settings`.

## Durum

- Uygulama: tamamlandi.
- Test: tamamlandi.
- Deploy: tamamlandi.

## Test Sonuclari

- `pnpm --filter @uyanik/web typecheck`: gecti.
- `pnpm --filter @uyanik/web lint`: gecti.
- `pnpm --filter @uyanik/web test -- __tests__/admin-mutation-scope.test.ts __tests__/rbac.test.ts __tests__/icons.test.ts`: 20 test gecti.
- `pnpm test:unit`: 87 web testi dahil tum unit seti gecti.
- `pnpm --filter @uyanik/web build`: gecti; `/yonetim/leads` ve `/yonetim/settings` route'lari build edildi.
- `pnpm --filter @uyanik/web test:e2e`: 12 test gecti.
- Local browser smoke: admin demo login sonrasi `/yonetim/leads` ve `/yonetim/settings` 200; ana basliklar, sekmeler, kartlar, modal ve entegrasyon listesi gorundu.
- Production smoke: gercek superadmin login sonrasi `https://www.uyanikkoc.com/yonetim/leads` ve `https://www.uyanikkoc.com/yonetim/settings` acildi; demo talepleri, yeni uyelik tablosu, ekip & erisim ve basvuru kaynaklari alanlari gorundu.

## Deploy

- Vercel production deploy Ready.
- Alias smoke: `https://www.uyanikkoc.com`

## Smoke Kanitlari

- Local ve production smoke ekran goruntuleri test sirasinda uretildi; generated test artefakti oldugu icin repoya eklenmedi.
