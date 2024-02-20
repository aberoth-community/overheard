/**
 * @module Overheard
 * @description Aberoth Overheard scraper
 * @author ashnel3
 * @license MIT
 */

import { TypedEventTarget } from 'typescript-event-target'

/** Aberoth realm color */
export type RealmColor = 'white' | 'black' | 'green' | 'red' | 'purple' | 'yellow' | 'cyan' | 'blue'

/** Aberoth realm phase */
export type RealmPhase = 'normal' | 'glowing' | 'dark'

/** Aberoth moon phase */
export type MoonPhase =
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'nearly_full'
  | 'full'
  | 'waning_gibbous'
  | 'third_quarter'
  | 'waning_crescent'
  | 'nearly_new'
  | 'new'

/** Aberoth magic school name */
export type SchoolName =
  | 'divination'
  | 'evocation'
  | 'enchantment'
  | 'necromancy'
  | 'transmutation'
  | 'conjuration'
  | 'abjuration'
  | 'illusion'

/** Aberoth player count */
export type Online = number | 'very_few'

/** Aberoth realm state */
export interface RealmState {
  name: RealmColor
  phase: RealmPhase
  school: SchoolName
}

/** Aberoth game state */
export interface GameState {
  online: Online
  moon: MoonPhase
  realms: Partial<Record<SchoolName, RealmPhase>>
}

/** Overheard configuration */
export type OverheardConfiguration = Partial<{
  /** Request headers */
  headers: Record<string, string>
  /** Scan interval in ms */
  interval: number
}>

/** Overheard event map */
export interface OverheardEventMap {
  error: OverheardErrorEvent
  exit: OverheardExitEvent
  moon: OverheardMoonEvent
  online: OverheardOnlineEvent
  realm: OverheardRealmEvent
}

/**
 * Overheard base event
 * @event
 */
export abstract class OverheardEvent<K extends keyof OverheardEventMap> extends Event {
  readonly target: Overheard

  constructor(overheard: Overheard, eventName: K, init?: EventInit) {
    super(eventName, init)
    this.target = overheard
  }
}

/**
 * Overheard error event
 * @event
 */
export class OverheardErrorEvent extends OverheardEvent<'error'> {
  constructor(
    overheard: Overheard,
    readonly error: Error,
    init?: EventInit,
  ) {
    super(overheard, 'error', init)
  }
}

/**
 * Overheard exit event
 * @event
 * @example
 * ```
 * // Saving & restoring the cache
 * import { readFile, writeFile } from 'fs'
 * const cachePath = 'path'
 * const overheard = new Overheard(
 *   { ... },
 *   JSON.parse(await readFile(cachePath))
 * ).start()
 * overheard.addEventListener('exit', async (event) => {
 *   await writeFile(JSON.stringify(event.cache))
 * })
 * ```
 */
export class OverheardExitEvent extends OverheardEvent<'exit'> {
  constructor(
    overheard: Overheard,
    readonly cache: GameState,
    init?: EventInit,
  ) {
    super(overheard, 'exit', init)
  }
}

/**
 * Overheard moon event
 * @event
 */
export class OverheardMoonEvent extends OverheardEvent<'moon'> {
  constructor(
    overheard: Overheard,
    readonly phase: MoonPhase,
    init?: EventInit,
  ) {
    super(overheard, 'moon', init)
  }
}

/**
 * Overheard online event
 * @event
 */
export class OverheardOnlineEvent extends OverheardEvent<'online'> {
  constructor(
    overheard: Overheard,
    readonly online: Online,
    init?: EventInit,
  ) {
    super(overheard, 'online', init)
  }
}

/**
 * Overheard realm event
 * @event
 */
export class OverheardRealmEvent extends OverheardEvent<'realm'> implements RealmState {
  readonly name: RealmColor

  constructor(
    overheard: Overheard,
    readonly school: SchoolName,
    readonly phase: RealmPhase,
    init?: EventInit,
  ) {
    super(overheard, 'realm', init)
    this.name = Overheard.OVERHEARD_REALMS[school]
  }
}

/** Overheard scraper */
export class Overheard extends TypedEventTarget<OverheardEventMap> {
  /** Moon phases */
  static readonly OVERHEARD_MOONS: MoonPhase[] = [
    'first_quarter',
    'full',
    'nearly_full',
    'nearly_new',
    'new',
    'third_quarter',
    'waning_crescent',
    'waning_gibbous',
    'waxing_crescent',
    'waxing_gibbous',
  ]

  /** Realms by magic school */
  static readonly OVERHEARD_REALMS: Record<SchoolName, RealmColor> = {
    abjuration: 'cyan',
    conjuration: 'yellow',
    divination: 'white',
    enchantment: 'green',
    evocation: 'black',
    illusion: 'blue',
    necromancy: 'red',
    transmutation: 'purple',
  }

