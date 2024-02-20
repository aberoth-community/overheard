# @aberoth-community/overheard

> ![CI](https://github.com/aberoth-community/overheard/actions/workflows/ci.yml/badge.svg)

A simple Aberoth ["Overheard"](https://aberoth.com/highscore/overheard.html) scraper library & cli.

## Installation:

1. Initialize your project

```bash
cd {project_dir} && npm init
```

2. Download the latest "\*.tgz" release - _[link](https://github.com/aberoth-community/overheard/releases/latest)_

3. Install the library

| client | ...                                                         |
| ------ | ----------------------------------------------------------- |
| npm    | `npm install ./aberoth-community-overheard-0.0.0.tgz`       |
| pnpm   | `pnpm install ./aberoth-community-overheard-0.0.0.tgz`      |
| yarn   | `yarn install file://aberoth-community-overheard-0.0.0.tgz` |

## Usage:

### Example:

```javascript
import Overheard from '@aberoth-community/overheard'

// === Creating a new instance ===
const overheard = new Overheard(
  // Scraper options
  {
    interval: 10e3,
    headers: {},
  },
  // Scraper cache
  {
    online: 50,
    moon: 'full',
    realms: {
      [Overheard.OVERHEARD_SCHOOLS.yellow]: 'dark',
    },
  },
)

// === Listening for events ===
overheard.addEventListener('error', console.log) // failed parse, invalid content "<html>504</html>"!
overheard.addEventListener('online', console.log) // 100
overheard.addEventListener('moon', console.log) // nearly_full
overheard.addEventListener('realm', console.log) // { name: 'necromancy', phase: 'normal' }
// About to exit...
overheard.addEventListener('exit', () => {
  // ...
})
// Start the scraper
overheard.start()
// Stop the scraper
overheard.stop()

// ========= Getters =========
console.log(
  overheard.getScrolls(), // [{ name, phase }, { name, phase }, ...]
  overheard.getMoon(), // nearly_full
  overheard.getOnline(), // 100
)
```

### Command-line:

```
$ ./overheard --help
Usage: overheard [options]

Options:
  -h, --header [values...]  add request headers.
  -i, --interval <int>      set scan interval.
  -v, --version             output the version number
  --help                    display help for command
```

### Shell-scripting:

> see: [scripts/sqlite.sh](scripts/sqlite.sh), [scripts/popen.py](scripts/popen.py)

```bash
./overheard -i 10s \
  | xargs -I {} bash -c 'command {}'
```
