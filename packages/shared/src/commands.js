/**
 * Localized chat command parsing. The action ids are stable English strings
 * (`join`, `attack`, `heal`, `block`); only the trigger words are translated.
 *
 * English aliases are always accepted as a fallback in every locale because
 * multilingual chats are common.
 */

import { DEFAULT_LOCALE } from './constants.js';

const ENGLISH_ALIASES = {
  join: ['!join', '!fight'],
  attack: ['!attack', '!atk', '!a'],
  heal: ['!heal', '!h'],
  block: ['!block', '!b'],
};

/**
 * Build a parser for a given locale. Returns a function taking the raw chat
 * message and returning `{ action }` or `null`.
 *
 * @param {string} locale
 * @param {Record<string, object>} dictionaries
 */
export function createCommandParser(locale, dictionaries) {
  const localeAliases = (dictionaries[locale] && dictionaries[locale].commands) || {};
  const fallbackAliases =
    (dictionaries[DEFAULT_LOCALE] && dictionaries[DEFAULT_LOCALE].commands) || ENGLISH_ALIASES;

  // Merge: locale aliases first, then English fallback, deduped.
  const merged = {};
  for (const action of Object.keys(ENGLISH_ALIASES)) {
    const set = new Set([
      ...(localeAliases[action] || []),
      ...(fallbackAliases[action] || []),
      ...ENGLISH_ALIASES[action],
    ]);
    merged[action] = [...set].map((a) => a.toLowerCase());
  }

  return function parse(message) {
    if (typeof message !== 'string') return null;
    const trimmed = message.trim().toLowerCase();
    if (!trimmed.startsWith('!')) return null;
    for (const [action, aliases] of Object.entries(merged)) {
      for (const a of aliases) {
        if (trimmed === a || trimmed.startsWith(a + ' ')) return { action };
      }
    }
    return null;
  };
}
