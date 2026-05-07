import { createI18n } from '@bossraid/shared';
import en from '@bossraid/shared/locales/en.json';
import es from '@bossraid/shared/locales/es.json';
import pt from '@bossraid/shared/locales/pt.json';
import ja from '@bossraid/shared/locales/ja.json';
import ko from '@bossraid/shared/locales/ko.json';

const dictionaries = { en, es, pt, ja, ko };

/**
 * Resolve the locale from URL (?lang=es) and return an i18n object with
 * `.t(key, vars)` and `.locale`. Falls back to English on unknown codes.
 */
export function resolveI18n() {
  const params = new URLSearchParams(globalThis.location?.search || '');
  const lang = params.get('lang') || 'en';
  return createI18n(lang, dictionaries);
}
