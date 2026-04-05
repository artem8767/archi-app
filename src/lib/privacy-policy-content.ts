/**
 * Повний текст політики конфіденційності (юридично значущі версії: EN + UK).
 * Інші локалі див. сторінку privacy — показується EN + примітка.
 */
export type PrivacySection = { heading: string; paragraphs: string[] };

export const PRIVACY_SECTIONS_EN: PrivacySection[] = [
  {
    heading: "1. Who we are",
    paragraphs: [
      "This Privacy Policy describes how the ARCHI online service (“ARCHI”, “we”, “us”) collects, uses, and protects personal data when you use our website and related applications.",
      "The operator responsible for your data is the person or organisation that deploys and administers this instance of ARCHI (the “Controller”). If contact details are published on the site (for example in the footer or About page), you may use them for privacy-related requests.",
    ],
  },
  {
    heading: "2. Data we collect",
    paragraphs: [
      "Account and profile: email address, display name, password (stored only as a cryptographic hash; we do not store your password in plain text), interface language, and optional profile preferences (for example map location label, wallpaper, UI theme, notification level, auto-translate preference). Some older accounts may still have a phone number stored from a previous registration form.",
      "Verification: one-time or short-lived codes sent by email (and related delivery metadata held by your email provider, for example Resend or your SMTP host).",
      "Content you submit: news posts, marketplace listings, job posts, comments, chat messages, and any images, links, or media you attach. Listings and job posts may include a contact phone number you choose to publish.",
      "Technical data: when you use the service, standard server and application logs may include IP address, approximate timestamps, device/browser type, and URLs requested, as needed for security, debugging, and abuse prevention.",
    ],
  },
  {
    heading: "3. Why we use your data",
    paragraphs: [
      "To create and secure your account, authenticate you, and send verification codes to your email address (and, where configured, other email notifications).",
      "To operate community features: displaying posts, listings, jobs, comments, and chat to other users in line with how the product works.",
      "To enforce our rules and the law: automated or manual content checks (including optional third-party moderation tools if enabled by the operator), fraud prevention, and responding to valid legal requests.",
      "To improve reliability and safety of the service (logging, error diagnostics), and to respect your preferences (language, theme, location on the map if you save it).",
    ],
  },
  {
    heading: "4. Legal bases (EEA / UK users)",
    paragraphs: [
      "Where GDPR or the UK GDPR applies, we rely on: performance of a contract (providing the service you signed up for); legitimate interests (security, anti-abuse, product improvement balanced against your rights); consent where required (for example optional features clearly presented as such); and legal obligation where the law requires us to process data.",
    ],
  },
  {
    heading: "5. Sharing and processors",
    paragraphs: [
      "We do not sell your personal data. We share data only as needed to run ARCHI:",
      "Infrastructure and hosting: servers and databases chosen by the operator of this deployment.",
      "Messaging: email delivery via providers such as Resend or SMTP when the operator configures them (for example registration codes and optional notifications).",
      "Optional moderation: if enabled, short text segments may be sent to an external moderation API (for example OpenAI) solely to detect disallowed content before or after publication, according to the operator’s configuration.",
      "Other users: content you post in public or semi-public areas (news, listings, chat, comments) is visible as designed by the product, including your display name or email-derived identifier where the interface shows it.",
      "Legal: we may disclose information if required by law or to protect rights, safety, and integrity of users and the service.",
    ],
  },
  {
    heading: "6. Cookies and similar technologies",
    paragraphs: [
      "We use cookies or similar storage as needed to keep you logged in (session / authentication), remember preferences where applicable, and maintain basic security. You can control cookies through your browser settings; disabling essential cookies may prevent sign-in from working.",
    ],
  },
  {
    heading: "7. Retention",
    paragraphs: [
      "We keep account and content data while your account exists and the operator keeps the service running, unless a shorter period is required by law or chosen by the operator.",
      "Verification codes are short-lived. Logs may be rotated or deleted according to server configuration.",
      "If you ask to delete your account, the operator should erase or anonymise personal data unless retention is required by law.",
    ],
  },
  {
    heading: "8. Your rights",
    paragraphs: [
      "Depending on your location, you may have the right to access, correct, delete, restrict, or object to certain processing of your personal data, and to data portability. You may also withdraw consent where processing is consent-based.",
      "To exercise these rights, contact the Controller using the contact information published on this site. If you believe processing violates applicable law, you may lodge a complaint with your local data protection authority.",
    ],
  },
  {
    heading: "9. International transfers",
    paragraphs: [
      "If your data is processed in countries outside your region, we ensure appropriate safeguards where required (for example standard contractual clauses or adequacy decisions), depending on how this instance is hosted and which subprocessors the operator uses.",
    ],
  },
  {
    heading: "10. Children",
    paragraphs: [
      "ARCHI is not directed at children. We do not knowingly collect personal data from children below the age at which local law requires parental consent. If you believe a child has provided data, please contact us so we can delete it.",
    ],
  },
  {
    heading: "11. Changes",
    paragraphs: [
      "We may update this policy from time to time. The “Last updated” date at the top will change when we do. Continued use of the service after changes means you accept the updated policy, except where your consent is required for new processing.",
    ],
  },
  {
    heading: "12. Contact",
    paragraphs: [
      "For privacy questions, contact the operator of this ARCHI deployment using the email or link shown in the site footer or About page, if provided.",
    ],
  },
];