  /** Magic schools by realm */
  static readonly OVERHEARD_SCHOOLS: Record<RealmColor, SchoolName> = {
    black: 'evocation',
    blue: 'illusion',
    cyan: 'abjuration',
    green: 'enchantment',
    purple: 'transmutation',
    red: 'necromancy',
    white: 'divination',
    yellow: 'conjuration',
  }

  /** Overheard page url */
  static readonly OVERHEARD_URL = 'https://aberoth.com/highscore/overheard.html'

  /** Overheard version */
  static readonly OVERHEARD_VERSION = '0.0.0'

  /** Overheard configuration */
  config: OverheardConfiguration

  /** Overheard game-state cache */
  cache: GameState

  /** Overheard is running */
  running = false

  /** Overheard running since */
  runningSince?: Date

  /** Overheard next scan timeout */
  timeout?: ReturnType<typeof setTimeout>

  constructor(config: OverheardConfiguration = {}, cache: Partial<GameState> = {}) {
    super()
    this.cache = {
      moon: 'first_quarter',
      online: 'very_few',
      realms: Object.entries(Overheard.OVERHEARD_SCHOOLS).reduce((acc, [school, phase]) => {
        return { ...acc, [school]: phase }
      }, {}),
      ...cache,
    }
    this.config = config
  }

  /**
   * Fetch page text
   * @param url      Overheard page url
   * @param headers  Request headers
   * @returns        Overheard page text
   */
  static async fetch(url: string, headers?: Record<string, string>): Promise<string> {
    const res = await fetch(url, {
      headers,
      method: 'GET',
    })
    if (!res.ok) {
      throw new Error(`[${res.status}] ${res.statusText}`)
    }
    return await res.text()
  }

  /**
   * Parse page text
   * @param text    Overheard page text
   * @returns       Overheard game-state
   */
  static parse(text: string): GameState {
    const match =
      /(?:There are (\d+|very few) champions)(?:.*The moon is (?:a |in its )?([\w\s]+))(?:.*Rumor has it that ([\w\s,]+) scrolls are (\w+))?/.exec(
        text,
      )
    if (match === null) {
      throw new Error('failed to match page text!\n\n' + text)
    }
    return {
      online: !isNaN(parseInt(match[1], 10)) ? parseInt(match[1], 10) : 'very_few',
      moon: match[2].replace(/\s/g, '_') as MoonPhase,
      realms: (match[3]?.split(/,?\s(?:and\s)?/g) ?? []).reduce((acc, school) => {
        return { ...acc, [school]: match[4] }
      }, {}),
    }
  }

  /**
   * Scrape page & reschedule recursive loop
   * @private
   * @internal
   */
  private _next(): void {
    Overheard.fetch(Overheard.OVERHEARD_URL)
      .then((text) => Overheard.parse(text))
      .then(({ moon, online, realms }) => {
        // diff moon
        if (
          this.cache.moon !== moon &&
          !this.dispatchTypedEvent('moon', new OverheardMoonEvent(this, moon))
        ) {
          this.cache.moon = moon
        }
        // diff online
        if (
          this.cache.online !== online &&
          !this.dispatchTypedEvent('online', new OverheardOnlineEvent(this, online))
        ) {
          this.cache.online = online
        }
        // diff realms
        ;(Object.entries(realms) as Array<[SchoolName, RealmPhase]>)
          .filter(([school, phase]) => this.cache.realms?.[school] !== phase)
          .forEach(([school, phase]) => {
            if (this.dispatchTypedEvent('realm', new OverheardRealmEvent(this, school, phase))) {
              this.cache.realms[school] = phase
            }
          })
      })
      .catch((err) => {
        this.dispatchTypedEvent('error', new OverheardErrorEvent(this, err as Error))
      })
      .finally(() => {
        if (this.running && !isNaN(this.config.interval as unknown as number)) {
          // schedule next scan
          this.timeout = setTimeout(() => {
            this._next()
          }, this.config.interval)
        }
      })
  }

  /**
   * Get current moon phase
   * @returns  Moon phase
   */
  getMoon(): MoonPhase | undefined {
    return this.cache.moon
  }

  /**
   * Get current online count
   * @returns  Online count
   */
  getOnline(): Online | undefined {
    return this.cache.online
  }

  /**
   * Get realm states
   * @returns  Realm state array
   */
  getRealms(): RealmState[] {
    return (Object.entries(this.cache.realms ?? {}) as Array<[SchoolName, RealmPhase]>).map(
      ([school, phase]) => ({ name: Overheard.OVERHEARD_REALMS[school], phase, school }),
    )
  }

  /**
   * Start scraper loop
   * @returns  this
   */
  start(): this {
    if (!this.running) {
      this.running = true
      this.runningSince = new Date()
      this._next()
    }
    return this
  }

  /**
   * Stop scraper loop
   * @returns  this
   */
  stop(): this {
    if (!this.dispatchTypedEvent('exit', new OverheardExitEvent(this, this.cache))) {
      this.running = false
      this.runningSince = undefined
      clearTimeout(this.timeout)
    }
    return this
  }
}

export default Overheard
