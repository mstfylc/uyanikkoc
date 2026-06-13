# Uyanık Koç — Web v6 Final Görsel Handoff (`_handoff_web_v6_final`)

Bu paket, **Uyanık Koç web v6** tasarımının `apps/web` (Next.js) hedefine **pixel-perfect** uygulanması için hazırlanmış final görsel + sözleşme paketidir. Hazırlandığı kanonik doğruluk kaynağı: **`indir/uyanikkoc-web-source-v5/`** (çalışan React+Babel prototip + `tokens.json` + `src/styles.css`).

> **Tasarımda olmayan hiçbir ekran/component/renk uydurulmadı.** Belirsiz veya ortam kısıtı nedeniyle üretilemeyen her şey **`RISKS_AND_GAPS.md`** içinde açıkça listelenmiştir. Önce onu oku.

## Klasör yapısı
```
_handoff_web_v6_final/
├── manifest.json                  # paket envanteri + okuma sırası
├── README.md                      # bu dosya
├── RISKS_AND_GAPS.md              # ÖNCE OKU — eksikler / tutarsızlıklar / kapsam
├── tokens/
│   ├── colors.json                # marka/semantik/nötr/ders renkleri (light+dark, css değişkeni eşli)
│   ├── typography.json            # font + ağırlık + boyut ölçeği
│   ├── spacing.json               # layout + boşluk + kontrol yüksekliği + breakpoint
│   ├── radius-shadow-zindex.json  # radius/shadow (gerçek) + zindex (gözlemlenen)
│   └── token-css-map.md           # token → CSS değişkeni → component eşleme tablosu
├── components/                    # v6 modül spec'leri + paylaşılan primitif/state seti
│   ├── yanlis-defteri.md   hata-frekansi.md   zero-error-loop.md
│   ├── net-gain-map.md     smart-odev-modal.md  takvimim-card.md
│   ├── messaging-notifications.md   odev-plan-item.md
│   └── states-nav-modal-form-table.md
├── flows/                         # uçtan uca akışlar (01–08)
├── data-contracts/                # alanlar/enum/örnek payload/durum/yetki (JSON)
├── source-map/                    # prototip dosya/component → hedef rota/component
├── visual-qa/                     # acceptance-checklist + allowed-diff-threshold
└── exports/                       # gerçek ekran referansları (desktop light+dark)
    ├── student/{desktop-light,desktop-dark}/*.png
    ├── coach/{desktop-light,desktop-dark}/*.png
    └── parent/{desktop-light,desktop-dark}/*.png
```

## Doğruluk kaynağı hiyerarşisi (çakışmada bu sıra geçerli)
1. `tokens/*` (renk/typografi/efekt — kaynak `src/styles.css`)
2. `indir/uyanikkoc-web-source-v5/src/*` **prototip kodu** (davranış + birebir CSS sınıfları)
3. `components/*` + `flows/*` + `data-contracts/*` (bu paket spec'leri)
4. `exports/*` PNG (görsel hedef/QA — yakalama genişliği ~909px)

## Codex için hızlı başlangıç
1. `RISKS_AND_GAPS.md` → kritik düzeltmeler (özellikle `--muted` #6B6F85) ve kapsam.
2. `tokens/*` → `apps/web/styles/uk-design.css` `:root` + `[data-theme=dark]` birebir.
3. `source-map/*` → hangi prototip dosyası nereye.
4. Modül modül: `components/*` + ilgili `flows/*` + `data-contracts/*` ile uygula.
5. `visual-qa/*` → her rotayı 4 varyantta (mobil/modal için gerçek tarayıcıda) doğrula.

## v6 kapsamındaki modüller
Yanlış Defteri + Hata Frekansı + Sıfır Hata Döngüsü · Net Kaybı Haritası · Akıllı Ödev · Takvimim · Canlı mesajlaşma + bildirim · Koç geri bildirim notu · Koç'un öğrenci yanlışlarından ödev atması · Ödev/Deneme → Yanlış Defteri beslemesi · Veli içgörü kartları.

## Kapsam dışı
Admin paneli · Native mobil app · AI Koç tam ekranı ("Yakında") · Net Kaybı Haritası v2.
