export type OrbName = 'white' | 'black' | 'green' | 'red' | 'purple' | 'yellow' | 'cyan' | 'blue'
export type OrbPhase = 'normal' | 'glowing' | 'dark'
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
export type SchoolName =
  | 'divination'
  | 'evocation'
  | 'enchantment'
  | 'necromancy'
  | 'transmutation'
  | 'conjuration'
  | 'abjuration'
  | 'illusion'

/** Scroll state */
export interface ScrollState {
  name: SchoolName
  phase: OrbPhase
}

/** Parsed game state */
export interface GameState {
  online: number
  moon: MoonPhase
  scrolls: ScrollState[]
}

/** Overheard class events */
export interface OverheardEvent {
  error: Error
  done: undefined
  online: number
  moon: MoonPhase
  scrolls: ScrollState[]
}
