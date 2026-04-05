/**
 * Terms of Use — повні юридично орієнтовані версії EN + UK.
 * Інші локалі: сторінка terms показує EN + termsLegalNotice у перекладі.
 */
export type TermsSection = { heading: string; paragraphs: string[] };

export const TERMS_SECTIONS_EN: TermsSection[] = [
  {
    heading: "1. Agreement",
    paragraphs: [
      "These Terms of Use (“Terms”) govern your access to and use of the ARCHI online service (“ARCHI”, “we”, “us”), including the website and related applications provided by the operator of this deployment.",
      "By creating an account, signing in, or otherwise using ARCHI, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the service.",
      "The party responsible for operating this instance is the person or organisation that deploys and administers it (the “Operator”). Contact details may appear in the site footer or About page.",
    ],
  },
  {
    heading: "2. The service",
    paragraphs: [
      "ARCHI offers community features such as news posts, classified listings, job posts, comments, and public chat. Features may change; we do not guarantee uninterrupted or error-free operation.",
      "You use the service at your own risk. The Operator may suspend, limit, or end the service or your access where reasonably necessary for security, legal compliance, or abuse prevention.",
    ],
  },
  {
    heading: "3. Accounts and eligibility",
    paragraphs: [
      "You must provide accurate registration information and keep your credentials secure. You are responsible for activity under your account.",
      "Phone verification (SMS) or other checks may be required. You must not impersonate others or create accounts to evade enforcement.",
      "ARCHI is not directed at children. You must meet the minimum age required by law in your country to enter into a binding agreement.",
    ],
  },
  {
    heading: "4. Acceptable use",
    paragraphs: [
      "You must comply with applicable law and must not use ARCHI to harass, threaten, defraud, spam, distribute malware, or infringe intellectual property or privacy rights of others.",
      "You must not post unlawful, hateful, sexually exploitative, excessively violent, or otherwise prohibited content. Automated or bulk scraping without permission is not allowed.",
      "The Operator may use automated or manual moderation (including third-party tools if configured) to detect or limit disallowed content.",
    ],
  },
  {
    heading: "5. Your content",
    paragraphs: [
      "You retain rights to content you submit. By posting, you grant the Operator a non-exclusive licence to host, store, display, and distribute that content on and through ARCHI as needed to run the service.",
      "You confirm you have the rights needed for what you upload (text, images, links, media). You may delete some content where the product allows; residual copies or backups may persist for a limited time.",
    ],
  },
  {
    heading: "6. Blocking and enforcement",
    paragraphs: [
      "Users may be able to block other users where the product supports it. Blocking affects how content is shown to you; it does not necessarily remove content for others.",
      "We may remove content, suspend or terminate accounts, or take other steps if we believe these Terms or the law are violated, without prior notice where urgent.",
    ],
  },
  {
    heading: "7. Disclaimers",
    paragraphs: [
      "The service is provided “as is” and “as available”. To the fullest extent permitted by law, the Operator disclaims warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      "We do not endorse user-generated content and are not responsible for transactions or interactions between users outside what the product explicitly provides.",
    ],
  },
  {
    heading: "8. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, the Operator and its contributors shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of ARCHI.",
      "Where liability cannot be excluded, total liability shall be limited to the greater of amounts you paid for the service in the twelve months before the claim (if any) or fifty euros (€50), except where mandatory law provides otherwise.",
    ],
  },
  {
    heading: "9. Changes",
    paragraphs: [
      "We may update these Terms. The “Last updated” date will change. Continued use after changes constitutes acceptance of the revised Terms, except where applicable law requires separate consent.",
    ],
  },
  {
    heading: "10. Contact",
    paragraphs: [
      "For questions about these Terms, contact the Operator using the email or links shown in the site footer or About page, if provided.",
    ],
  },
];

