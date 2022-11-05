export default <T>(arr: T[], len: number): T[][] => {
  const chunks = [], n = arr.length
  let i = 0

  while (i < n) {
    chunks.push(arr.slice(i, i += len))
  }

  return chunks
}