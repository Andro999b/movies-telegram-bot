export default function (input: string): string {
  if (input.indexOf('.') == -1) {
    input = input.substring(1)
    let s2 = ''
    for (let i = 0; i < input.length; i += 3) {
      s2 += '%u0' + input.slice(i, i + 3)
    }
    input = decodeURI(s2)
  }
  return input
}