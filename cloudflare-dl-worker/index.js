addEventListener('fetch', event => {
  event.passThroughOnException()
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const paramsIndex = request.url.indexOf('?')

  if (paramsIndex  == -1)
    return new Response('Not Found', { status: 404 })

  const params = new URLSearchParams(request.url.substr(paramsIndex + 1))

  if(!params.has('url'))
    return new Response('Not Found', { status: 404 })

  const url = params.get('url')
  const title = params.get('title')

  const proxyRes = await fetch(url,{
    method: request.method,
    headers: request.headers,
    body: request.body
  })

  return new Response(proxyRes.body,  {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Disposition': `attachment;${title ? ' filename="' + title + '.mp4"' : ''}`,
      'Content-Type': proxyRes.headers['Content-Type'] || 'video/mp4',
      'Content-Length': proxyRes.headers['Content-Length']
    }
  })
}
