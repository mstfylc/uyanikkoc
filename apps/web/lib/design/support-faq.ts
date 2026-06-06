export type SupportFaqCategory = "genel" | "odev" | "deneme" | "hesap" | "teknik";

export type SupportFaqItem = {
  question: string;
  answer: string;
  category: SupportFaqCategory;
};

export const SUPPORT_FAQ_CATEGORIES: Record<SupportFaqCategory, string> = {
  genel: "Genel",
  odev: "Odev & Program",
  deneme: "Denemeler",
  hesap: "Hesap",
  teknik: "Teknik",
};

export const SUPPORT_FAQ: Record<"student" | "coach" | "parent", SupportFaqItem[]> = {
  coach: [
    {
      category: "deneme",
      question: "Deneme sonucu Excel'ini nasil ice aktaririm?",
      answer:
        "Denemeler sayfasinda sag ustteki Deneme Ice Aktar butonuna basin. CSV formatinda toplu sonuc yukleyebilir veya Excel dosyanizi CSV olarak kaydedip yukleyebilirsiniz.",
    },
    {
      category: "odev",
      question: "Ogrenciye nasil odev atarim?",
      answer:
        "Konu Takibi sayfasinda ogrenciyi secin, Odev Ata ile ders ve konu secin. Odev & Gorev sayfasindan da yeni odev olusturabilirsiniz.",
    },
    {
      category: "genel",
      question: "Mufredattaki konulari degistirebilir miyim?",
      answer:
        "Ayarlar > Mufredat & Konu Gruplari sekmesinden ders, grup ve konulari duzenleyebilirsiniz.",
    },
    {
      category: "genel",
      question: "Randevu limitini nasil ayarlarim?",
      answer:
        "Randevular > Musait Saatlerim sekmesinde haftalik randevu limitini ve online/yuz yuze izinlerini belirleyebilirsiniz.",
    },
    {
      category: "deneme",
      question: "Deneme olusturma ve kayit takibi nasil calisir?",
      answer:
        "Denemeler sayfasinda Deneme Olustur ile tarih ve tur belirleyin. Kayitli ogrenci sayisi ve odeme/paket durumu tabloda gorunur.",
    },
  ],
  student: [
    {
      category: "odev",
      question: "Odevimin sonucunu nasil girerim?",
      answer:
        "Odevlerim sayfasinda ilgili odevde Sonuc Gir butonuna basin, dogru/yanlis/bos sayilarini girin. Net otomatik hesaplanir.",
    },
    {
      category: "genel",
      question: "Kocumdan nasil randevu alirim?",
      answer:
        "Randevular sayfasinda Randevu Iste butonuna basin, online veya yuz yuze secin ve musait bir saat secin.",
    },
    {
      category: "odev",
      question: "Elimdeki kaynaklari nasil eklerim?",
      answer:
        "Odevlerim sayfasinin altindaki Kaynaklarim alanina sahip oldugunuz kitaplari ekleyin.",
    },
    {
      category: "deneme",
      question: "Deneme analizimi nerede gorurum?",
      answer:
        "Denemeler sayfasinda Analiz sekmesine gecin. Net dagilimi ve oncelikli konular orada listelenir.",
    },
    {
      category: "deneme",
      question: "Denemeye nasil kayit olurum?",
      answer:
        "Denemeler sayfasinda Denemeye kayit ol butonuna basin. Uyelik paketiniz kapsaminda veya odeme ile kayit yapabilirsiniz.",
    },
  ],
  parent: [
    {
      category: "odev",
      question: "Cocugumun odev durumunu nasil takip ederim?",
      answer:
        "Genel Bakis sayfasinda haftalik odev listesi ve tamamlama oranini gorebilirsiniz.",
    },
    {
      category: "deneme",
      question: "Deneme sonuclarini nerede gorurum?",
      answer:
        "Deneme Sonuclari sayfasinda cocugunuzun son deneme netlerini ve ders bazli dagilimini inceleyebilirsiniz.",
    },
    {
      category: "genel",
      question: "Koc ile nasil iletisime gecerim?",
      answer:
        "Mesajlar sayfasindan kocunuzla yazisma baslatabilirsiniz.",
    },
    {
      category: "genel",
      question: "Randevu talebi nasil olusturulur?",
      answer:
        "Randevular sayfasindan onayli gorusmeleri gorebilirsiniz. Yeni talep icin ogrenci hesabi uzerinden randevu istenebilir.",
    },
    {
      category: "hesap",
      question: "Deneme uyeligini veli olarak yonetebilir miyim?",
      answer:
        "Ayarlar > Abonelik sekmesinden deneme uyelik paketini goruntuleyebilir ve guncelleyebilirsiniz.",
    },
  ],
};

export const SUPPORT_CATEGORIES = {
  teknik: "Teknik sorun",
  oneri: "Oneri",
  hesap: "Hesap",
  diger: "Diger",
} as const;

export type SupportCategory = keyof typeof SUPPORT_CATEGORIES;
