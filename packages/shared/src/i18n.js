import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './constants.js';

/**
 * Build a translator bound to a locale, falling back to English silently for
 * missing keys. Works in node and the browser. Vars are interpolated by
 * `{varName}` in the dictionary value.
 *
 * @param {string} locale
 * @param {Record<string, object>} dictionaries  Map of locale → loaded JSON
 */
export function createI18n(locale, dictionaries) {
  const code = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const primary = dictionaries[code] || dictionaries[DEFAULT_LOCALE] || {};
  const fallback = dictionaries[DEFAULT_LOCALE] || {};

  function lookup(dict, key) {
    return key.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), dict);
  }

  function interpolate(template, vars) {
    if (typeof template !== 'string') return template;
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
      template,
    );
  }

  return {
    locale: code,
    /**
     * @param {string} key  Dotted key into the dictionary, e.g. 'lobby.countdown'.
     * @param {Record<string, string|number>} [vars]
     */
    t(key, vars = {}) {
      const value = lookup(primary, key) ?? lookup(fallback, key);
      if (value == null) return key;
      return interpolate(value, vars);
    },
  };
}
