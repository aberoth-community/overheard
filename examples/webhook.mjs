#!/usr/bin/env node

import { Overheard } from '../dist'

const { WEBHOOK_URL } = process.env
new Overheard().on('scrolls', (state) => {
  fetch(WEBHOOK_URL, {
    method: 'POST',
    body: {
      content: 'Example Discord embed.',
      embed: {
        title: 'Title',
        description: 'Description',
        timestamp: new Date().toString(),
        color: 6486117,
      },
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`[${res.status}] ${res.statusText}`)
      }
    })
    .catch((err) => {
      console.log(err.message)
    })
})
