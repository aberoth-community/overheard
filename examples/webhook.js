import Overheard from '../dist'

const { WEBHOOK_URL } = process.env

/**
 * Send Discord webhook
 * @param {string} title
 * @param {string} description
 * @returns {Promise<void>}
 */
const send = async (title, description) => {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    body: {
      content: 'Example Discord Embed.',
      embed: {
        title,
        description,
        timestamp: new Date().toString(),
        color: 6486117,
      },
    },
  })
  if (!res.ok) {
    throw new Error(`[${res.status}] ${res.statusText}`)
  }
}

// Main
;(() => {
  const overheard = new Overheard().start()
  overheard.addEventListener('error', (event) => {
    console.error(event.error)
  })
  overheard.addEventListener('realm', async (event) => {
    await send(`Hello Title! ${event.name} ${event.phase}`, 'Embed Description')
  })
})()
