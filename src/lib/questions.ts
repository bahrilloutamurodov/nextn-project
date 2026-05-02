import { Level, Question, Subject } from './types';

export const INITIAL_LEVELS: Level[] = [
  {
    id: 1,
    title: "1-Bosqich: Natural sonlar",
    description: "Natural sonlar va ularning yozilishi",
    unlocked: true,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l1q1', subject: 'Matematika', text: "Narsalarni sanashda ishlatiladigan sonlar nima deyiladi?", options: ["Ratsional sonlar", "Natural sonlar", "Manfiy sonlar"], correctAnswer: "Natural sonlar" },
      { id: 'l1q2', subject: 'Matematika', text: "Eng kichik natural sonni ko'rsating.", options: ["0", "1", "10"], correctAnswer: "1" },
      { id: 'l1q3', subject: 'Matematika', text: "100 soni natural sonmi?", options: ["Ha", "Yo'q", "Faqat ba'zi hollarda"], correctAnswer: "Ha" },
      { id: 'l1q4', subject: 'Matematika', text: "448 900 sonida nechta yuz minglik bor?", options: ["4 ta", "8 ta", "9 ta"], correctAnswer: "4 ta" },
      { id: 'l1q5', subject: 'Matematika', text: "999 sonidan keyin keluvchi natural sonni toping.", options: ["998", "1000", "1001"], correctAnswer: "1000" },
      { id: 'l1q6', subject: 'Matematika', text: "\"Ikki milliard besh yuz uch ming oltmish bir\" sonini raqamlar bilan yozing.", options: ["2 000 503 061", "2 500 003 061", "2 000 500 361"], correctAnswer: "2 500 003 061" },
      { id: 'l1q7', subject: 'Matematika', text: "Kesma uzunligini o'lchash uchun qaysi asbobdan foydalaniladi?", options: ["Sirkul", "Chizg'ich", "Transportir"], correctAnswer: "Chizg'ich" },
      { id: 'l1q8', subject: 'Matematika', text: "1 detsimetr necha santimetrga teng?", options: ["10 cm", "100 cm", "1000 cm"], correctAnswer: "10 cm" },
      { id: 'l1q9', subject: 'Matematika', text: "Uchburchak tomonlari uzunliklari yig'indisi nima deyiladi?", options: ["Yuzi", "Perimetri", "Balandligi"], correctAnswer: "Perimetri" },
      { id: 'l1q10', subject: 'Matematika', text: "24 sonini o'nlar xonasigacha yaxlitlang.", options: ["30", "20", "25"], correctAnswer: "20" }
    ]
  },
  {
    id: 2,
    title: "2-Bosqich: Qo'shish va Ayirish",
    description: "Amallar tartibi va o'lchov birliklari",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l2q1', subject: 'Matematika', text: "Qo'shishning o'rin almashtirish qonuni qaysi ifodada to'g'ri ko'rsatilgan?", options: ["a + b = b + a", "a + b = c", "a - b = b - a"], correctAnswer: "a + b = b + a" },
      { id: 'l2q2', subject: 'Matematika', text: "72 - 48 ayirmasini toping.", options: ["34", "24", "26"], correctAnswer: "24" },
      { id: 'l2q3', subject: 'Matematika', text: "Noma'lum qo'shiluvchini topish uchun nima qilish kerak?", options: ["Yig'indidan ma'lum qo'shiluvchini ayirish kerak", "Qo'shiluvchilarni ko'paytirish kerak", "Ayirish kerak"], correctAnswer: "Yig'indidan ma'lum qo'shiluvchini ayirish kerak" },
      { id: 'l2q4', subject: 'Matematika', text: "x + 23 = 57 tenglamani yeching.", options: ["80", "34", "30"], correctAnswer: "34" },
      { id: 'l2q5', subject: 'Matematika', text: "1 km necha metrga teng?", options: ["100 m", "1000 m", "10 000 m"], correctAnswer: "1000 m" },
      { id: 'l2q6', subject: 'Matematika', text: "Natural sonlar qatori qanday tartibda tuziladi?", options: ["Kamayish", "Ketma-ket o'sish", "Tasodifiy"], correctAnswer: "Ketma-ket o'sish" },
      { id: 'l2q7', subject: 'Matematika', text: "1584 - 239 ayirmani hisoblang.", options: ["1345", "1245", "1355"], correctAnswer: "1345" },
      { id: 'l2q8', subject: 'Matematika', text: "7 t 200 kg necha kilogramm bo'ladi?", options: ["720 kg", "7200 kg", "7002 kg"], correctAnswer: "7200 kg" },
      { id: 'l2q9', subject: 'Matematika', text: "Har qanday ikki nuqtadan nechta to'g'ri chiziq o'tkazish mumkin?", options: ["Ikkita", "Bitta", "Cheksiz ko'p"], correctAnswer: "Bitta" },
      { id: 'l2q10', subject: 'Matematika', text: "Kesishmaydigan to'g'ri chiziqlar nima deyiladi?", options: ["Perpendikulyar", "Parallel", "Siniq chiziq"], correctAnswer: "Parallel" }
    ]
  },
  {
    id: 3,
    title: "3-Bosqich: Ko'paytirish sirlari",
    description: "Ko'paytirish xossalari va jadvali",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l3q1', subject: 'Matematika', text: "Ko'paytirishning o'rin almashtirish xossasi qaysi?", options: ["a · b = b · a", "a + b = b + a", "a : b = b : a"], correctAnswer: "a · b = b · a" },
      { id: 'l3q2', subject: 'Matematika', text: "8 · 4 ko'paytmani hisoblang.", options: ["12", "32", "28"], correctAnswer: "32" },
      { id: 'l3q3', subject: 'Matematika', text: "Har qanday sonni 0 ga ko'paytirsak nima hosil bo'ladi?", options: ["O'sha sonning o'zi", "0", "1"], correctAnswer: "0" },
      { id: 'l3q4', subject: 'Matematika', text: "30 ta olmani 6 tadan taqsimlasak, nechta likopcha kerak?", options: ["5 ta", "6 ta", "4 ta"], correctAnswer: "5 ta" },
      { id: 'l3q5', subject: 'Matematika', text: "Bo'linuvchi 30, bo'luvchi 6 bo'lsa, bo'linmani toping.", options: ["36", "5", "24"], correctAnswer: "5" },
      { id: 'l3q6', subject: 'Matematika', text: "14 : 3 qoldiqli bo'lishda qoldiq necha bo'ladi?", options: ["4", "2", "1"], correctAnswer: "2" },
      { id: 'l3q7', subject: 'Matematika', text: "Qoldiq har doim bo'luvchidan qanday bo'lishi kerak?", options: ["Katta", "Kichik", "Teng"], correctAnswer: "Kichik" },
      { id: 'l3q8', subject: 'Matematika', text: "(3 + 5) · 4 ifodani taqsimot qonuni bo'yicha yozing.", options: ["3 · 4 + 5 · 4", "3 · 5 + 4", "3 + 5 · 4"], correctAnswer: "3 · 4 + 5 · 4" },
      { id: 'l3q9', subject: 'Matematika', text: "5x + 2x ifodani soddalashtiring.", options: ["10x", "7x", "3x"], correctAnswer: "7x" },
      { id: 'l3q10', subject: 'Matematika', text: "1 kg konfet 5800 so'm bo'lsa, 2 kg konfet qancha turadi?", options: ["11 600 so'm", "10 800 so'm", "12 000 so'm"], correctAnswer: "11 600 so'm" }
    ]
  },
  {
    id: 4,
    title: "4-Bosqich: Bo'lish va Tenglamalar",
    description: "Matematik mantiq va hisob-kitob",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l4q1', subject: 'Matematika', text: "Har qanday sonni 1 ga bo'lganda nima hosil bo'ladi?", options: ["1", "O'sha sonning o'zi", "0"], correctAnswer: "O'sha sonning o'zi" },
      { id: 'l4q2', subject: 'Matematika', text: "8x + 3x = 22 tenglamani yeching.", options: ["2", "11", "4"], correctAnswer: "2" },
      { id: 'l4q3', subject: 'Matematika', text: "Uchburchakning tomonlari 12, 32 va 28 bo'lsa, P=?", options: ["62", "72", "82"], correctAnswer: "72" },
      { id: 'l4q4', subject: 'Matematika', text: "25 · 4 · 7 ifodani qulay usulda hisoblang.", options: ["700", "175", "800"], correctAnswer: "700" },
      { id: 'l4q5', subject: 'Matematika', text: "Noma'lum ko'paytuvchini topish uchun nima qilinadi?", options: ["Ko'paytmani bo'lish kerak", "Qo'shish kerak", "Ayirish kerak"], correctAnswer: "Ko'paytmani bo'lish kerak" },
      { id: 'l4q6', subject: 'Matematika', text: "7 · x = 84 bo'lsa, x ni toping.", options: ["12", "14", "10"], correctAnswer: "12" },
      { id: 'l4q7', subject: 'Matematika', text: "0 : 5 bo'linma nechaga teng?", options: ["5", "1", "0"], correctAnswer: "0" },
      { id: 'l4q8', subject: 'Matematika', text: "Daryo oqimi 2 km/h, qayiq 15 km/h bo'lsa, oqim bo'ylab tezlik?", options: ["13 km/h", "17 km/h", "30 km/h"], correctAnswer: "17 km/h" },
      { id: 'l4q9', subject: 'Matematika', text: "1 q (sentner) necha kg?", options: ["10 kg", "100 kg", "1000 kg"], correctAnswer: "100 kg" },
      { id: 'l4q10', subject: 'Tarix', text: "\"Algoritm\" so'zi kimning nomi bilan bog'liq?", options: ["Beruniy", "Al-Xorazmiy", "Ibn Sino"], correctAnswer: "Al-Xorazmiy" }
    ]
  },
  {
    id: 5,
    title: "5-Bosqich: Yuzlar va Kasrlar",
    description: "Geometriya va ulushlar olami",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l5q1', subject: 'Matematika', text: "Tomoni 1 cm bo'lgan kvadratning yuzi qancha?", options: ["1 cm", "1 cm²", "4 cm"], correctAnswer: "1 cm²" },
      { id: 'l5q2', subject: 'Matematika', text: "To'g'ri to'rtburchakning yuzi qaysi formula bilan topiladi?", options: ["S = a + b", "S = a · b", "S = 2(a+b)"], correctAnswer: "S = a · b" },
      { id: 'l5q3', subject: 'Matematika', text: "1 gektar (ha) necha kvadrat metr?", options: ["100 m²", "10 000 m²", "1000 m²"], correctAnswer: "10 000 m²" },
      { id: 'l5q4', subject: 'Matematika', text: "1 ar (sotix) necha kvadrat metr?", options: ["10 m²", "100 m²", "1000 m²"], correctAnswer: "100 m²" },
      { id: 'l5q5', subject: 'Matematika', text: "Shaklning yuzi uni tashkil qilgan qismlari yuzining nimaga teng?", options: ["Ayirmasiga", "Ko'paytmasiga", "Yig'indisiga"], correctAnswer: "Yig'indisiga" },
      { id: 'l5q6', subject: 'Matematika', text: "Narsaning teng bo'laklari nima deyiladi?", options: ["Butun", "Ulush", "Foiz"], correctAnswer: "Ulush" },
      { id: 'l5q7', subject: 'Matematika', text: "Doiraning yarmi qanday ulush bilan ifodalanadi?", options: ["1/4", "1/2", "1/3"], correctAnswer: "1/2" },
      { id: 'l5q8', subject: 'Matematika', text: "a/b kasrda 'a' nima deyiladi?", options: ["Maxraj", "Surat", "Kasr chizig'i"], correctAnswer: "Surat" },
      { id: 'l5q9', subject: 'Matematika', text: "Kasrning maxraji nimani bildiradi?", options: ["Nechta ulush olinganini", "Butun nechta teng bo'lakka bo'linganini", "Sonning qiymatini"], correctAnswer: "Butun nechta teng bo'lakka bo'linganini" },
      { id: 'l5q10', subject: 'Matematika', text: "3/5 va 2/5 kasrlarni taqqoslang.", options: ["3/5 < 2/5", "3/5 > 2/5", "3/5 = 2/5"], correctAnswer: "3/5 > 2/5" }
    ]
  },
  {
    id: 6,
    title: "6-Bosqich: Amallar va Kasrlar",
    description: "Kasrlar ustida amallar",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l6q1', subject: 'Matematika', text: "Surati maxrajidan kichik kasr nima deyiladi?", options: ["Noto'g'ri kasr", "To'g'ri kasr", "Aralash son"], correctAnswer: "To'g'ri kasr" },
      { id: 'l6q2', subject: 'Matematika', text: "7/7 kasr nimaga teng?", options: ["0", "1", "7"], correctAnswer: "1" },
      { id: 'l6q3', subject: 'Matematika', text: "13/5 noto'g'ri kasrni aralash songa aylantiring.", options: ["2 butun 3/5", "3 butun 1/5", "2 butun 1/5"], correctAnswer: "2 butun 3/5" },
      { id: 'l6q4', subject: 'Matematika', text: "2 butun 3/5 sonini noto'g'ri kasrga aylantiring.", options: ["10/5", "13/5", "6/5"], correctAnswer: "13/5" },
      { id: 'l6q5', subject: 'Matematika', text: "1/6 + 2/6 yig'indini toping.", options: ["3/6", "3/12", "1/6"], correctAnswer: "3/6" },
      { id: 'l6q6', subject: 'Matematika', text: "4/6 - 1/6 ayirmani toping.", options: ["5/6", "3/6", "3/0"], correctAnswer: "3/6" },
      { id: 'l6q7', subject: 'Matematika', text: "2 butun 2/5 + 1 butun 1/5 yig'indini toping.", options: ["3 butun 3/10", "3 butun 3/5", "4 butun 3/5"], correctAnswer: "3 butun 3/5" },
      { id: 'l6q8', subject: 'Matematika', text: "Doira markazidan uning chegarasigacha bo'lgan masofa nima deyiladi?", options: ["Diametr", "Radius", "Vatar"], correctAnswer: "Radius" },
      { id: 'l6q9', subject: 'Matematika', text: "Doira diametri radiusidan necha marta uzun?", options: ["3 marta", "2 marta", "4 marta"], correctAnswer: "2 marta" },
      { id: 'l6q10', subject: 'Matematika', text: "1/4 ulush yana qanday ataladi?", options: ["Yarim", "Chorak", "Nimchorak"], correctAnswer: "Chorak" }
    ]
  },
  {
    id: 7,
    title: "7-Bosqich: Ona tili asosi",
    description: "Til, tovush va bo'g'in",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l7q1', subject: 'Ona tili', text: "\"Til - millatning ko'zgusi\" fikri kimga tegishli?", options: ["Erkin Vohidov", "To'ra Sulaymon", "Muhammad Yusuf"], correctAnswer: "To'ra Sulaymon" },
      { id: 'l7q2', subject: 'Ona tili', text: "O'zbek tiliga Davlat tili maqomi qachon berilgan?", options: ["1991-yil 31-avgust", "1989-yil 21-oktabr", "1992-yil 8-dekabr"], correctAnswer: "1989-yil 21-oktabr" },
      { id: 'l7q3', subject: 'Ona tili', text: "Tilshunoslikning tovushlarni o'rganadigan bo'limi nima?", options: ["Grafika", "Fonetika", "Leksikologiya"], correctAnswer: "Fonetika" },
      { id: 'l7q4', subject: 'Ona tili', text: "O'zbek tilida nechta unli tovush bor?", options: ["5 ta", "6 ta", "10 ta"], correctAnswer: "6 ta" },
      { id: 'l7q5', subject: 'Ona tili', text: "Lab undoshlari qatorini toping.", options: ["b, p, m, v, f", "t, d, s, z", "k, g, q"], correctAnswer: "b, p, m, v, f" },
      { id: 'l7q6', subject: 'Ona tili', text: "\"Harakatda barakat\" iborasida nechta so'z bor?", options: ["1 ta", "2 ta", "3 ta"], correctAnswer: "2 ta" },
      { id: 'l7q7', subject: 'Ona tili', text: "So'zda nechta unli bo'lsa, shuncha ... bo'ladi.", options: ["Harf", "Tovush", "Bo'g'in"], correctAnswer: "Bo'g'in" },
      { id: 'l7q8', subject: 'Ona tili', text: "Unli bilan tugaydigan bo'g'in nima deyiladi?", options: ["Yopiq bo'g'in", "Ochiq bo'g'in", "Bo'g'iz bo'g'ini"], correctAnswer: "Ochiq bo'g'in" },
      { id: 'l7q9', subject: 'Ona tili', text: "Lotin yozuviga asoslangan o'zbek alifbosida nechta harf bor?", options: ["26 ta", "29 ta", "30 ta"], correctAnswer: "29 ta" },
      { id: 'l7q10', subject: 'Ona tili', text: "O'zbek tilida so'z urg'usi, odatda, qaysi bo'g'inga tushadi?", options: ["Birinchi", "Oxirgi", "O'rta"], correctAnswer: "Oxirgi" }
    ]
  },
  {
    id: 8,
    title: "8-Bosqich: Imlo va Talaffuz",
    description: "So'z boyligi va to'g'ri yozish",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l8q1', subject: 'Ona tili', text: "\"Shashmaqom\" so'zida nechta bo'g'in bor?", options: ["2 ta", "3 ta", "4 ta"], correctAnswer: "3 ta" },
      { id: 'l8q2', subject: 'Ona tili', text: "Qaysi so'zda tovush tushishi hodisasi bor?", options: ["Shahrim", "Kitobim", "Maktabim"], correctAnswer: "Shahrim" },
      { id: 'l8q3', subject: 'Ona tili', text: "\"Bunga\" so'zida qaysi tovush ortgan?", options: ["u", "n", "g"], correctAnswer: "n" },
      { id: 'l8q4', subject: 'Ona tili', text: "\"Tovuq\" so'ziga egalik qo'shimchasi qo'shilsa (tovug'i), qaysi tovush almashadi?", options: ["v-u", "q-g'", "t-d"], correctAnswer: "q-g'" },
      { id: 'l8q5', subject: 'Ona tili', text: "\"Allo\", \"labbay\", \"rahmat\" so'zlari qaysi odobga xos?", options: ["Ovqatlanish", "Telefonda so'zlashish", "Kiyinish"], correctAnswer: "Telefonda so'zlashish" },
      { id: 'l8q6', subject: 'Ona tili', text: "Nutq tovushlarini hosil qilishda qatnashadigan a'zolar nima deyiladi?", options: ["Tana a'zolari", "Nutq a'zolari", "Sezgi a'zolari"], correctAnswer: "Nutq a'zolari" },
      { id: 'l8q7', subject: 'Ona tili', text: "Jarangli undoshni toping.", options: ["p", "b", "k"], correctAnswer: "b" },
      { id: 'l8q8', subject: 'Ona tili', text: "\"Aql\" so'zida nechta undosh bor?", options: ["1 ta", "2 ta", "3 ta"], correctAnswer: "2 ta" },
      { id: 'l8q9', subject: 'Ona tili', text: "Qaysi harf birikmasi bitta tovushni ifodalaydi?", options: ["sh", "st", "bl"], correctAnswer: "sh" },
      { id: 'l8q10', subject: 'Ona tili', text: "\"O'qituvchi\" so'zi qaysi so'roqqa javob bo'ladi?", options: ["Nima?", "Kim?", "Qanday?"], correctAnswer: "Kim?" }
    ]
  },
  {
    id: 9,
    title: "9-Bosqich: Mantiq va Bilim",
    description: "Aralash savollar va mantiq",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l9q1', subject: 'Mantiq', text: "Sutkaning qancha qismi o'tganini hisoblashda nimadan foydalanamiz?", options: ["Metr", "Soat", "Kilogramm"], correctAnswer: "Soat" },
      { id: 'l9q2', subject: 'Ona tili', text: "\"Tili yo'qda dil yo'q\" she'ri muallifi kim?", options: ["Muhammad Yusuf", "Oybek", "Abdulla Oripov"], correctAnswer: "Abdulla Oripov" },
      { id: 'l9q3', subject: 'Matematika', text: "Aylana markazidan o'tuvchi va ikki nuqtani tutashtiruvchi kesma nima?", options: ["Radius", "Diametr", "Yoy"], correctAnswer: "Diametr" },
      { id: 'l9q4', subject: 'Ona tili', text: "O'zbek alifbosidagi 'ng' tovushi qanday tovush?", options: ["Lab undoshi", "Til orqa undoshi", "Unli"], correctAnswer: "Til orqa undoshi" },
      { id: 'l9q5', subject: 'Mantiq', text: "\"Kitob o'qish asabni tinchlantiradi\" fikri to'g'rimi?", options: ["Ha", "Yo'q", "Isbotlanmagan"], correctAnswer: "Ha" },
      { id: 'l10q6', subject: 'Tarix', text: "\"Najmiddin Kubro\" qaysi shahar mudofaasida jasorat ko'rsatgan?", options: ["Buxoro", "Urganch", "Samarqand"], correctAnswer: "Urganch" },
      { id: 'l10q7', subject: 'Matematika', text: "1 m² necha dm²?", options: ["10", "100", "1000"], correctAnswer: "100" },
      { id: 'l10q8', subject: 'Matematika', text: "Aralash sonni noto'g'ri kasrga aylantirishda butun qism nimaga ko'paytiriladi?", options: ["Suratga", "Maxrajga", "Kasr chizig'iga"], correctAnswer: "Maxrajga" },
      { id: 'l10q9', subject: 'Matematika', text: "Sirkul nima uchun kerak?", options: ["Kesma chizishga", "Aylana chizishga", "Burchak o'lchashga"], correctAnswer: "Aylana chizishga" },
      { id: 'l10q10', subject: 'Tarix', text: "\"Odamiylik alomati to'rt sifatdir\" kimning kitobida yozilgan?", options: ["Ibn Sino", "Azizuddin Nasafiy", "Alisher Navoiy"], correctAnswer: "Azizuddin Nasafiy" }
    ]
  },
  {
    id: 10,
    title: "10-Bosqich: Yakuniy Sinov",
    description: "Barcha bilimlarni tekshirish",
    unlocked: false,
    completed: false,
    highScore: 0,
    questions: [
      { id: 'l10q1', subject: 'Matematika', text: "320 betlik kitobning 1/8 qismi necha bet?", options: ["40", "80", "30"], correctAnswer: "40" },
      { id: 'l10q2', subject: 'Matematika', text: "Eng katta ikki xonali natural sonni toping.", options: ["10", "99", "100"], correctAnswer: "99" },
      { id: 'l10q3', subject: 'Ona tili', text: "\"Vatanni sevmoq iymondandir\" matnida qaysi unli ko'p qo'llangan?", options: ["a", "i", "o"], correctAnswer: "a" },
      { id: 'l10q4', subject: 'Matematika', text: "100/100 kasr nimaga teng?", options: ["100", "1", "0"], correctAnswer: "1" },
      { id: 'l10q5', subject: 'Ona tili', text: "\"Buxoro\" so'zida nechta jarangli undosh bor?", options: ["2 ta", "3 ta", "1 ta"], correctAnswer: "2 ta" },
      { id: 'l10q6', subject: 'Matematika', text: "Kasr chizig'i qaysi amalni bildiradi?", options: ["Ko'paytirish", "Bo'lish", "Qo'shish"], correctAnswer: "Bo'lish" },
      { id: 'l10q7', subject: 'Mantiq', text: "\"Orol dengizi\" muammosi qaysi fanga tegishli?", options: ["Geometriya", "Ekologiya", "Fonetika"], correctAnswer: "Ekologiya" },
      { id: 'l10q8', subject: 'Matematika', text: "Aralash sonning qismlari qaysilar?", options: ["Surat va maxraj", "Butun va kasr qism", "To'g'ri va noto'g'ri"], correctAnswer: "Butun va kasr qism" },
      { id: 'l10q9', subject: 'Ona tili', text: "\"Zamon\" so'zida 'a' tovushi qanday talaffuz qilinadi?", options: ["o kabi", "i kabi", "u kabi"], correctAnswer: "o kabi" },
      { id: 'l10q10', subject: 'Mantiq', text: "Matematika fanini o'rganish insonga nima beradi?", options: ["Faqat hisoblashni", "Mantiqiy fikrlashni", "Faqat rasm chizishni"], correctAnswer: "Mantiqiy fikrlashni" }
    ]
  }
];
