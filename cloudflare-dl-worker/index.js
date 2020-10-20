cloudaddEventListener('fetch', event => {
  event.passThroughOnException()
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const paramsString = request.url.indexOf('?')

  if (paramsString  == -1)
    return new Response('Not Found', { status: 404 })

  const params = new URLSearchParams(paramsString)

  if(!params.has('url'))
    return new Response('Not Found', { status: 404 })

  const url = params.get('url')
  const title = params.get('title')

  const proxyRes = await fetch(url)

  return new Response(proxyRes.body,  {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      '"Content-Disposition': `Content-Disposition: attachment;${title ? ' filename="' + title + '"' : ''}`,
      'Content-Type': proxyRes.headers['Content-Type'],
      'Content-Length': proxyRes.headers['Content-Length'],
      'Content-Transfer-Encoding': 'binary'
    }
  })
}
