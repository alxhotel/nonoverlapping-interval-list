function checkInterval (t, interval, { from, to, size, data }) {
  if (from != null) t.equals(interval.from, from)
  if (to != null) t.equals(interval.to, to)
  if (size != null) t.equals(interval.size, size)
  if (data != null) t.equals(interval.data, data)
}

module.exports = {
  checkInterval
}
