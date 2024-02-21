# @aberoth-community/overheard

> [![Discord](https://img.shields.io/discord/370780258141601792)](https://discord.gg/kWZJVUjZAe) [![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/aberoth-community/overheard/main.yml?label=tests)](https://github.com/aberoth-community/overheard/actions) [![NPM Version](https://img.shields.io/npm/v/%40aberoth-community%2Foverheard)](https://www.npmjs.com/package/@aberoth-community/overheard) [![GitHubStars](https://img.shields.io/github/stars/aberoth-community/overheard)](https://github.com/aberoth-community/overheard/stargazers)

A simple & portable ["Aberoth Overheard"](https://aberoth.com/highscore/overheard.html) scraper library and cli.

## Installation:

### Npm:

| client | ...                                     |
| ------ | --------------------------------------- |
| npm    | `npm i @aberoth-community/overheard`    |
| pnpm   | `pnpm i @aberoth-community/overheard`   |
| yarn   | `yarn add @aberoth-community/overheard` |

### Executables:

> (See: [Releases](https://github.com/aberoth-community/overheard/releases))

For convenience overheard can also be downloaded as a standalone executable.

## Usage:

### Command-Line:

```bash
$ ./overheard --help
Usage: overheard [options]

Options:
  -h, --header [values...]  add request headers.
  -i, --interval <int>      set scan interval.
  -v, --version             output the version number
  --help                    display help for command
```

### Example:

> (See: [Api-Docs](https://aberoth-community.github.io/overheard), [examples/webhook.js](examples/webhook.js))

```typescript
import Overheard from '@aberoth-community/overheard'

// main
void (async () => {
  const overheard = new Overheard(
    // scraper options
    { headers: {}, interval: 30e3 },
    // scraper cache (optional)
    {
      online: 50,
      moon: 'full',
      realms: {
        [Overheard.OVERHEARD_SCHOOLS.yellow]: 'dark',
      },
    },
  )

  // start the scraper loop
  overheard.start()
  // stop scraper
  overheard.stop()

  // === events ===
  overheard.addEventListener('error', (event) => {
    console.error(event.error)
  })
  overheard.addEventListener('exit', (event) => {
    console.log('exit!')
  })
  overheard.addEventListener('moon', (event) => {
    console.log(`moon: ${event.phase}`)
  })
  overheard.addEventListener('realm', (event) => {
    console.log(`scroll: ${event.name} ${event.phase}`)
  })

  // === getters ===
  console.log(overheard.getRealms()) // [{ name: 'white', school: 'divination', phase: 'dark' }, ...]
  console.log(overheard.getMoon()) // nearly_full
  console.log(overheard.getOnline()) // 100
})()
```
