# Uyanık Koç — Web · UYUM GÖREVLERİ (görsel doğrulamalı) v1

Bu paket, öğrenci/koç/veli **web uygulamasındaki** 4 görsel-doğrulamalı uyum işini toplar.
Metin/spec uyumundan ayrıdır; davranış + yerleşim **yan yana karşılaştırma** gerektirir.

## İçerik
- **`UYUM-GOREVLERI.md`** — 4 görev, her biri **kabul kriterleri** + kaynak/spec/PNG referansıyla:
  1. schedule: Gün/Hafta segmenti + `.wk-cal` hafta ızgarası + zengin AddBlockModal
  2. assignments/c-assignments: sonuç → `MistakeBatchModal` ve `CoachNoteModal` köprüleri
  3. settings: şifre değiştirmenin **Hesap** sekmesinde olması
  4. c-online: tasarımda var, prod'da ayrı rota yok — ekle/kaldır **ürün kararı**
- **`exports/`** — referans ekran görüntüleri (schedule Gün/Hafta, Denemeler Online sekmesi, Ayarlar Hesap).

## Doğruluk kaynağı
Kanonik prototip + spec'ler: **`uyanikkoc-web-claudecode-v6`** paketi (`handoff/SADAKAT-SPEC-*.md`).
Bu paket onun yerini almaz; yalnızca bu 4 işi izole eder. Token/tasarım sistemi orada tanımlıdır.

## Nasıl kullanılır
1. `uyanikkoc-web-claudecode-v6/uyanik-koc-dashboard.html`'i tarayıcıda aç (demo: öğrenci
   `elif@uyanikkoc.com` · koç `dilek@uyanikkoc.com`).
2. `UYUM-GOREVLERI.md`'deki her görevin ekranına git, Codex çıktısıyla karşılaştır.
3. Kabul kriterlerini tek tek işaretle. Modal akışları (Görev 2) için tetikleyiciyi gerçek tarayıcıda aç.

> Not: Görev 2'nin modalleri (`MistakeBatchModal`/`CoachNoteModal`) portal olduğundan otomatik
> PNG'si yoktur — gerçek tarayıcıda tetikleyip doğrula (UYUM-GOREVLERI.md'de tetikleyiciler yazılı).
