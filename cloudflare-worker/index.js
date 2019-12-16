addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const parts = request.url.split('?')

  if(parts.length == 1)
    return new Response('Not Found', { status: 404 })

  const proxyUrl = decodeURIComponent(parts[1])

  const res = await fetch(proxyUrl)

  return new Response(res.body, { 
    ...res,
    headers: { 
      ...res.headers,
      'Access-Control-Allow-Origin': '*'
    } 
  })
}
