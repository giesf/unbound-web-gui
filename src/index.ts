import { $ } from 'bun'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {

  const rawZones = (await $`unbound-control list_local_zones`).text()

  const zones = rawZones.split("\n")
  const transparentZones = zones.filter(z => z.endsWith("transparent"))

  return c.text(transparentZones.join("\n"))
})

export default app
