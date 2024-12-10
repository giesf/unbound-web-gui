import { $ } from 'bun'
import { Hono } from 'hono'
import assert from 'assert'
const app = new Hono()

app.get('/', async (c) => {

  const rawZones = (await $`unbound-control list_local_zones`).text()

  const zones = rawZones.split("\n")
  const transparentZones = zones.filter(z => z.endsWith("transparent"))

  const rawData = (await $`unbound-control list_local_data`).text()
  const data = rawData.split("\n").map(l => l.split("\t"))


  const r = transparentZones.map(z => {

    return `
\t${z}
\t${data.filter(d => d[0].endsWith(z.split(" ")[0])).map(d => d.join("\t")).join("\n\t")}
    `
  }).join("\n")

  return c.html(<>
    <a href="/local_data">+ add</a>
    <pre>{r}</pre>
  </>)
})
app.get('/local_data', async (c) => {


  return c.html(<form method="post" action="/local_data">
    <input name="name" />
    <input name="type" value="A" />
    <input name="host" />
    <button type="submit">Add</button>
  </form>
  )
})
app.post('/local_data', async (c) => {
  const body = await c.req.parseBody()

  assert(typeof body.name == "string")
  assert(typeof body.type == "string")
  assert(typeof body.host == "string")

  const r = (await $`unbound-control local_data ${body.name} ${body.type} ${body.host}`).text()

  return c.html(<>
    <pre>{r}</pre>
    <a href="/">Back</a>
  </>
  )
})

export default app
