import { $ } from 'bun'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {

  const rawZones = (await $`unbound-control list_local_zones`).text()

  const zones = rawZones.split("\n")
  const transparentZones = zones.filter(z => z.endsWith("transparent"))

  const rawData = (await $`unbound-control list_local_data`).text()
  const data = rawData.split("\n").map(l => l.split("\t"))


  const r = transparentZones.map(z => {

    return `
      ${z}
      ${data.filter(d => d[0].endsWith(z.split(" ")[0])).map(d => d.join("\t")).join("\n")}
    `
  }).join("\n")

  return c.text(r)
})

export default app
