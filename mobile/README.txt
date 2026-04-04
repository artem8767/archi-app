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
  1) npm i -g eas-cli
  2) eas login
  3) cd mobile && eas build:configure   (якщо ще не створено проєкт на expo.dev)
  4) eas build -p android --profile production
  5) Завантажте отриманий .aab у Google Play Console.

Документація Expo: https://docs.expo.dev/build/introduction/
