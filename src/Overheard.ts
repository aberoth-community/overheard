import { EventEmitter } from 'events'
import {
  OVERHEARD_MOON_STATES,
  OVERHEARD_ORB_STATES,
  OVERHEARD_SCHOOL_NAMES,
  OVERHEARD_URL,
  OVERHEARD_VERSION,
} from './util/variables'

import type {
  GameState,
  MoonPhase,
  Options,
  OrbPhase,
  OverheardCache,
  OverheardEvent,
  OverheardOptions,
  SchoolName,
  ScrollState,
} from '../types/index'

/**
 * Simple overheard scraper
 * @class
 */
export class Overheard extends EventEmitter {
  private readonly _cache: OverheardCache
  private readonly _opts: Partial<Options>
  private timeout?: NodeJS.Timeout

  /**
   * Create new overheard instance
   * @param opts  - Scraper opts
   * @param cache - Stored values
   */
  constructor(opts?: Partial<Options>, cache: Partial<OverheardCache> = {}) {
    super()
    this._cache = {
      scrolls: Object.values(OVERHEARD_SCHOOL_NAMES).reduce((acc, cur) => {
        return { ...acc, [cur]: 'normal' }
      }, {}),
      ...cache,
    }
    this._opts = {
      ...opts,
    }
  }

  /**
   * Create instance from command-line options
   * @returns - Overheard instance & options
   */
  static async fromCLI(): Promise<[Overheard, OverheardOptions]> {
    const { Command } = await import('commander')
    const { timeunit } = await import('./util/cli/timeunit')
    return await new Promise((resolve, reject) => {
      const app = new Command('overheard')
      app
        .option('-t, --time <time>', 'scan interval', timeunit)
        .option('-q, --quiet', 'disable output', false)
        .version(OVERHEARD_VERSION, '-v, --version')
        .action((opts: OverheardOptions) => {
          resolve([new this(opts), opts])
        })
        .parse()
    })
  }

  /**
   * Fetch text
   * @param url - Page url
   * @returns   - Page text
   */
  private async fetch(url: string): Promise<string> {
    const res = await fetch(url, {
      method: 'GET',
      headers: this._opts?.headers,
    })
    if (!res.ok) {
      throw new Error(`[${res.status}] ${res.statusText}`)
    }
    return await res.text()
  }

  /**
   * Parse overheard html
   * @param text - Page text
   * @returns    - Game state
   */
  private parse(text: string): GameState | null {
    const [_f, _online, _moon, scrolls, phase] =
      /(?:There are (\d+|very few) champions)(?:.*The moon is (?:a |in its )?([\w\s]+))(?:.*Rumor has it that ([\w\s,]+) scrolls are (\w+))?/.exec(
        text,
      ) ?? []
    const online = _online !== 'very few' ? parseInt(_online ?? NaN, 10) : 0
    const moon = _moon?.replace(/\s/g, '_') as MoonPhase

    // Check regex matched
    if (typeof _f !== 'string') {
      this.emit('error', new Error(`failed parse, invalid content "${text}"!`))
      return null
    }
    // Check online
    if (isNaN(online)) {
      this.emit('error', new Error(`failed parse, invalid online: "${online}"!`))
      return null
    }
    // Check moon phase
    if (typeof moon !== 'string' || !(moon?.toUpperCase() in OVERHEARD_MOON_STATES)) {
      this.emit('error', new Error(`failed parse, unknown moon phase: "${moon}"!`))
      return null
    }
    // Check scroll phase
    if (typeof phase === 'string' && !(phase?.toUpperCase() in OVERHEARD_ORB_STATES)) {
      this.emit('error', new Error(`failed parse, unknown scroll phase: "${phase}"!`))
      return null
    }

    return {
      moon,
      online,
      scrolls: (scrolls?.split(/,?\s(?:and\s)?/g) ?? [])
        .map((name): ScrollState | null => {
          // Check scroll name
          if (!Object.values(OVERHEARD_SCHOOL_NAMES).includes(name as SchoolName)) {
            this.emit('error', new Error(`failed parse, unknown scroll name: "${name}"!`))
            return null
          }
          return {
            name: name as SchoolName,
            phase: phase as OrbPhase,
          }
        })
        .filter((s): s is ScrollState => s !== null),
    }
  }

  /**
   * Diff cache & emit events
   * @param state - New state
   */
  private diff(state: GameState): void {
    if (state.moon !== this._cache.moon) {
      this._cache.moon = state.moon
      this.emit('moon', this._cache.moon)
    }
    if (state.online !== this._cache.online) {
      this._cache.online = state.online
      this.emit('online', this._cache.online)
    }
    const scrolls = this.scrolls().reduce((acc: ScrollState[], cur: ScrollState): ScrollState[] => {
      const newScroll = state.scrolls.find((s) => s.name === cur.name)
      if (typeof newScroll !== 'undefined') {
        // Set scroll glowing / dark
        if (newScroll.phase !== cur.phase) {
          return [...acc, newScroll]
        }
      } else if (cur.phase === 'dark' || cur.phase === 'glowing') {
        // Set scroll normal
        return [...acc, { ...cur, phase: 'normal' }]
      }
      return acc
    }, [])
    if (scrolls.length > 0) {
      scrolls.forEach(({ name, phase }) => {
        this._cache.scrolls[name] = phase
      })
      this.emit('scrolls', scrolls)
    }
  }

  /**
   * Emit event
   * @param name
   * @param arg
   * @returns
   */
  emit<T extends keyof OverheardEvent>(name: T, arg: OverheardEvent[T]): boolean {
    return super.emit(name, arg)
  }

  /**
   * Add event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  on<T extends keyof OverheardEvent>(name: T, listener: (arg: OverheardEvent[T]) => void): this {
    return super.on(name, listener)
  }

  /**
   * Add single use event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  once<T extends keyof OverheardEvent>(name: T, listener: (arg: OverheardEvent[T]) => void): this {
    return super.once(name, listener)
  }

  /**
   * Remove event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  removeListener<T extends keyof OverheardEvent>(name: T, listener: (arg: any) => void): this {
    return super.removeListener(name, listener)
  }

  /**
   * Get online members
   * @returns
   */
  online(): number {
    return this._cache.online ?? 0
  }

  /**
   * Get moon phase
   * @returns
   */
  moon(): MoonPhase | undefined {
    return this._cache.moon
  }

  /**
   * Get scroll's states
   * @returns
   */
  scrolls(): ScrollState[] {
    return (Object.entries(this._cache.scrolls) as Array<[SchoolName, OrbPhase]>).map(
      ([name, phase]) => ({ name, phase }),
    )
  }

  /** Scraper loop */
  next(): void {
    this.fetch(OVERHEARD_URL)
      .then((html) => this.parse(html))
      .then((state) => {
        if (state !== null) {
          this.diff(state)
        }
      })
      .finally(() => {
        if (!isNaN(this._opts?.time ?? NaN)) {
          this.timeout = setTimeout(() => {
            this.next()
          }, this._opts.time)
        } else {
          this.emit('done', undefined)
        }
      })
      .catch((err) => {
        if (err instanceof Error) {
          console.error(err.message)
        }
      })
  }

  /** Stop scraper */
  stop(): void {
    this._opts.time = NaN
    clearTimeout(this.timeout)
  }

  /** Start scraper */
  start(): this {
    this.next()
    return this
  }
}
