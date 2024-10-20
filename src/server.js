import { codeController } from './controllers/code'

const server = Bun.serve({
  port: 8080,
  async fetch(req) {
    const { pathname, search } = new URL(req.url)
    const searchParams = Object.fromEntries(
      new URLSearchParams(search).entries(),
    )

    if (pathname === '/code') {
      var result = codeController(searchParams)

      switch (result.status) {
        case 'bad_request': {
          return Response.json(result.data, { status: 400 })
        }
        case 'ok': {
          return new Response(result.data, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
          })
        }
      }
    }

    return Response.json(
      {
        errors: [{ message: 'Not found' }],
      },
      { status: 404 },
    )
  },
})

console.log(`Listening on ${server.url}`)