export const PRIVACY_SECTIONS_UK: PrivacySection[] = [
  {
    heading: "1. Хто ми",
    paragraphs: [
      "Ця Політика конфіденційності описує, як онлайн-сервіс ARCHI («ARCHI», «ми») збирає, використовує та захищає персональні дані під час використання вами нашого вебсайту та пов’язаних застосунків.",
      "Відповідальним за обробку даних є особа чи організація, яка розгортає та адмініструє цей екземпляр ARCHI («Володілець»). Якщо на сайті вказано контактні дані (наприклад у підвалі або на сторінці «Про застосунок»), ви можете використати їх для запитів щодо приватності.",
    ],
  },
  {
    heading: "2. Які дані ми збираємо",
    paragraphs: [
      "Обліковий запис і профіль: електронна пошта, ім’я для відображення, пароль (зберігається лише як криптографічний хеш; ми не зберігаємо пароль у відкритому вигляді), мова інтерфейсу та додаткові налаштування (наприклад підпис на карті, шпалери, тема інтерфейсу, рівень сповіщень, автопереклад). У деяких старіших записах може зберігатися номер телефона з попередньої форми реєстрації.",
      "Підтвердження: одноразові або короткочасні коди електронною поштою (і пов’язані метадані у провайдера пошти, наприклад Resend або ваш SMTP-хост).",
      "Контент, який ви публікуєте: новини, оголошення, вакансії, коментарі, повідомлення чату, зображення, посилання та медіа. В оголошеннях і вакансіях може бути телефон, який ви самі вказуєте для зв’язку.",
      "Технічні дані: стандартні журнали сервера та застосунку можуть містити IP-адресу, час запитів, тип браузера/пристрою та URL — для безпеки, діагностики та запобігання зловживанням.",
    ],
  },
  {
    heading: "3. Навіщо ми використовуємо дані",
    paragraphs: [
      "Щоб створити й захистити ваш обліковий запис, автентифікувати вас і надсилати коди підтвердження на email (а за налаштувань — інші листи).",
      "Щоб працювали функції спільноти: показ новин, оголошень, вакансій, коментарів і чату іншим користувачам відповідно до логіки продукту.",
      "Щоб дотримуватися правил і закону: автоматична або ручна модерація контенту (за наявності — зовнішні інструменти модерації), запобігання шахрайству та відповідь на законні запити.",
      "Щоб підтримувати стабільність і безпеку сервісу (журнали, діагностика помилок) і враховувати ваші налаштування (мова, тема, геолокація на карті, якщо ви її зберігаєте).",
    ],
  },
  {
    heading: "4. Правові підстави (ЄЗВП / UK GDPR)",
    paragraphs: [
      "Там, де застосовуються GDPR або UK GDPR, ми спираємося на: виконання договору (надання сервісу); законний інтерес (безпека, протидія зловживанням, покращення продукту з урахуванням ваших прав); згоду, де вона потрібна; юридичний обов’язок, де закон вимагає обробки.",
    ],
  },
  {
    heading: "5. Передача та субпроцесори",
    paragraphs: [
      "Ми не продаємо персональні дані. Передаємо лише настільки, наскільки це потрібно для роботи ARCHI:",
      "Інфраструктура та хостинг: сервери й бази даних, які обирає оператор цього розгортання.",
      "Повідомлення: електронна пошта через Resend або SMTP за налаштувань оператора (зокрема коди реєстрації та за потреби сповіщення).",
      "Опційна модерація: за увімкнення короткі фрагменти тексту можуть надсилатися зовнішньому API модерації (наприклад OpenAI) лише для виявлення забороненого контенту згідно з конфігурацією оператора.",
      "Інші користувачі: контент у відкритих або напіввідкритих розділах (новини, оголошення, чат, коментарі) видимий згідно з інтерфейсом, включно з іменем або ідентифікатором на основі email, де це показано.",
      "Закон: можемо розкрити інформацію, якщо цього вимагає закон або для захисту прав, безпеки та цілісності користувачів і сервісу.",
    ],
  },
  {
    heading: "6. Файли cookie та подібні технології",
    paragraphs: [
      "Використовуємо cookie або подібне сховище для збереження сесії (вхід у систему), налаштувань де потрібно та базової безпеки. Ви можете керувати cookie в браузері; вимкнення обов’язкових cookie може унеможливити вхід.",
    ],
  },
  {
    heading: "7. Зберігання",
    paragraphs: [
      "Зберігаємо дані облікового запису та контенту, поки існує ваш акаунт і оператор веде сервіс, якщо коротший строк не вимагається законом або не обраний оператором.",
      "Коди підтвердження діють обмежений час. Журнали можуть змінюватися або видалятися залежно від налаштувань сервера.",
      "Якщо ви просите видалити обліковий запис, оператор має стерти або знеособити персональні дані, якщо закон не вимагає їх зберігати.",
    ],
  },
  {
    heading: "8. Ваші права",
    paragraphs: [
      "Залежно від регіону ви можете мати право на доступ, виправлення, видалення, обмеження або заперечення проти певної обробки, а також на перенесення даних. Ви можете відкликати згоду, де обробка базується на згоді.",
      "Щоб скористатися правами, зверніться до Володільця за контактами на сайті. Якщо вважаєте, що обробка порушує закон, можете подати скаргу до наглядового органу з захисту даних.",
    ],
  },
  {
    heading: "9. Міжнародні передачі",
    paragraphs: [
      "Якщо дані обробляються за межами вашої країни, застосовуються відповідні гарантії (наприклад стандартні договірні положення або рішення про адекватність) залежно від хостингу та субпроцесорів оператора.",
    ],
  },
  {
    heading: "10. Діти",
    paragraphs: [
      "ARCHI не призначений для дітей. Ми свідомо не збираємо дані дітей молодше віку, з якого місцевий закон вимагає згоди батьків. Якщо вважаєте, що дитина надала дані, напишіть нам — ми їх видалимо.",
    ],
  },
  {
    heading: "11. Зміни",
    paragraphs: [
      "Ми можемо час від часу оновлювати цю політику. Дата «Останнє оновлення» зміниться відповідно. Подальше використання сервісу після змін означає прийняття оновленої політики, окрім випадків, коли для нової обробки потрібна окрема згода.",
    ],
  },
  {
    heading: "12. Контакти",
    paragraphs: [
      "Питання щодо приватності надсилайте оператору цього розгортання ARCHI за електронною поштою або посиланням у підвалі сайту чи на сторінці «Про застосунок», якщо вони вказані.",
    ],
  },
];

export function getPrivacySections(locale: string): PrivacySection[] {
  return locale === "uk" ? PRIVACY_SECTIONS_UK : PRIVACY_SECTIONS_EN;
}
