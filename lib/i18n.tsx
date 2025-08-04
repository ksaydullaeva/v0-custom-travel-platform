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
    select_date: "Select Date",
    select_time: "Select Time",
    number_participants: "Number of Participants",
    total: "Total",
    free_cancellation: "Free cancellation up to 24 hours before",
    reserve_now: "Reserve now, pay later",
    about_experience: "About This Experience",
    highlights: "Highlights",
    experience_details: "Experience Details",
    whats_included: "What's Included",
    whats_not_included: "What's Not Included",
    important_information: "Important Information",
    confirmation: "Confirmation",
    accessibility: "Accessibility",
    cancellation_policy: "Cancellation Policy",
    location: "Location",
    you_might_also_like: "You Might Also Like",
    overview: "Overview",
    details: "Details",
    back_to_experiences: "Back to Experiences",

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
    copyright: "© 2024 TravelMind. All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    sitemap: "Sitemap",
    all_rights_reserved: "All rights reserved.",
    success: "Success",
    newsletter_subscribed: "You have successfully subscribed to our newsletter",

    // Experiences page
    filters: "Filters",
    destination: "Destination",
    clear: "Clear",
    category: "Category",
    price_range: "Price Range",
    duration: "Duration",
    less_than_3: "Less than 3 hours",
    three_to_six: "3 to 6 hours",
    more_than_6: "More than 6 hours",
    clear_all_filters: "Clear All Filters",
    showing: "Showing",
    experiences_in: "experiences in",
    no_experiences_found: "No experiences found",
    try_different_search: "Try a different search or filter",
    sort_by: "Sort by",
    most_popular: "Most Popular",
    price_low_high: "Price: Low to High",
    price_high_low: "Price: High to Low",
    highest_rated: "Highest Rated",
    choose_date: "Choose a date",
    available: "Available",
    unavailable: "Unavailable",

    // Business dashboard
    business_dashboard: "Business Dashboard",
    dashboard: "Dashboard",
    bookings: "Bookings",
    customers: "Customers",
    messages: "Messages",
    payments: "Payments",
    settings: "Settings",
    add_new_tour: "Add New Tour",
    total_tours: "Total Tours",
    active_bookings: "Active Bookings",
    total_revenue: "Total Revenue",
    total_customers: "Total Customers",
    recent_tours: "Recent Tours",
    recent_bookings: "Recent Bookings",
    no_bookings_yet: "No bookings yet",
    no_bookings_found: "No bookings found",
    bookings_will_appear_here: "Your bookings will appear here.",
    languages: "Languages",
    add_language: "Add Language",
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
    explore_curated: "Исследуйте отобранные впечатления от местных экспертов со всего мира",
    search_destinations: "Поиск направлений или впечатлений...",
    when: "Когда?",
    explore_now: "Исследовать сейчас",
    browse_category: "Просмотр по категориям",
    find_experiences: "Найдите впечатления, соответствующие вашим интересам",
    view_all_categories: "Просмотреть все категории",
    featured_experiences: "Рекомендуемые впечатления",
    handpicked_activities: "Тщательно отобранные мероприятия, которые любят наши путешественники",
    see_more_experiences: "Смотреть больше впечатлений",
    where_to_next: "Куда дальше?",
    why_choose_us: "Почему выбирают нас",
    we_curate: "Мы отбираем лучшие впечатления от проверенных местных экспертов со всего мира",
    curated_experiences: "Отобранные впечатления",
    curated_description: "Тщательно отобранные впечатления, проверенные на качество и подлинность нашими экспертами.",
    local_experts: "Местные эксперты",
    local_experts_description: "Общайтесь с знающими местными гидами, которые делятся подлинными знаниями и историями.",
    flexible_booking: "Гибкое бронирование",
    flexible_booking_description: "Бесплатная отмена и наличие в последнюю минуту для спонтанных приключений.",
    ready_adventure: "Готовы к следующему приключению?",
    join_travelers: "Присоединяйтесь к тысячам путешественников, открывающих уникальные впечатления по всему миру",
    explore_experiences: "Исследовать впечатления",
    create_account: "Создать аккаунт",

    // Categories
    tours: "Туры",
    culture: "Культура",
    food_drink: "Еда и напитки",
    hand_crafting: "Ремесла",
    nature: "Природа",
    adventure: "Приключения",
    all_categories: "Все категории",

    // Experience details
    per_person: "на человека",
    view_details: "Посмотреть детали",
    reviews: "отзывов",
    hours: "часов",
    book_now: "Забронировать сейчас",
    save_wishlist: "Сохранить в избранное",
    select_date: "Выбрать дату",
    select_time: "Выбрать время",
    number_participants: "Количество участников",
    total: "Итого",
    free_cancellation: "Бесплатная отмена за 24 часа до начала",
    reserve_now: "Забронируйте сейчас, оплатите позже",
    about_experience: "Об этом впечатлении",
    highlights: "Основные моменты",
    experience_details: "Детали впечатления",
    whats_included: "Что включено",
    whats_not_included: "Что не включено",
    important_information: "Важная информация",
    confirmation: "Подтверждение",
    accessibility: "Доступность",
    cancellation_policy: "Политика отмены",
    location: "Местоположение",
    you_might_also_like: "Вам также может понравиться",
    overview: "Обзор",
    details: "Детали",
    back_to_experiences: "Назад к впечатлениям",

    // Authentication
    login: "Войти",
    signup: "Зарегистрироваться",
    logout: "Выйти",
    login_required: "Требуется вход",
    login_to_book: "Пожалуйста, войдите, чтобы забронировать это впечатление",
    cancel: "Отмена",

    // Footer
    subscribe_newsletter: "Подпишитесь на нашу рассылку",
    get_latest: "Получайте последние советы по путешествиям, гиды по направлениям и эксклюзивные предложения",
    enter_email: "Введите ваш email",
    subscribe: "Подписаться",
    discover_amazing: "Откройте для себя удивительные впечатления по всему миру с нашей платформой.",
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
    copyright: "© 2024 TravelMind. Все права защищены.",
    privacy: "Конфиденциальность",
    terms: "Условия",
    sitemap: "Карта сайта",
    all_rights_reserved: "Все права защищены.",
    success: "Успешно",
    newsletter_subscribed: "Вы успешно подписались на нашу рассылку",

    // Experiences page
    filters: "Фильтры",
    destination: "Направление",
    clear: "Очистить",
    category: "Категория",
    price_range: "Ценовой диапазон",
    duration: "Продолжительность",
    less_than_3: "Менее 3 часов",
    three_to_six: "От 3 до 6 часов",
    more_than_6: "Более 6 часов",
    clear_all_filters: "Очистить все фильтры",
    showing: "Показано",
    experiences_in: "впечатлений в",
    no_experiences_found: "Впечатления не найдены",
    try_different_search: "Попробуйте другой поиск или фильтр",
    sort_by: "Сортировать по",
    most_popular: "Самые популярные",
    price_low_high: "Цена: от низкой к высокой",
    price_high_low: "Цена: от высокой к низкой",
    highest_rated: "Самые высокооцененные",
    choose_date: "Выберите дату",
    available: "Доступно",
    unavailable: "Недоступно",

    // Business dashboard
    business_dashboard: "Панель бизнеса",
    dashboard: "Панель",
    bookings: "Бронирования",
    customers: "Клиенты",
    messages: "Сообщения",
    payments: "Платежи",
    settings: "Настройки",
    add_new_tour: "Добавить тур",
    total_tours: "Всего туров",
    active_bookings: "Активные бронирования",
    total_revenue: "Общий доход",
    total_customers: "Всего клиентов",
    recent_tours: "Недавние туры",
    recent_bookings: "Недавние бронирования",
    no_bookings_yet: "Пока нет бронирований",
    no_bookings_found: "Бронирования не найдены",
    bookings_will_appear_here: "Ваши бронирования появятся здесь.",
    languages: "Языки",
    add_language: "Добавить язык",
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
    browse_category: "Kategoriya bo'yicha ko'rish",
    find_experiences: "Qiziqishlaringizga mos keladigan tajribalarni toping",
    view_all_categories: "Barcha kategoriyalarni ko'rish",
    featured_experiences: "Tavsiya etilgan tajribalar",
    handpicked_activities: "Sayohatchilarimiz sevadigan qo'lda tanlangan faoliyatlar",
    see_more_experiences: "Ko'proq tajribalarni ko'rish",
    where_to_next: "Keyingi manzil qayerga?",
    why_choose_us: "Nima uchun bizni tanlaysiz",
    we_curate: "Biz dunyo bo'ylab ishonchli mahalliy ekspertlardan eng yaxshi tajribalarni tanlaymiz",
    curated_experiences: "Tanlangan tajribalar",
    curated_description:
      "Sayohat ekspertlarimiz tomonidan sifat va haqiqiylik uchun tekshirilgan qo'lda tanlangan tajribalar.",
    local_experts: "Mahalliy ekspertlar",
    local_experts_description:
      "Haqiqiy bilim va hikoyalarni ulashadigan bilimli mahalliy yo'l ko'rsatuvchilar bilan bog'laning.",
    flexible_booking: "Moslashuvchan bron qilish",
    flexible_booking_description:
      "Spontan sarguzashtlar uchun bepul bekor qilish imkoniyatlari va so'nggi daqiqa mavjudligi.",
    ready_adventure: "Keyingi sarguzashtingizga tayyormisiz?",
    join_travelers: "Dunyo bo'ylab noyob tajribalarni kashf etayotgan minglab sayohatchilar qatoriga qo'shiling",
    explore_experiences: "Tajribalarni o'rganish",
    create_account: "Hisob yaratish",

    // Categories
    tours: "Turlar",
    culture: "Madaniyat",
    food_drink: "Ovqat va ichimlik",
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
    select_date: "Sanani tanlang",
    select_time: "Vaqtni tanlang",
    number_participants: "Ishtirokchilar soni",
    total: "Jami",
    free_cancellation: "24 soat oldin bepul bekor qilish",
    reserve_now: "Hozir zahiralang, keyinroq to'lang",
    about_experience: "Bu tajriba haqida",
    highlights: "Asosiy jihatlar",
    experience_details: "Tajriba tafsilotlari",
    whats_included: "Nimalar kiritilgan",
    whats_not_included: "Nimalar kiritilmagan",
    important_information: "Muhim ma'lumot",
    confirmation: "Tasdiqlash",
    accessibility: "Qulaylik",
    cancellation_policy: "Bekor qilish siyosati",
    location: "Joylashuv",
    you_might_also_like: "Sizga ham yoqishi mumkin",
    overview: "Umumiy ma'lumot",
    details: "Tafsilotlar",
    back_to_experiences: "Tajribalarga qaytish",

    // Authentication
    login: "Kirish",
    signup: "Ro'yxatdan o'tish",
    logout: "Chiqish",
    login_required: "Kirish talab qilinadi",
    login_to_book: "Iltimos, bu tajribani bron qilish uchun tizimga kiring",
    cancel: "Bekor qilish",

    // Footer
    subscribe_newsletter: "Bizning yangiliklarimizga obuna bo'ling",
    get_latest: "Eng so'nggi sayohat maslahatlarini, yo'nalish qo'llanmalarini va eksklyuziv takliflarni oling",
    enter_email: "Emailingizni kiriting",
    subscribe: "Obuna bo'lish",
    discover_amazing: "Bizning sayohat platformamiz orqali dunyo bo'ylab ajoyib tajribalarni kashf eting.",
    explore_footer: "O'rganish",
    company: "Kompaniya",
    support: "Qo'llab-quvvatlash",
    about_us: "Biz haqimizda",
    careers: "Karyera",
    contact_us: "Biz bilan bog'lanish",
    partner_with_us: "Biz bilan hamkorlik qiling",
    help_center: "Yordam markazi",
    faq: "Ko'p so'raladigan savollar",
    privacy_policy: "Maxfiylik siyosati",
    terms_service: "Xizmat shartlari",
    copyright: "© 2024 TravelMind. Barcha huquqlar himoyalangan.",
    privacy: "Maxfiylik",
    terms: "Shartlar",
    sitemap: "Sayt xaritasi",
    all_rights_reserved: "Barcha huquqlar himoyalangan.",
    success: "Muvaffaqiyatli",
    newsletter_subscribed: "Siz bizning axborotnomamizga muvaffaqiyatli obuna bo'ldingiz",

    // Experiences page
    filters: "Filtrlar",
    destination: "Yo'nalish",
    clear: "Tozalash",
    category: "Kategoriya",
    price_range: "Narx diapazoni",
    duration: "Davomiyligi",
    less_than_3: "3 soatdan kam",
    three_to_six: "3 dan 6 soatgacha",
    more_than_6: "6 soatdan ko'p",
    clear_all_filters: "Barcha filtrlarni tozalash",
    showing: "Ko'rsatilmoqda",
    experiences_in: "tajribalar",
    no_experiences_found: "Tajribalar topilmadi",
    try_different_search: "Boshqa qidiruv yoki filtrni sinab ko'ring",
    sort_by: "Saralash",
    most_popular: "Eng mashhur",
    price_low_high: "Narx: pastdan yuqoriga",
    price_high_low: "Narx: yuqoridan pastga",
    highest_rated: "Eng yuqori baholangan",
    choose_date: "Sanani tanlang",
    available: "Mavjud",
    unavailable: "Mavjud emas",

    // Business dashboard
    business_dashboard: "Biznes paneli",
    dashboard: "Panel",
    bookings: "Buyurtmalar",
    customers: "Mijozlar",
    messages: "Xabarlar",
    payments: "To'lovlar",
    settings: "Sozlamalar",
    add_new_tour: "Yangi tur qo'shish",
    total_tours: "Jami turlar",
    active_bookings: "Faol buyurtmalar",
    total_revenue: "Umumiy daromad",
    total_customers: "Jami mijozlar",
    recent_tours: "So'nggi turlar",
    recent_bookings: "So'nggi buyurtmalar",
    no_bookings_yet: "Hali buyurtmalar yo'q",
    no_bookings_found: "Buyurtmalar topilmadi",
    bookings_will_appear_here: "Buyurtmalaringiz shu yerda ko'rsatiladi.",
    languages: "Tillar",
    add_language: "Til qo'shish",
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
  const [language, setLanguageState] = useState("en")

  useEffect(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage && ["en", "es", "fr", "ru", "uz"].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      // Default to English
      setLanguageState("en")
    }
  }, [])

  const setLanguage = (code: string) => {
    if (["en", "es", "fr", "ru", "uz"].includes(code)) {
      setLanguageState(code)
      localStorage.setItem("language", code)
    }
  }

  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations] || translations.en
    return currentTranslations[key as keyof typeof currentTranslations] || key
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
