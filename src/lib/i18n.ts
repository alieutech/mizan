export type Lang = 'en' | 'ar'

export interface Translations {
  surahs: string
  search: string
  saved: string
  signIn: string
  signOut: string
  heroTitle: string
  heroSub: string
  placeholder: string
  findVerses: string
  finding: string
  searching: string
  versesFor: string
  searchAgain: string
  toSave: string
  toListen: string
  yourCollection: string
  verses: string
  emptyTitle: string
  emptySub: string
  browseQuran: string
  allSurahsSub: string
  allSurahs: string
  surah: string
  searchQuran: string
  searchSub: string
  searchPlaceholder: string
  noResults: string
  results: string
  votd: string
  tafsir: string
  ibnKathir: string
  play: string
  pause: string
  copy: string
  copied: string
  onboardingTitle: string
  onboardingSub: string
  tryOne: string
  getStarted: string
  onboardingPrompts: string[]
  privacy: string
  terms: string
  hackathon: string
}

const en: Translations = {
  surahs: 'Surahs',
  search: 'Search',
  saved: 'Saved',
  signIn: 'Sign in',
  signOut: 'Sign out',
  heroTitle: "The Quran has a verse\nfor what you're carrying.",
  heroSub: 'Describe your moment — Mizan finds the words written for you.',
  placeholder: "Share what you're carrying — a struggle, a question, a feeling, a moment of gratitude…",
  findVerses: 'Find My Verses',
  finding: 'Finding verses…',
  searching: 'Searching the Quran…',
  versesFor: 'verses for',
  searchAgain: 'Search again',
  toSave: 'to save',
  toListen: 'to listen',
  yourCollection: 'Your Collection',
  verses: 'verses',
  emptyTitle: 'Your collection is empty.',
  emptySub: "Save verses that speak to you — they'll live here.",
  browseQuran: 'Browse the Quran',
  allSurahsSub: 'All 114 Surahs — tap to read',
  allSurahs: 'All Surahs',
  surah: 'Surah',
  searchQuran: 'Search the Quran',
  searchSub: 'Search by keyword across all verses',
  searchPlaceholder: 'e.g. patience, mercy, light…',
  noResults: 'No results found for',
  results: 'results',
  votd: 'Verse of the Day',
  tafsir: 'Tafsir',
  ibnKathir: 'Ibn Kathir',
  play: 'Play',
  pause: 'Pause',
  copy: 'Copy',
  copied: 'Copied!',
  onboardingTitle: 'Welcome to Mizan',
  onboardingSub: "Describe what you're carrying — a struggle, a question, a feeling — and Mizan finds the Quran verse written for your moment.",
  tryOne: 'Try one of these',
  getStarted: 'Get Started',
  onboardingPrompts: [
    "I'm feeling overwhelmed and don't know where to turn",
    "I'm struggling to forgive someone who hurt me",
    "I'm scared about the future and what lies ahead",
    "I'm grateful for a blessing and want to reflect",
  ],
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  hackathon: 'Built for the Quran Foundation Hackathon',
}

const ar: Translations = {
  surahs: 'السور',
  search: 'بحث',
  saved: 'المحفوظات',
  signIn: 'دخول',
  signOut: 'خروج',
  heroTitle: 'في القرآن آية\nلما تحمله في قلبك.',
  heroSub: 'صِف لحظتك — ميزان يجد الكلمات المكتوبة لك.',
  placeholder: 'شارك ما يثقل عليك — صراع، سؤال، شعور، أو لحظة امتنان…',
  findVerses: 'ابحث عن آياتي',
  finding: '…جارٍ البحث',
  searching: '…جارٍ البحث في القرآن',
  versesFor: 'آيات عن',
  searchAgain: 'بحث جديد',
  toSave: 'للحفظ',
  toListen: 'للاستماع',
  yourCollection: 'مجموعتك',
  verses: 'آيات',
  emptyTitle: 'مجموعتك فارغة.',
  emptySub: 'احفظ الآيات التي تلمس قلبك — ستظل هنا.',
  browseQuran: 'تصفح القرآن',
  allSurahsSub: 'جميع السور الـ١١٤ — اضغط للقراءة',
  allSurahs: 'جميع السور',
  surah: 'سورة',
  searchQuran: 'ابحث في القرآن',
  searchSub: 'بحث بالكلمات الرئيسية في جميع الآيات',
  searchPlaceholder: '…مثال: صبر، رحمة، نور',
  noResults: 'لا توجد نتائج لـ',
  results: 'نتائج',
  votd: 'آية اليوم',
  tafsir: 'تفسير',
  ibnKathir: 'ابن كثير',
  play: 'تشغيل',
  pause: 'إيقاف',
  copy: 'نسخ',
  copied: '!تم',
  onboardingTitle: 'أهلاً بك في ميزان',
  onboardingSub: 'صِف ما تحمله — صراعاً، سؤالاً، شعوراً — وميزان يجد الآية القرآنية المكتوبة للحظتك.',
  tryOne: 'جرّب أحد هذه',
  getStarted: 'ابدأ',
  onboardingPrompts: [
    'أشعر بالإرهاق ولا أعرف إلى أين أتجه',
    'أعاني في العفو عن شخص آذاني',
    'أخاف من المستقبل وما يخبئه',
    'أنا ممتنّ لنعمة وأريد التأمل',
  ],
  privacy: 'سياسة الخصوصية',
  terms: 'شروط الخدمة',
  hackathon: 'مبني لهاكاثون مؤسسة القرآن',
}

export const translations: Record<Lang, Translations> = { en, ar }
