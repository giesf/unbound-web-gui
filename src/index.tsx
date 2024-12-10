import { $ } from 'bun'
import { Hono } from 'hono'
import assert from 'assert'
import { Context } from 'hono/jsx'
import { BlankEnv, BlankInput } from 'hono/types'
import { JSX } from 'hono/jsx/jsx-runtime'
const app = new Hono()

function wrap(a: JSX.Element) {
  return (<html>
    <head>
      <meta charset="utf-8" />
      <title>unbound web gui</title>
      <style dangerouslySetInnerHTML={{
        __html: `
          body{
            background-color: #1e1e20;
            color: rgba(255, 255, 245, .86);
            font-family: monospace;
          }
          a {
              color: rgba(255, 255, 245, .86);
          }
          button {
            background-color: rgba(255, 255, 245, .86);
            border-radius: 0;
            border: 1pt rgba(255, 255, 245, .86) solid;
            color: #1e1e20;
            font-family: monospace;
            cursor: pointer;
          }
          form{
            margin: 0;
            display: inline-block;
          }
          td{
            padding: 0.5rem;
          }
          h2 form{
            margin-left: 1rem;
          }
          summary {
            text-decoration: underline;
            cursor: pointer;
          }
        
        `}}>

      </style>
    </head>
    <body>
      {a}
    </body>
  </html>)
}

app.get('/', async (c) => {

  const rawZones = (await $`unbound-control list_local_zones`).text()

  const zones = rawZones.split("\n")
  const transparentZones = zones.filter(z => z.endsWith("transparent"))

  const rawData = (await $`unbound-control list_local_data`).text()
  const data = rawData.split("\n").map(l => l.split("\t"))


  const r = transparentZones.map(z => {
    const zoneName = z.split(" ")[0]
    const zoneData = data.filter(d => d[0].endsWith(zoneName))
    return <div>
      <h2>{zoneName} <form method="post" action="/local_zone_remove">
        <input type="hidden" name="name" value={zoneName} />
        <button type="submit">x delete</button>
      </form></h2>
      <table>
        <tbody>
          {zoneData.map(d => <tr>
            <td>{d[0]}</td>
            <td>{d[1]}</td>
            <td>{d[3]}</td>
            <td>{d[4]}</td>
            <td><form method="post" action="/local_data_remove">
              <input type="hidden" name="name" value={d[0]} />
              <button type="submit">x delete</button>
            </form></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  });

  return c.html(wrap(<>
    <details>
      <summary>+ add</summary>
      <form method="post" action="/local_data">
        <input name="name" />
        <input name="type" value="A" />
        <input name="host" />
        <button type="submit">Add</button>
      </form>
    </details>
    {r}
  </>))
})

app.post('/local_data', async (c) => {
  const body = await c.req.parseBody()

  assert(typeof body.name == "string")
  assert(typeof body.type == "string")
  assert(typeof body.host == "string")

  await $`unbound-control local_data ${body.name} ${body.type} ${body.host}`

  return c.redirect("/")
})

app.post('/local_data_remove', async (c) => {
  const body = await c.req.parseBody()

  assert(typeof body.name == "string")

  await $`unbound-control local_data_remove ${body.name}`

  return c.redirect("/")
})


app.post('/local_zone_remove', async (c) => {
  const body = await c.req.parseBody()

  assert(typeof body.name == "string")

  await $`unbound-control local_zone_remove ${body.name}`

  return c.redirect("/")
})




export default app
