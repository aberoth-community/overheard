import type { MoonPhase, OrbName, OrbPhase, SchoolName } from 'types'

/** Webpage url */
export const OVERHEARD_URL = 'https://aberoth.com/highscore/overheard.html'

/** Overheard version */
export const OVERHEARD_VERSION = 'v0.0.0'

/** No reports message */
export const OVERHEARD_NO_REPORTS = 'There are no reports of glowing or dark scrolls.'

/** School names by color */
export const OVERHEARD_SCHOOL_NAMES: Record<Uppercase<OrbName>, SchoolName> = {
  BLACK: 'evocation',
  BLUE: 'illusion',
  CYAN: 'abjuration',
  GREEN: 'enchantment',
  PURPLE: 'transmutation',
  RED: 'necromancy',
  WHITE: 'divination',
  YELLOW: 'conjuration',
}

/** Scroll phase enum */
export const OVERHEARD_ORB_STATES: Record<Uppercase<OrbPhase>, number> = {
  DARK: 1,
  GLOWING: 2,
  NORMAL: 0,
}

/** Moon phase enum */
export const OVERHEARD_MOON_STATES: Record<Uppercase<MoonPhase>, number> = {
  NEW: 0,
  WAXING_CRESCENT: 1,
  FIRST_QUARTER: 2,
  WAXING_GIBBOUS: 3,
  NEARLY_FULL: 4,
  FULL: 5,
  WANING_GIBBOUS: 6,
  THIRD_QUARTER: 7,
  WANING_CRESCENT: 8,
  NEARLY_NEW: 9,
}