export const TERMS_SECTIONS_UK: TermsSection[] = [
  {
    heading: "1. Угода",
    paragraphs: [
      "Ці Умови користування («Умови») регулюють ваш доступ до онлайн-сервісу ARCHI («ARCHI», «ми»), включно з вебсайтом і пов’язаними застосунками, які надає оператор цього розгортання.",
      "Створюючи обліковий запис, входячи в систему або іншим чином користуючись ARCHI, ви погоджуєтеся з цими Умовами та з Політикою конфіденційності. Якщо не згодні — не користуйтеся сервісом.",
      "Сторона, відповідальна за роботу цього екземпляра, — особа чи організація, яка його розгортає та адмініструє («Оператор»). Контактні дані можуть бути в підвалі сайту або на сторінці «Про застосунок».",
    ],
  },
  {
    heading: "2. Сервіс",
    paragraphs: [
      "ARCHI надає функції спільноти: новини, оголошення, вакансії, коментарі, публічний чат. Функції можуть змінюватися; ми не гарантуємо безперервну або безпомилкову роботу.",
      "Ви користуєтеся сервісом на власний ризик. Оператор може призупинити, обмежити або припинити сервіс чи ваш доступ, якщо це розумно потрібно для безпеки, дотримання закону або запобігання зловживанням.",
    ],
  },
  {
    heading: "3. Облікові записи та відповідність вимогам",
    paragraphs: [
      "Ви маєте надавати достовірні дані при реєстрації та зберігати облікові дані в таємниці. Ви відповідаєте за дії під своїм акаунтом.",
      "Може знадобитися підтвердження телефона (SMS) або інші перевірки. Заборонено видавати себе за інших або створювати акаунти для обходу санкцій.",
      "ARCHI не призначений для дітей. Ви маєте досягти мінімального віку, передбаченого законом вашої країни для укладення зобов’язальної угоди.",
    ],
  },
  {
    heading: "4. Допустиме використання",
    paragraphs: [
      "Ви зобов’язані дотримуватися чинного законодавства та не використовувати ARCHI для переслідування, погроз, шахрайства, спаму, поширення шкідливого ПЗ чи порушення прав інтелектуальної власності чи приватності інших.",
      "Заборонено публікувати незаконний, мов ненависті, сексуально експлуататорський, надмірно жорстокий або інший заборонений контент. Автоматичне або масове знімання даних без дозволу не дозволяється.",
      "Оператор може застосовувати автоматичну або ручну модерацію (у тому числі сторонні інструменти за налаштування) для виявлення або обмеження забороненого контенту.",
    ],
  },
  {
    heading: "5. Ваш контент",
    paragraphs: [
      "Права на контент, який ви публікуєте, залишаються за вами. Публікуючи матеріали, ви надаєте Оператору невиключну ліцензію на хостинг, зберігання, показ і поширення цього контенту в межах ARCHI для роботи сервісу.",
      "Ви підтверджуєте, що маєте права на завантажуваний контент (текст, зображення, посилання, медіа). Видалення можливе там, де це передбачено продуктом; копії в резервних копіях можуть зберігатися обмежений час.",
    ],
  },
  {
    heading: "6. Блокування та заходи",
    paragraphs: [
      "Користувачі можуть блокувати інших користувачів, якщо продукт це підтримує. Блокування впливає на те, що ви бачите; для інших користувачів контент може лишатися видимим.",
      "Ми можемо видаляти контент, призупиняти або закривати акаунти чи вживати інших заходів, якщо вважаємо, що порушено ці Умови або закон, інколи без попередження у термінових випадках.",
    ],
  },
  {
    heading: "7. Відмова від гарантій",
    paragraphs: [
      "Сервіс надається «як є» та «як доступно». У максимальній мірі, дозволеній законом, Оператор відмовляється від гарантій придатності для продажу, придатності для певної мети та непорушення прав.",
      "Ми не схвалюємо користувацький контент і не відповідаємо за угоди чи взаємодії між користувачами поза тим, що прямо передбачено продуктом.",
    ],
  },
  {
    heading: "8. Обмеження відповідальності",
    paragraphs: [
      "У максимальній мірі, дозволеній законом, Оператор та учасники проєкту не відповідають за непрямі, випадкові, спеціальні, побічні або штрафні збитки, втрату прибутку, даних або ділової репутації через використання ARCHI.",
      "Якщо відповідальність не можна виключити, її суму обмежено більшим із: суми, сплаченої вами за сервіс протягом дванадцяти місяців до претензії (якщо така була), або п’ятдесяти євро (50 €), окрім випадків імперативних норм закону.",
    ],
  },
  {
    heading: "9. Зміни",
    paragraphs: [
      "Ми можемо оновлювати ці Умови. Дата «Останнє оновлення» зміниться. Подальше використання після змін означає прийняття нових Умов, окрім випадків, коли закон вимагає окремої згоди.",
    ],
  },
  {
    heading: "10. Контакти",
    paragraphs: [
      "Питання щодо Умов надсилайте Оператору за електронною поштою або посиланнями в підвалі сайту чи на сторінці «Про застосунок», якщо вони вказані.",
    ],
  },
];

export function getTermsSections(locale: string): TermsSection[] {
  return locale === "uk" ? TERMS_SECTIONS_UK : TERMS_SECTIONS_EN;
}
