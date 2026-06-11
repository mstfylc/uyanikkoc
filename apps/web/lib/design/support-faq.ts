export type SupportFaqCategory = "genel" | "odev" | "deneme" | "hesap" | "teknik";

export type SupportFaqItem = {
  question: string;
  answer: string;
  category: SupportFaqCategory;
};

export const SUPPORT_FAQ_CATEGORIES: Record<SupportFaqCategory, string> = {
  genel: "Genel",
  odev: "Ödev & Program",
  deneme: "Denemeler",
  hesap: "Hesap",
  teknik: "Teknik",
};

export const SUPPORT_FAQ: Record<"student" | "coach" | "parent", SupportFaqItem[]> = {
  coach: [
    {
      category: "deneme",
      question: "Deneme sonucu Excel'ini nasıl içe aktarırım?",
      answer:
        "Denemeler sayfasında sağ üstteki Deneme İçe Aktar butonuna basın. CSV formatında toplu sonuç yükleyebilir veya Excel dosyanızı CSV olarak kaydedip yükleyebilirsiniz.",
    },
    {
      category: "odev",
      question: "Öğrenciye nasıl ödev atarım?",
      answer:
        "Konu Takibi sayfasında öğrenciyi seçin, Ödev Ata ile ders ve konu seçin. Ödev & Görev sayfasından da yeni ödev oluşturabilirsiniz.",
    },
    {
      category: "genel",
      question: "Müfredattaki konuları değiştirebilir miyim?",
      answer:
        "Ayarlar > Müfredat & Konu Grupları sekmesinden ders, grup ve konuları düzenleyebilirsiniz.",
    },
    {
      category: "genel",
      question: "Randevu limitini nasıl ayarlarım?",
      answer:
        "Randevular > Müsait Saatlerim sekmesinde haftalık randevu limitini ve online/yüz yüze izinlerini belirleyebilirsiniz.",
    },
    {
      category: "deneme",
      question: "Deneme oluşturma ve kayıt takibi nasıl çalışır?",
      answer:
        "Denemeler sayfasında Deneme Oluştur ile tarih ve tür belirleyin. Kayıtlı öğrenci sayısı ve ödeme/paket durumu tabloda görünür.",
    },
  ],
  student: [
    {
      category: "odev",
      question: "Ödevimin sonucunu nasıl girerim?",
      answer:
        "Ödevlerim sayfasında ilgili ödevde Sonuç Gir butonuna basın, doğru/yanlış/boş sayılarını girin. Net otomatik hesaplanır.",
    },
    {
      category: "genel",
      question: "Koçumdan nasıl randevu alırım?",
      answer:
        "Randevular sayfasında Randevu İste butonuna basın, online veya yüz yüze seçin ve müsait bir saat seçin.",
    },
    {
      category: "odev",
      question: "Elimdeki kaynakları nasıl eklerim?",
      answer:
        "Ödevlerim sayfasının altındaki Kaynaklarım alanına sahip olduğunuz kitapları ekleyin.",
    },
    {
      category: "deneme",
      question: "Deneme analizimi nerede görürüm?",
      answer:
        "Denemeler sayfasında Analiz sekmesine geçin. Net dağılımı ve öncelikli konular orada listelenir.",
    },
    {
      category: "deneme",
      question: "Denemeye nasıl kayıt olurum?",
      answer:
        "Denemeler sayfasında Denemeye kayıt ol butonuna basın. Üyelik paketiniz kapsamında veya ödeme ile kayıt yapabilirsiniz.",
    },
  ],
  parent: [
    {
      category: "odev",
      question: "Çocuğumun ödev durumunu nasıl takip ederim?",
      answer:
        "Genel Bakış sayfasında haftalık ödev listesi ve tamamlama oranını görebilirsiniz.",
    },
    {
      category: "deneme",
      question: "Deneme sonuçlarını nerede görürüm?",
      answer:
        "Deneme Sonuçları sayfasında çocuğunuzun son deneme netlerini ve ders bazlı dağılımını inceleyebilirsiniz.",
    },
    {
      category: "genel",
      question: "Koç ile nasıl iletişime geçerim?",
      answer:
        "Mesajlar sayfasından koçunuzla yazışma başlatabilirsiniz.",
    },
    {
      category: "genel",
      question: "Randevu talebi nasıl oluşturulur?",
      answer:
        "Randevular sayfasından onaylı görüşmeleri görebilirsiniz. Yeni talep için öğrenci hesabı üzerinden randevu istenebilir.",
    },
    {
      category: "hesap",
      question: "Deneme üyeliğini veli olarak yönetebilir miyim?",
      answer:
        "Ayarlar > Abonelik sekmesinden deneme üyelik paketini görüntüleyebilir ve güncelleyebilirsiniz.",
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
