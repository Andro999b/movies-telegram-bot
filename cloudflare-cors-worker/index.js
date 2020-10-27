addEventListener('fetch', event => {
  event.passThroughOnException()
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const index = request.url.indexOf('?')

  if (index == -1)
    return new Response('Not Found', { status: 404 })

  const proxyUrl = decodeURIComponent(request.url.substr(index + 1))

  const res = await fetch(proxyUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  })

  return new Response(res.body, {
    ...res,
    headers: {
      ...res.headers,
      'Access-Control-Allow-Origin': '*'
    }
  })
}
