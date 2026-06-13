/* Data for coach sub-pages */

const COACH_ASSIGNMENTS = [
  { id: "ca1", title: "Türev — 40 soruluk karma test", subject: "Matematik", type: "practice", priority: "high", student: "Elif Yıldız", due: "Bugün", status: "completed" },
  { id: "ca2", title: "Newton yasaları — konu özeti", subject: "Fizik", type: "reading", priority: "medium", student: "Elif Yıldız", due: "Yarın", status: "pending" },
  { id: "ca3", title: "Paragraf hız çalışması", subject: "Türkçe", type: "practice", priority: "medium", student: "Burak Demir", due: "Bugün", status: "submitted" },
  { id: "ca4", title: "AYT Matematik branş denemesi", subject: "Matematik", type: "exam_prep", priority: "high", student: "Burak Demir", due: "2 gün", status: "pending" },
  { id: "ca5", title: "Mol kavramı tekrar", subject: "Kimya", type: "homework", priority: "high", student: "Zeynep Kaya", due: "Dün", status: "overdue" },
  { id: "ca6", title: "Hücre bölünmesi video + not", subject: "Biyoloji", type: "reading", priority: "low", student: "Zeynep Kaya", due: "3 gün", status: "pending" },
  { id: "ca7", title: "Temel matematik — 30 soru", subject: "Matematik", type: "practice", priority: "high", student: "Can Öztürk", due: "Dün", status: "overdue" },
  { id: "ca8", title: "Geometri üçgenler", subject: "Geometri", type: "homework", priority: "medium", student: "Defne Arslan", due: "Bugün", status: "submitted" },
  { id: "ca9", title: "TYT deneme analizi", subject: "Genel", type: "exam_prep", priority: "medium", student: "Kerem Şahin", due: "Yarın", status: "completed" },
];

const ASSIGN_STATUS = {
  completed: { label: "Tamamlandı", tone: "success", icon: "checkCircle" },
  submitted: { label: "Teslim · İncele", tone: "info", icon: "clipboard" },
  pending:   { label: "Bekliyor", tone: "warning", icon: "clock" },
  overdue:   { label: "Gecikmiş", tone: "danger", icon: "alert" },
};

const STUDENT_OPTIONS = ["Elif Yıldız", "Burak Demir", "Zeynep Kaya", "Can Öztürk", "Defne Arslan", "Kerem Şahin", "Ada Yılmaz"];

const MESSAGES = [
  { id: "m1", name: "Ayşe Yıldız", who: "Veli · Elif'in annesi", time: "5 dk", unread: 0, online: true,
    thread: [
      { me: false, t: "Merhaba hocam, Elif'in bu haftaki gidişatı nasıl?", time: "09:12" },
      { me: true, t: "Merhaba, Elif bu hafta çok iyi — tamamlama %88, son denemede +12 net. Türevde biraz desteklenmesi gerekiyor.", time: "09:20" },
      { me: false, t: "Çok teşekkür ederim, evde de takip ederiz.", time: "09:24" },
    ] },
  { id: "m2", name: "Burak Demir", who: "Öğrenci · 12. Sınıf", time: "1 sa", unread: 2, online: true,
    thread: [
      { me: false, t: "Hocam AYT matematik denemesini yükledim, 34 net oldu.", time: "11:02" },
      { me: false, t: "Limit konusunda hâlâ zorlanıyorum.", time: "11:03" },
    ] },
  { id: "m3", name: "Hasan Öztürk", who: "Veli · Can'ın babası", time: "3 sa", unread: 1, online: false,
    thread: [
      { me: false, t: "Hocam Can son günlerde ödevlerini yapmıyor, endişeliyiz.", time: "08:40" },
    ] },
  { id: "m4", name: "Zeynep Kaya", who: "Öğrenci · 11. Sınıf", time: "Dün", unread: 0, online: false,
    thread: [
      { me: true, t: "Zeynep, kimya netlerin düşüyor. Yarın 15:00'te görüşelim mi?", time: "16:10" },
      { me: false, t: "Olur hocam, hazır olacağım.", time: "16:30" },
    ] },
  { id: "m5", name: "Defne Arslan", who: "Öğrenci · 10. Sınıf", time: "2 gün", unread: 0, online: false,
    thread: [
      { me: false, t: "Hocam çalışma programımı güncelledim, bakabilir misiniz?", time: "14:00" },
      { me: true, t: "Harika Defne, çok dengeli olmuş. Cumartesi denemesini ekledim.", time: "14:15" },
    ] },
];

const PARENT_REPORTS = [
  { id: "r1", student: "Elif Yıldız", parent: "Ayşe Yıldız", week: "26 May – 1 Haz", completion: 88, net: "+12", status: "pending" },
  { id: "r2", student: "Burak Demir", parent: "Murat Demir", week: "26 May – 1 Haz", completion: 76, net: "+3", status: "pending" },
  { id: "r3", student: "Zeynep Kaya", parent: "Fatma Kaya", week: "26 May – 1 Haz", completion: 54, net: "-4", status: "pending" },
  { id: "r4", student: "Can Öztürk", parent: "Hasan Öztürk", week: "26 May – 1 Haz", completion: 31, net: "-6", status: "pending" },
  { id: "r5", student: "Defne Arslan", parent: "Selin Arslan", week: "19 – 25 May", completion: 82, net: "+8", status: "approved" },
  { id: "r6", student: "Kerem Şahin", parent: "Ali Şahin", week: "19 – 25 May", completion: 67, net: "+2", status: "approved" },
  { id: "r7", student: "Ada Yılmaz", parent: "Deniz Yılmaz", week: "19 – 25 May", completion: 49, net: "-1", status: "approved" },
];

const EXAM_LABELS = ["D1", "D2", "D3", "D4", "D5", "D6"];

Object.assign(window, { COACH_ASSIGNMENTS, ASSIGN_STATUS, STUDENT_OPTIONS, MESSAGES, PARENT_REPORTS, EXAM_LABELS });
