import { $ } from 'bun'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {

  const rawZones = (await $`unbound-control list_local_zones`).text()

  const zones = rawZones.split("\n")
  const transparentZones = zones.filter(z => z.endsWith("transparent"))

  const rawData = (await $`unbound-control list_local_data`).text()

  return c.text(transparentZones.join("\n") + "\n" + rawData)
})

export default app
