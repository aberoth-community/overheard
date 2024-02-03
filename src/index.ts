#!/usr/bin/env node

import { Overheard } from './Overheard'

// Main
if (require.main === module) {
  Overheard.fromCLI()
    .then(([overheard, opts]) => {
      if (!opts.quiet) {
        overheard
          .on('moon', (state) => {
            console.log(`moon: ${state}`)
          })
          .on('online', (count) => {
            console.log(`online: ${count}`)
          })
          .on('scrolls', (scrolls) => {
            console.log(scrolls.map(({ name, phase }) => `scroll: ${name} ${phase}`).join('\n'))
          })
      }
      return overheard.start()
    })
    .catch((err) => {
      throw err
    })
}

export default Overheard
export * from './Overheard'
export * from './util/variables'
