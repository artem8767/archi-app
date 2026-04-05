/**
 * Виводить короткий список ручних кроків після успішного release:check.
 * Запуск: npm run prepare:publish
 */
/* eslint-disable no-console */
console.log(`
────────────────────────────────────────────────────────────
  Публікація: що зробити вручну (сайт + Google)
────────────────────────────────────────────────────────────

Веб-сайт
  • Деплой Next.js на HTTPS; на хості задати змінні з .env.example (прод).
  • Перевірити в браузері /uk/privacy, /uk/terms (або /en/…) публічно.
  • Реєстрація: Resend або SMTP + EMAIL_FROM (коди підтвердження на email).

Google Search Console (сайт у пошуку)
  • https://search.google.com/search-console — додати ресурс (домен або префікс URL).
  • Підтвердити власність (HTML-тег: NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION у .env).
  • «Карта сайту» → надіслати: https://ваш-домен/sitemap.xml

Google Play Console (Android з папки mobile/)
  • Оплатити акаунт розробника, створити застосунок, завантажити AAB (EAS build).
  • Заповнити Data safety, Content rating, Store listing; URL політики = NEXT_PUBLIC_PRIVACY_POLICY_URL.
  • Після публікації: NEXT_PUBLIC_PLAY_STORE_URL на сервері (кнопка «Завантажити з Google Play»).

Детальний чекліст: scripts/PLAY_STORE_CHECKLIST.txt
────────────────────────────────────────────────────────────
`);
