#!/usr/bin/env node

import { Command, CommanderError } from 'commander'
import { Overheard } from './Overheard'
import { realpath } from 'fs/promises'
import { fileURLToPath } from 'url'

/** Overheard command-line options */
export interface OverheardOptions {
  interval: number
  header: string[]
}

/**
 * Parse command-line timeunit
 * @param min  Min time
 * @param max  Max time
 * @returns    Parse function
 */
export const parseArgTimeunit = (min = 0, max = Infinity) => {
  return (value: string): number | undefined => {
    const units: Record<string, number> = {
      d: 8.64e7,
      h: 3.6e6,
      m: 60e3,
      s: 1000,
      ms: 1,
    }
    const [t, unit] = value.split(/(?=[a-z])/)
    const time = parseInt(t, 10)
    if (isNaN(time)) {
      throw new CommanderError(1, '1', `invalid time '${value}'!`)
    }
    return Math.min(Math.max(unit in units ? time * units[unit] : time, min), max)
  }
}

/**
 * Parse command-line selection
 * @param options  Select options
 * @returns        Parse function
 */
export const parseArgSelect = <T extends string>(options: T[]) => {
  return (value: string): T => {
    if (!options.includes(value as T)) {
      throw new CommanderError(1, '1', `invalid selection '${value}'!`)
    }
    return value as T
  }
}

/**
 * Create Overheard command-line app
 * @returns     Commander application
 */
export const createOverheardCommand = (): Command => {
  const app = new Command('overheard')
  app
    .option('-h, --header [values...]', 'add request headers.')
    .option('-i, --interval <int>', 'set scan interval.', parseArgTimeunit())
    .version(Overheard.OVERHEARD_VERSION, '-v, --version')
  return app.action(async (opts: Partial<OverheardOptions>) => {
    const overheard = new Overheard({
      headers: opts.header?.reduce((acc, cur) => {
        const match = cur.split('=', 2)
        return match.length === 2 ? { ...acc, [match[0]]: match[1] } : acc
      }, {}),
      interval: opts.interval,
    }).start()
    overheard.addEventListener('error', (event): void => {
      console.error(event.error)
    })
    overheard.addEventListener('moon', (event): void => {
      console.log(`moon: ${event.phase}`)
    })
    overheard.addEventListener('online', (event): void => {
      console.log(`online: ${event.online}`)
    })
    overheard.addEventListener('realm', (event): void => {
      console.log(`realm: ${event.name} ${event.phase}`)
    })
  })
}

// main
void (async () => {
  if (
    fileURLToPath(import.meta.url) === (await realpath(process.argv[1])) ||
    import.meta.env?.MODE === 'development'
  ) {
    createOverheardCommand().parse()
  }
})()
