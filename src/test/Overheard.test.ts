import { Overheard } from '../Overheard.js'
import { describe, expect, test } from 'vitest'

/**
 * Template overheard page
 * @param online
 * @param moon
 * @param scrolls
 * @returns
 */
const tOverheard = (
  online: number | 'very few' = 50,
  moon = 'new',
  scrolls = 'There are no reports of glowing or dark scrolls',
): string =>
  `<html><head><title>Overheard</title></head><body bgcolor="#f5f3e4"><div align="center"><h1>Overheard in Tavelor's Tavern</h1></div><div align="left">There are ${online} champions adventuring across the realms today, more or less.<br><br>The moon is ${moon}.<br><br>Rumor has it that ${scrolls}.<br><br></body></html>`

describe('Overheard', () => {
  test('parse should return game state', () => {
    expect(
      Overheard.parse(
        tOverheard(100, 'waning gibbous', 'necromancy and conjuration scrolls are glowing'),
      ),
    ).toStrictEqual({
      online: 100,
      moon: 'waning_gibbous',
      realms: {
        conjuration: 'glowing',
        necromancy: 'glowing',
      },
    })
  })

  test('parse should throw', () => {
    expect(() => Overheard.parse('')).toThrow(/failed to match/)
  })

  test('parse should handle "very few" online', () => {
    expect(Overheard.parse(tOverheard('very few', 'new'))).toStrictEqual({
      moon: 'new',
      online: 'very_few',
      realms: {},
    })
  })

  test('parse should handle commas', () => {
    expect(
      Overheard.parse(
        tOverheard(
          128,
          'nearly full',
          'necromancy, divination, and conjuration scrolls are glowing',
        ),
      ),
    ).toStrictEqual({
      moon: 'nearly_full',
      online: 128,
      realms: {
        conjuration: 'glowing',
        divination: 'glowing',
        necromancy: 'glowing',
      },
    })
  })
})
