import { describe, expect, it } from 'vitest';

import { createCommandParser } from '@bossraid/shared';

import en from '../../shared/src/locales/en.json' with { type: 'json' };
import es from '../../shared/src/locales/es.json' with { type: 'json' };
import pt from '../../shared/src/locales/pt.json' with { type: 'json' };
import ja from '../../shared/src/locales/ja.json' with { type: 'json' };
import ko from '../../shared/src/locales/ko.json' with { type: 'json' };

const ALL = { en, es, pt, ja, ko };

describe('commandRouter (English)', () => {
  const parse = createCommandParser('en', { en });

  it.each([
    ['!join', 'join'],
    ['!fight', 'join'],
    ['!attack', 'attack'],
    ['!atk', 'attack'],
    ['!a', 'attack'],
    ['!a target_user', 'attack'],
    ['!heal', 'heal'],
    ['!h', 'heal'],
    ['!block', 'block'],
    ['!b', 'block'],
    ['!ATTACK', 'attack'], // case insensitive
    ['  !attack  ', 'attack'], // trim
  ])('parses %s → %s', (msg, action) => {
    expect(parse(msg)).toEqual({ action });
  });

  it.each([
    'hello',
    '!unknown',
    'attack', // no leading bang
    '',
    null,
    undefined,
  ])('rejects %p', (msg) => {
    expect(parse(msg)).toBeNull();
  });
});

describe('commandRouter (locale fallback to English)', () => {
  // Pretend a locale file is missing — parser should still accept English aliases.
  const parse = createCommandParser('xx', { en });
  it('falls back to English when locale is unknown', () => {
    expect(parse('!attack')).toEqual({ action: 'attack' });
  });
});

describe('commandRouter (multilocale)', () => {
  it.each([
    ['es', '!atacar', 'attack'],
    ['es', '!pelea', 'join'],
    ['pt', '!atacar', 'attack'],
    ['pt', '!entrar', 'join'],
    ['pt', '!luta', 'join'],
    ['ja', '!こうげき', 'attack'],
    ['ja', '!さんか', 'join'],
    ['ko', '!공격', 'attack'],
    ['ko', '!참가', 'join'],
  ])('locale %s parses %s → %s', (locale, msg, action) => {
    const parse = createCommandParser(locale, ALL);
    expect(parse(msg)).toEqual({ action });
  });

  it.each(['es', 'pt', 'ja', 'ko'])('locale %s falls back to English aliases', (locale) => {
    const parse = createCommandParser(locale, ALL);
    expect(parse('!attack')).toEqual({ action: 'attack' });
    expect(parse('!join')).toEqual({ action: 'join' });
  });
});
