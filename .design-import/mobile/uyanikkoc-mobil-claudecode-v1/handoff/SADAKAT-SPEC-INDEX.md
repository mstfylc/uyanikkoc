# SADAKAT SPEC — İNDEKS (Öğrenci Mobil)

Native (RN/Expo) ekran spec'leri. Token köprüsü `theme.ts`. Native desenler: 5 sekme alt tab bar,
safe-area, **modal→bottom-sheet**, pull-to-refresh, iOS+Android. Tüm metinler tam Türkçe.

> **MEVCUT** (v3 prototip; spec + PNG var) vs **v6-YENİ** (build-spec; prototipte yok → `V6-HIZALAMA-PLANI.md`
> + web v6 spec'i `uyanikkoc-web-claudecode-v6`).

## MEVCUT ekranlar (spec + `exports/mobil/ios-light/*.png`)
| Ekran | Spec | Kaynak (prototip) |
|---|---|---|
| Login / Üye ol | `SADAKAT-SPEC-mobil-login.md` | uk-screens.jsx · LoginScreen |
| Ana Sayfa | `SADAKAT-SPEC-mobil-home.md` | uk-screens.jsx · HomeScreen |
| Ödevler | `SADAKAT-SPEC-mobil-odevler.md` | uk-screens.jsx · OdevlerScreen + ResultSheet |
| Denemeler | `SADAKAT-SPEC-mobil-denemeler.md` | uk-screens2.jsx · DenemelerScreen |
| Program | `SADAKAT-SPEC-mobil-program.md` | uk-screens2.jsx · ProgramScreen |
| Profil | `SADAKAT-SPEC-mobil-profil.md` | uk-screens2.jsx · ProfilScreen |
| Alt ekranlar (Konu/Kaynaklarım/Randevular/Mesajlar/Motivasyon/Destek) | `SADAKAT-SPEC-mobil-alt-ekranlar.md` | uk-screens3.jsx · uk-v4.jsx |

## v6-YENİ ekranlar (build-spec → `V6-HIZALAMA-PLANI.md` + web v6 spec)
| Ekran | Web v6 spec referansı |
|---|---|
| Takvimim (Ana Sayfa içi) | `student-agenda` (web) |
| Çalışma Serisi (Ana Sayfa) | `SADAKAT-SPEC-ogrenci-dashboard.md` (StreakCard) |
| Yanlış Defteri (+Odak Tekrar+Hata Frekansı) | `SADAKAT-SPEC-ogrenci-mistakes.md` |
| Net Kaybı Haritası (Denemeler) | web `net-gain-map` |
| Denemeler Analiz / Online | `SADAKAT-SPEC-ogrenci-exams.md` |
| Konu Takibi ısı haritası | `SADAKAT-SPEC-ogrenci-topics.md` |
| Testler | `SADAKAT-SPEC-ogrenci-tests.md` |
| Bildirimler | `SADAKAT-SPEC-ortak-notifications.md` |
| Abonelik | `SADAKAT-SPEC-ortak-billing.md` |
| Ayarlar (ayrı) | `SADAKAT-SPEC-ortak-settings.md` |
| AI Koç (Yakında) | `SADAKAT-SPEC-ogrenci-ai-coach.md` |

> Native uyarlama kuralları (modal→sheet, tablo→liste, g-4→2×2, .seg→segment): `V6-HIZALAMA-PLANI.md`.
