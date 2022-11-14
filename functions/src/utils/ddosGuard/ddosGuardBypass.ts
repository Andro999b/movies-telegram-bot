/* eslint-disable no-console */
import request from 'superagent'
import scp from 'set-cookie-parser'
import fakeMark from './fakeMark.json'

interface Result {
  cookies: {
    object: scp.Cookie[],
    string: string
  },
  headers: {
    'user-agent': string
    referer: string
    cookie: string
  }
}

export const bypass = async (url: string, log?: boolean): Promise<string> => {
  const cookiesOrBody = await getBypassCockies(url, log)
  if (typeof cookiesOrBody == 'string')
    return cookiesOrBody

  const resp = await request.get(url)
    .set(cookiesOrBody.headers)

  return resp.text
}


export const getBypassCockies = async (url: string, log?: boolean): Promise<Result | string> => {
  if (!log)
    log = false

  const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 LibreWolf/100.0.1'

  let resp = await request
    .get(url)
    .set({
      'User-Agent': ua,
      'Accept': 'text/html',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none'
    })
    .ok(() => true)
    .disableTLSCerts()

  if (resp.headers.server !== 'ddos-guard')
    return resp.text
  const ref = `https://${new URL(url).hostname}/`
  const cookie = scp.parse(resp.headers['set-cookie'])

  resp = await request
    .get(url)
    .set({
      'User-Agent': ua,
      'Accept': 'text/html',
      'Cookie': cookieString(cookie)
    })
    .ok(() => true)
    .disableTLSCerts()

  if (resp.status == 200) {
    if (log)
      console.log('[ddos-guard-bypass] Automatically passed challenge 1.')
    return {
      cookies: {
        object: cookie,
        string: cookieString(cookie)
      },
      headers: {
        'user-agent': ua,
        'referer': ref,
        'cookie': cookieString(cookie)
      }
    }
  } else {
    if (log)
      console.log('[ddos-guard-bypass] Did not auto-pass, attempting to manually pass...')
    const scripts = getScripts(resp.text, new URL(url).hostname)
    if (log)
      console.log(`[ddos-guard-bypass] Got ${scripts.length} scripts.`)

    const images = []
    const host = new URL(url).hostname

    for (const a in scripts) {
      const script = scripts[a]
      if (log)
        console.log('[ddos-guard-bypass] Fetching script', script)

      let cs = new URL(script).hostname
      if (cs !== 'ddos-guard.net')
        cs = 'cross-site'
      else
        cs = 'same-site'

      if (typeof cs !== 'string')
        cs = 'cross-site'

      resp = await request
        .get(script)
        .set({
          'User-Agent': ua,
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Referer': ref,
          'Sec-Fetch-Dest': 'script',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': cs
        })

      const img = getImages(resp.text, new URL(url).hostname)
      for (const b in img) {
        images.push(img[b])
      }
    }

    for (const a in images) {
      const image = images[a]
      if (log)
        console.log('[ddos-guard-bypass] Fetching image', image)

      resp = await request
        .get(image)
        .set({
          'User-Agent': ua,
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Referer': ref,
          'Cookie': cookieString(cookie),
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'same-origin'
        })

      const cook = scp.parse(resp.headers['set-cookie'])
      for (const b in cook) {
        cookie.push(cook[b])
      }
    }

    if (log)
      console.log('[ddos-guard-bypass] Sending fake mark request...')

    resp = await request
      .post(`https://${host}/.well-known/ddos-guard/mark/`)
      .send(fakeMark)
      .set({
        'User-Agent': ua,
        'Content-Type': 'text/plain;charset=UTF-8',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': ref,
        'Cookie': cookieString(cookie),
        'DNT': '1',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      })

    return {
      cookies: {
        object: cookie,
        string: cookieString(cookie)
      },
      headers: {
        'user-agent': ua,
        'referer': ref,
        'cookie': cookieString(cookie)
      }
    }
  }
}


function cookieString(cookie: scp.Cookie[]): string {
  let s = ''
  for (const c in cookie) {
    s = `${s} ${cookie[c].name}=${cookie[c].value};`
  }
  s = s.substring(1)
  return s.substring(0, s.length - 1)
}

function getScripts(body: string, host: string): string[] {
  const s = []
  const sp = body.split('loadScript("')
  for (const a in sp) {
    if (a === '0') {
      continue
    }
    let u = sp[a].split('",')[0].split('")')[0]
    if (u.startsWith('/')) u = `https://${host}${u}`
    if (u.split('?')[0] == 'https://ddos-guard.net/.well-known/ddos-guard/check') continue
    s.push(u)
  }
  return s
}

function getImages(body: string, host: string): string[] {
  const s = []
  const sp = body.split('.src = \'')
  for (const a in sp) {
    if (a === '0') {
      continue
    }
    let u = sp[a].split('\';')[0].split('\';}')[0]
    if (u.startsWith('/')) u = `https://${host}${u}`
    s.push(u)
  }
  return s
}
