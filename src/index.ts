import { $ } from 'bun'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {

  const zones = await $`unbound-control list_local_zones`
  return c.text(zones.text())
})

export default app
