import { CommanderError } from 'commander'
import { describe, expect, test } from 'vitest'
import { parseArgSelect, parseArgTimeunit } from '../bin.js'

describe('bin', () => {
  test('parseArgTimeunit should parse time', () => {
    expect(parseArgTimeunit()('1s')).toBe(1000)
  })

  test('parseArgTimeunit should parse integers', () => {
    expect(parseArgTimeunit()('1000')).toBe(1000)
  })

  test('parseArgSelect should validate selection', () => {
    expect(parseArgSelect(['a', 'b', 'c'])('c')).toBe('c')
  })

  test('parseArgSelect should throw on invalid selection', () => {
    expect(() => parseArgSelect(['a', 'b', 'c'])('z')).toThrowError(CommanderError)
  })
})
