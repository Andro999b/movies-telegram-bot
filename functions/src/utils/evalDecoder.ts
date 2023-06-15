export const EVAL_PARAMS_REG_EXP = /\("(\w+)",\d+,"(\w+)",(\d+),(\d+),\d+\)/

function decodeChar(d: string, e: number, f: number): number {
  const g = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('')
  const h = g.slice(0, e)
  const i = g.slice(0, f)
  let j = d.split('')
    .reverse()
    .reduce((a, b, c) => {
      if (h.indexOf(b) !== -1)
        return a += h.indexOf(b) * (Math.pow(e, c))
      return
    }, 0) || 0
  let k = ''
  while (j > 0) {
    k = i[j % f] + k; j = (j - (j % f)) / f
  }
  return +k || 0
}

function decode(h: string, n: string, t: number, e: number): string {
  let r = ''

  for (let i = 0, len = h.length; i < len; i++) {
    let s = ''

    while (h[i] !== n[e]) {
      s += h[i]
      i++
    }

    for (let j = 0; j < n.length; j++)
      s = s.replace(new RegExp(n[j], 'g'), j.toString())

    r += String.fromCharCode(decodeChar(s, e, 10) - t)
  }

  return r
}


export function evalDecode(code: string, maxRecursion = 1): string {
  let res = code
  for (let i = 0; i < maxRecursion; i++) {
    const matches = res.match(EVAL_PARAMS_REG_EXP)
    if (matches == null) {
      return res
    }

    res = decode(
      matches[1],
      matches[2],
      +matches[3],
      +matches[4]
    )
  }
  return res
}