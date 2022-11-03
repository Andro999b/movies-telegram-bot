const log = (
  level: 'ERROR' | 'INFO',
  message: string,
  data: Record<string, unknown>
): void => {
  console.error(level, message, data)

  const browser = `${navigator.userAgent}`

  if (process.env.NODE_ENV == 'production') {
    // @ts-ignore
    gtag && gtag('event', 'exception', {
      'description': message,
      'fatal': false
    })

    // @ts-ignore
    fetch(`${window.API_BASE_URL}/log`, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-cache',
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify({
        level,
        message,
        data: { ...data, browser }
      })
    })
  }
}

export default {
  error: (message: string, data: Record<string, unknown>): void =>
    log('ERROR', message, data),
  info: (message: string, data: Record<string, unknown>): void =>
    log('INFO', message, data)
}
