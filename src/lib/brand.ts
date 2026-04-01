/**
 * Єдиний латинський напис бренду в коді (не перекладається в UI).
 * Щоб змінити назву: оновіть цей рядок і дублікати в messages (поле meta.title у кожній локалі),
 * якщо цей блок використовується.
 */
export const APP_BRAND_NAME = "ARCHI" as const;

/** Маркер у DOM для захисту від Google Translate / перекладу браузера. */
export const BRAND_NO_TRANSLATE_SELECTOR = "[data-notranslate-brand]";
