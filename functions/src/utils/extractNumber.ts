export const extractIntFromSting = (str: string): number | null => {
  const matches = str.match(/(\d+)/)

  if (!matches) return null

  return parseInt(matches[matches.length - 1])
}