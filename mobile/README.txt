ARCHI — оболонка Android/iOS (Expo) для веб-сайту Next.js
========================================================

Що це
  Повноекранний WebView відкриває ваш розгорнутий сайт ARCHI.
  AAB для Google Play збирається тут, не в корені репозиторію Next.js.

Перед збіркою
  1) Скопіюйте .env.example → .env і вкажіть EXPO_PUBLIC_SITE_URL (HTTPS у production).
  2) У app.json замініть android.package та ios.bundleIdentifier на свої
     (наприклад com.yourcompany.archi) — мають збігатися з Play Console.

Локально
  cd mobile
  npm install
  npx expo start
  (Emulator або Expo Go; для WebView у Expo Go можливі обмеження — для релізу краще development build.)

AAB для Google Play (EAS Build)
  Детально (логін, збірка, ЗАВАНТАЖИТИ .aab з expo.dev, завантажити в Play): AAB_ZAVANTAZHYTY.txt
  Коротко:
  1) cd mobile && npm install && npm run eas:login
  2) npm run eas:configure
  3) npm run build:aab
  4) expo.dev → Builds → Download .aab
  5) Play Console → Upload AAB

Документація Expo: https://docs.expo.dev/build/introduction/
