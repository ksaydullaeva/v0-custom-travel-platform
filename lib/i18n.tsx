"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the translations
const translations = {
  en: {
    // Navigation
    home: "Home",
    experiences: "Experiences",
    destinations: "Destinations",
    itineraries: "Itineraries",
    chat: "Chat",
    for_business: "For Business",
    search: "Search",
    search_placeholder: "Search experiences...",
    account: "Account",
    profile: "Profile",

    // Home page
    discover_travel: "Discover Unforgettable Travel Experiences",
    explore_curated: "Explore curated experiences from local experts around the world",
    search_destinations: "Search destinations or experiences...",
    when: "When?",
    explore_now: "Explore Now",
    browse_category: "Browse by Category",
    find_experiences: "Find experiences that match your interests",
    view_all_categories: "View All Categories",
    featured_experiences: "Featured Experiences",
    handpicked_activities: "Handpicked activities our travelers love",
    see_more_experiences: "See More Experiences",
    where_to_next: "Where to next?",
    why_choose_us: "Why Choose Us",
    we_curate: "We curate the best experiences from trusted local experts around the world",
    curated_experiences: "Curated Experiences",
    curated_description: "Hand-picked experiences vetted for quality and authenticity by our travel experts.",
    local_experts: "Local Experts",
    local_experts_description: "Connect with knowledgeable local guides who share authentic insights and stories.",
    flexible_booking: "Flexible Booking",
    flexible_booking_description: "Free cancellation options and last-minute availability for spontaneous adventures.",
    ready_adventure: "Ready for Your Next Adventure?",
    join_travelers: "Join thousands of travelers discovering unique experiences worldwide",
    explore_experiences: "Explore Experiences",
    create_account: "Create Account",

    // Categories
    tours: "Tours",
    culture: "Culture",
    food_drink: "Food & Drink",
    hand_crafting: "Hand Crafting",
    nature: "Nature",
    adventure: "Adventure",
    all_categories: "All Categories",

    // Experience details
    per_person: "per person",
    view_details: "View Details",
    reviews: "reviews",
    hours: "hours",
    book_now: "Book Now",
    save_wishlist: "Save to wishlist",

    // Authentication
    login: "Log In",
    signup: "Sign Up",
    logout: "Log Out",
    login_required: "Login Required",
    login_to_book: "Please log in to book this experience",
    cancel: "Cancel",

    // Footer
    subscribe_newsletter: "Subscribe to our newsletter",
    get_latest: "Get the latest travel tips, destination guides, and exclusive offers",
    enter_email: "Enter your email",
    subscribe: "Subscribe",
    discover_amazing: "Discover amazing experiences around the world with our curated travel platform.",
    explore_footer: "Explore",
    company: "Company",
    support: "Support",
    about_us: "About Us",
    careers: "Careers",
    contact_us: "Contact Us",
    partner_with_us: "Partner With Us",
    help_center: "Help Center",
    faq: "FAQ",
    privacy_policy: "Privacy Policy",
    terms_service: "Terms of Service",
    copyright: "© 2024 TravelExplorer. All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    sitemap: "Sitemap",
  },
  ru: {
    // Navigation
    home: "Главная",
    experiences: "Впечатления",
    destinations: "Направления",
    itineraries: "Маршруты",
    chat: "Чат",
    for_business: "Для Бизнеса",
    search: "Поиск",
    search_placeholder: "Поиск впечатлений...",
    account: "Аккаунт",
    profile: "Профиль",

    // Home page
    discover_travel: "Откройте для себя незабываемые путешествия",
    explore_curated: "Исследуйте тщательно подобранные впечатления от местных экспертов со всего мира",
    search_destinations: "Поиск направлений или впечатлений...",
    when: "Когда?",
    explore_now: "Исследовать сейчас",
    browse_category: "Просмотр по категориям",
    find_experiences: "Найдите впечатления, соответствующие вашим интересам",
    view_all_categories: "Посмотреть все категории",
    featured_experiences: "Рекомендуемые впечатления",
    handpicked_activities: "Тщательно отобранные мероприятия, которые любят наши путешественники",
    see_more_experiences: "Посмотреть больше впечатлений",
    where_to_next: "Куда дальше?",
    why_choose_us: "Почему выбирают нас",
    we_curate: "Мы подбираем лучшие впечатления от проверенных местных экспертов со всего мира",
    curated_experiences: "Отобранные впечатления",
    curated_description:
      "Тщательно отобранные впечатления, проверенные на качество и аутентичность нашими экспертами по путешествиям.",
    local_experts: "Местные эксперты",
    local_experts_description: "Общайтесь с знающими местными гидами, которые делятся подлинными знаниями и историями.",
    flexible_booking: "Гибкое бронирование",
    flexible_booking_description:
      "Возможность бесплатной отмены и наличие в последнюю минуту для спонтанных приключений.",
    ready_adventure: "Готовы к следующему приключению?",
    join_travelers:
      "Присоединяйтесь к тысячам путешественников, открывающих для себя уникальные впечатления по всему миру",
    explore_experiences: "Исследовать впечатления",
    create_account: "Создать аккаунт",

    // Categories
    tours: "Туры",
    culture: "Культура",
    food_drink: "Еда и напитки",
    hand_crafting: "Ручное творчество",
    nature: "Природа",
    adventure: "Приключения",
    all_categories: "Все категории",

    // Experience details
    per_person: "на человека",
    view_details: "Посмотреть детали",
    reviews: "отзывов",
    hours: "часов",
    book_now: "Забронировать",
    save_wishlist: "Сохранить в избранное",

    // Authentication
    login: "Войти",
    signup: "Регистрация",
    logout: "Выйти",
    login_required: "Требуется вход",
    login_to_book: "Пожалуйста, войдите, чтобы забронировать это впечатление",
    cancel: "Отмена",

    // Footer
    subscribe_newsletter: "Подпишитесь на нашу рассылку",
    get_latest: "Получайте последние советы по путешествиям, путеводители по направлениям и эксклюзивные предложения",
    enter_email: "Введите ваш email",
    subscribe: "Подписаться",
    discover_amazing: "Откройте для себя удивительные впечатления по всему миру с нашей платформой для путешествий.",
    explore_footer: "Исследовать",
    company: "Компания",
    support: "Поддержка",
    about_us: "О нас",
    careers: "Карьера",
    contact_us: "Связаться с нами",
    partner_with_us: "Стать партнером",
    help_center: "Центр помощи",
    faq: "Часто задаваемые вопросы",
    privacy_policy: "Политика конфиденциальности",
    terms_service: "Условия использования",
    copyright: "© 2024 TravelExplorer. Все права защищены.",
    privacy: "Конфиденциальность",
    terms: "Условия",
    sitemap: "Карта сайта",
  },
  uz: {
    // Navigation
    home: "Bosh sahifa",
    experiences: "Tajribalar",
    destinations: "Yo'nalishlar",
    itineraries: "Marshrutlar",
    chat: "Chat",
    for_business: "Biznes uchun",
    search: "Qidirish",
    search_placeholder: "Tajribalarni qidirish...",
    account: "Hisob",
    profile: "Profil",

    // Home page
    discover_travel: "Unutilmas sayohat tajribalarini kashf eting",
    explore_curated: "Dunyo bo'ylab mahalliy ekspertlardan tanlangan tajribalarni o'rganing",
    search_destinations: "Yo'nalishlar yoki tajribalarni qidirish...",
    when: "Qachon?",
    explore_now: "Hozir o'rganish",
    browse_category: "Kategoriyalar bo'yicha ko'rish",
    find_experiences: "Qiziqishlaringizga mos tajribalarni toping",
    view_all_categories: "Barcha kategoriyalarni ko'rish",
    featured_experiences: "Tavsiya etilgan tajribalar",
    handpicked_activities: "Sayohatchilarimiz sevadigan qo'lda tanlangan faoliyatlar",
    see_more_experiences: "Ko'proq tajribalarni ko'rish",
    where_to_next: "Keyin qayerga?",
    why_choose_us: "Nima uchun bizni tanlaysiz",
    we_curate: "Biz dunyo bo'ylab ishonchli mahalliy ekspertlardan eng yaxshi tajribalarni tanlaymiz",
    curated_experiences: "Tanlangan tajribalar",
    curated_description:
      "Sayohat ekspertlarimiz tomonidan sifat va autentiklik uchun tekshirilgan qo'lda tanlangan tajribalar.",
    local_experts: "Mahalliy ekspertlar",
    local_experts_description:
      "Haqiqiy bilim va hikoyalarni baham ko'radigan bilimli mahalliy yo'l ko'rsatuvchilar bilan bog'laning.",
    flexible_booking: "Moslashuvchan bron qilish",
    flexible_booking_description:
      "Spontan sarguzashtlar uchun bepul bekor qilish imkoniyatlari va so'nggi daqiqada mavjudlik.",
    ready_adventure: "Keyingi sarguzashtingizga tayyormisiz?",
    join_travelers: "Dunyo bo'ylab noyob tajribalarni kashf etayotgan minglab sayohatchilar qatoriga qo'shiling",
    explore_experiences: "Tajribalarni o'rganish",
    create_account: "Hisob yaratish",

    // Categories
    tours: "Turlar",
    culture: "Madaniyat",
    food_drink: "Ovqat va ichimliklar",
    hand_crafting: "Qo'l hunarmandchiligi",
    nature: "Tabiat",
    adventure: "Sarguzasht",
    all_categories: "Barcha kategoriyalar",

    // Experience details
    per_person: "kishi boshiga",
    view_details: "Tafsilotlarni ko'rish",
    reviews: "sharhlar",
    hours: "soat",
    book_now: "Hozir bron qilish",
    save_wishlist: "Istaklar ro'yxatiga saqlash",

    // Authentication
    login: "Kirish",
    signup: "Ro'yxatdan o'tish",
    logout: "Chiqish",
    login_required: "Kirish talab qilinadi",
    login_to_book: "Iltimos, bu tajribani bron qilish uchun tizimga kiring",
    cancel: "Bekor qilish",

    // Footer
    subscribe_newsletter: "Bizning yangiliklarimizga obuna bo'ling",
    get_latest:
      "Eng so'nggi sayohat maslahatlarini, yo'nalishlar bo'yicha qo'llanmalarni va eksklyuziv takliflarni oling",
    enter_email: "Emailingizni kiriting",
    subscribe: "Obuna bo'lish",
    discover_amazing: "Bizning sayohat platformamiz bilan dunyo bo'ylab ajoyib tajribalarni kashf eting.",
    explore_footer: "O'rganish",
    company: "Kompaniya",
    support: "Qo'llab-quvvatlash",
    about_us: "Biz haqimizda",
    careers: "Karyera",
    contact_us: "Biz bilan bog'lanish",
    partner_with_us: "Biz bilan hamkorlik qilish",
    help_center: "Yordam markazi",
    faq: "Ko'p so'raladigan savollar",
    privacy_policy: "Maxfiylik siyosati",
    terms_service: "Xizmat ko'rsatish shartlari",
    copyright: "© 2024 TravelExplorer. Barcha huquqlar himoyalangan.",
    privacy: "Maxfiylik",
    terms: "Shartlar",
    sitemap: "Sayt xaritasi",
  },
}

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage && ["en", "ru", "uz"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // Always default to English
      setLanguage("en")
    }
  }, [])

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof (typeof translations)["en"]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export const useTranslation = () => {
  const { t } = useContext(LanguageContext)
  return { t }
}
