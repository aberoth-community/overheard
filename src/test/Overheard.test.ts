/* eslint-disable @typescript-eslint/dot-notation */

import { Overheard } from '../Overheard'

const template = (
  online: number | 'very few' = 50,
  moon = 'new',
  scrolls = 'There are no reports of glowing or dark scrolls',
): string =>
  `<html><head><title>Overheard</title></head><body bgcolor="#f5f3e4"><div align="center"><h1>Overheard in Tavelor's Tavern</h1></div><div align="left">There are ${online} champions adventuring across the realms today, more or less.<br><br>The moon is ${moon}.<br><br>Rumor has it that ${scrolls}.<br><br></body></html>`

describe('Overheard.', () => {
  it('Should parse properties', () => {
    const overheard = new Overheard({})
    const res = overheard['parse'](
      template(150, 'waning gibbous', 'necromancy and conjuration scrolls are glowing'),
    )
    expect(res).toStrictEqual({
      online: 150,
      moon: 'waning_gibbous',
      scrolls: [
        { name: 'necromancy', phase: 'glowing' },
        { name: 'conjuration', phase: 'glowing' },
      ],
    })
  })

  it('Should parse very few online.', () => {
    const overheard = new Overheard({})
    const res = overheard['parse'](template('very few'))
    expect(res?.online).toBe(0)
  })

  it('Should parse inconsistent commas.', () => {
    const overheard = new Overheard({})
    expect(
      overheard['parse'](
        template(50, 'new', 'necromancy, divination, and conjuration scrolls are glowing'),
      ),
    ).not.toEqual(null)
    expect(
      overheard['parse'](template(50, 'new', 'necromancy and conjuration scrolls are glowing')),
    ).not.toEqual(null)
  })

  it('Should emit invalid content.', (done) => {
    const overheard = new Overheard({})
    overheard['fetch'] = async (url) => ''
    overheard
      .on('error', (err) => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe('failed parse, invalid content ""!')
        done()
      })
      .start()
  })

  it('Should emit events', (done) => {
    const overheard = new Overheard({})
    overheard['fetch'] = async (url) =>
      template(50, 'new', 'necromancy and conjuration scrolls are glowing')
    overheard
      .once('scrolls', (scrolls) => {
        expect(scrolls).toStrictEqual([
          { name: 'necromancy', phase: 'glowing' },
          { name: 'conjuration', phase: 'glowing' },
        ])
      })
      .once('online', (online) => {
        expect(online).toBe(50)
      })
      .once('moon', (phase) => {
        expect(phase).toBe('new')
      })
      .once('done', done)
      .start()
  })

  it('Should return to normal', (done) => {
    const overheard = new Overheard(
      {},
      {
        scrolls: {
          necromancy: 'dark',
          conjuration: 'dark',
        },
      },
    )
    overheard['fetch'] = async (url) => template()
    overheard
      .once('scrolls', (scrolls) => {
        expect(scrolls).toStrictEqual([
          { name: 'necromancy', phase: 'normal' },
          { name: 'conjuration', phase: 'normal' },
        ])
      })
      .once('done', done)
      .start()
  })
})
