export const uuid = () =>
  "xxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })

export const rangeDiff = (a, b) => {
  const start = Math.min(a, b)
  const end = Math.max(a, b)
  const addNext = (range, next, last) =>
    next > last ? [...range] : addNext([...range, next], next + 1, last)

  return addNext([start], start + 1, end)
}
