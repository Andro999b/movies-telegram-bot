addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const index = request.url.indexOf('?')

  if(index == -1)
    return new Response('Not Found', { status: 404 })

  const proxyUrl = decodeURIComponent(request.url.substr(index + 1))

  const res = await fetch(proxyUrl)

  return new Response(res.body, { 
    ...res,
    headers: { 
      ...res.headers,
      'Access-Control-Allow-Origin': '*'
    } 
  })
}
