import { exec } from 'child_process'

const url = 'http://localhost:3000'
setTimeout(() => {
  exec(`start chrome "${url}"`, (err) => {
    if (err) exec(`start "${url}"`)
  })
}, 3500)
console.log(`Opening ${url} in Chrome...`)
