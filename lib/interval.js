class Interval {
  constructor (from, to, data) {
    if (typeof from !== 'number' || typeof to !== 'number') {
      throw new Error('from and to must be a number')
    }
    if (from > to) throw new Error('from must be lower than to')

    this._from = from
    this._to = to
    this._data = data
  }

  get from () {
    return this._from
  }

  get to () {
    return this._to
  }

  get data () {
    return this._data
  }

  get size () {
    return (this._to - this._from) + 1
  }

  set from (from) {
    if (typeof from !== 'number') throw new Error('from must be a number')
    if (from > this.to) throw new Error('from must be lower than to')
    this._from = from
  }

  set to (to) {
    if (typeof to !== 'number') throw new Error('to must be a number')
    if (this.from > to) throw new Error('from must be lower than to')
    this._to = to
  }

  set data (data) {
    this._data = data
  }
}

module.exports = Interval
