const Interval = require('./interval')

class NonOverlappingIntervalList {
  constructor (opts = {}) {
    if (opts.equals && typeof opts.equals !== 'function') throw new Error('equals must be a function')

    this._list = []
    this._equals = opts.equals || this._defaultEquals
  }

  /**
  * "from" and "to" are both inclusive
  */
  add (from, to, data = null) {
    if (typeof from !== 'number' || typeof to !== 'number') throw new Error('from and to must be numbers')
    if (from > to) throw new Error('from must be smaller or equal than to')

    // HACK
    const currentInsertion = new NonOverlappingIntervalList()
    currentInsertion._list = [new Interval(from, to, data)]

    // Check if there are conflicting intervals
    while (true) {
      const conflictingIndex = this._findFirstConflictingIndex(from, to, data)
      if (conflictingIndex === null) break

      // Get overlapping zone
      const conflictingInterval = this._list[conflictingIndex]
      const [overlappingFrom, overlappingTo] = this._getOverlappingZone(conflictingInterval, from, to)

      const newIntervals = this._calculateInsertions(conflictingIndex, overlappingFrom, overlappingTo, data)
      this._findAndReplace(conflictingIndex, newIntervals)

      // Try to merge neighbouring intervals
      // a [a] a => merges left and right
      // a [a|b] a => merges left
      // a [b|a] a => merges right
      // a [b|a|b] a => does never merge anything
      // NOTE: newIntervals can only be max 3 intervals and the neighbours have different data
      // than their neighbours. So only ONE of this "_tryMerge"s will actually do some merging
      this._tryMerge(conflictingIndex)
      if (newIntervals.length > 1) {
        this._tryMerge(conflictingIndex + (newIntervals.length - 1))
      }

      currentInsertion.remove(overlappingFrom, overlappingTo)
    }

    // Remove overlappings from current insertion
    const overlappingIndices = this._findOverlappingIndices(from, to)
    for (const i of overlappingIndices) {
      const interval = this._list[i]
      const [overlappingFrom, overlappingTo] = this._getOverlappingZone(interval, from, to)
      currentInsertion.remove(overlappingFrom, overlappingTo)
    }

    // Check if there are more insertions
    for (const interval of currentInsertion.getList()) {
      this._insertToList(interval.from, interval.to, data)
    }
  }

  /**
  * "from" and "to" are both inclusive
  */
  remove (from, to) {
    if (typeof from !== 'number' || typeof to !== 'number') throw new Error('from and to must be numbers')
    if (from > to) throw new Error('from must be smaller or equal than to')

    // Find overlapping intervals
    const indices = this._findOverlappingIndices(from, to)

    let indexOffset = 0
    for (const i of indices) {
      const index = i + indexOffset
      const interval = this._list[index]

      // Check if whole interval is out
      if (from <= interval.from && interval.to <= to) {
        this._list.splice(index, 1)

        indexOffset--
        continue
      }

      const [overlappingFrom, overlappingTo] = this._getOverlappingZone(interval, from, to)

      // No need to try to merge
      const newIntervals = this._calculateRemoval(interval, overlappingFrom, overlappingTo)
      this._findAndReplace(index, newIntervals)

      indexOffset += newIntervals - 1
    }
  }

  getList () {
    return this._list
  }

  size () {
    return this._list.length
  }

  _defaultEquals (a, b) {
    return a === b
  }

  _calculateRemoval (interval, from, to) {
    const res = []
    if (interval.from <= from - 1) {
      const leftNewInterval = new Interval(interval.from, from - 1, interval.data)
      res.push(leftNewInterval)
    }
    if (to + 1 <= interval.to) {
      const rightNewInterval = new Interval(to + 1, interval.to, interval.data)
      res.push(rightNewInterval)
    }
    return res
  }

  _search (from) {
    if (this._list.length === 0) {
      return {
        index: -1,
        interval: null
      }
    }

    let leftIndex = 0
    let leftInterval = this._list[leftIndex]
    let rightIndex = this._list.length - 1
    let rightInterval = this._list[rightIndex]

    let foundIndex = -1
    let foundInterval = null

    if (from < leftInterval.from) {
      // Add it to the left
      foundIndex = leftIndex
    } else if (rightInterval.to < from) {
      // Add it to the right
      foundIndex = rightIndex + 1
    }

    while (foundIndex === -1 && foundInterval === null) {
      if (leftInterval.from <= from && from <= leftInterval.to) {
        // Add it to left interval
        foundIndex = leftIndex
        foundInterval = leftInterval
        break
      } else if (rightInterval.from <= from && from <= rightInterval.to) {
        // Add it to right interval
        foundIndex = rightIndex
        foundInterval = rightInterval
        break
      } else if ((rightIndex - leftIndex) === 1) {
        // Add it between left and right
        foundIndex = rightIndex
        break
      } else {
        // Calculate new indices
        const middleIndex = Math.floor((rightIndex + leftIndex) / 2)
        const middleInterval = this._list[middleIndex]

        if (middleInterval.to < from) {
          leftIndex = middleIndex
          leftInterval = middleInterval
        } else if (from < middleInterval.from) {
          rightIndex = middleIndex
          rightInterval = middleInterval
        } else {
          // Add it in the middle interval
          foundIndex = middleIndex
          foundInterval = middleInterval
          break
        }
      }
    }

    return {
      index: foundIndex,
      interval: foundInterval
    }
  }

  _insertToList (from, to, data = null) {
    const { interval: foundInterval, index: foundIndex } = this._search(from)

    if (foundIndex === -1) {
      // Add to empty list
      this._list.push(new Interval(from, to, data))
    } else if (foundInterval !== null) {
      // TODO: this block does not seem to get executed

      // Split found interval
      const newIntervals = this._calculateInsertions(foundIndex, from, to, data)
      this._findAndReplace(foundIndex, newIntervals)

      // Try merge
      this._tryMerge(foundIndex)
    } else {
      // Add it there
      const newInterval = new Interval(from, to, data)
      this._list.splice(foundIndex, 0, newInterval)

      // Try merge
      this._tryMerge(foundIndex)
    }
  }

  _getOverlappingZone (interval, from, to) {
    const overlappingFrom = Math.max(interval.from, from)
    const overlappingTo = Math.min(interval.to, to)

    return [overlappingFrom, overlappingTo]
  }

  _findOverlappingIndices (from, to) {
    const res = []

    const { index: foundIndex } = this._search(from)
    if (foundIndex === -1) return []

    for (let i = foundIndex; i < this._list.length; i++) {
      const entry = this._list[i]

      // Check if the next entries are out of scope
      if (entry.from > to) break

      // Check overlapping
      if (from <= entry.to && entry.from <= to) {
        res.push(i)
      }
    }

    return res
  }

  _findFirstConflictingIndex (from, to, data) {
    const { index: foundIndex } = this._search(from)
    if (foundIndex === -1) return null

    for (let i = foundIndex; i < this._list.length; i++) {
      const entry = this._list[i]

      // Check overlapping & conflict
      if (!(entry.from > to || entry.to < from) && !this._equals(entry.data, data)) {
        return i
      }
    }

    return null
  }

  _calculateInsertions (conflictingIndex, from, to, data) {
    const conflictingInterval = this._list[conflictingIndex]
    if (!conflictingInterval) return

    const res = []
    if (conflictingInterval.from <= from - 1) {
      const leftNewInterval = new Interval(conflictingInterval.from, from - 1, conflictingInterval.data)
      res.push(leftNewInterval)
    }
    const middleNewInterval = new Interval(from, to, data)
    res.push(middleNewInterval)
    if (to + 1 <= conflictingInterval.to) {
      const rightNewInterval = new Interval(to + 1, conflictingInterval.to, conflictingInterval.data)
      res.push(rightNewInterval)
    }
    return res
  }

  _findAndReplace (index, newIntervals) {
    // Remove previous
    this._list.splice(index, 1)

    // Add list of intervals
    for (let i = 0; i < newIntervals.length; i++) {
      const newInterval = newIntervals[i]
      this._list.splice(index + i, 0, newInterval)
    }
  }

  _tryMerge (index) {
    let interval = this._list[index]
    if (!interval) return

    // Check left side
    const leftInterval = this._list[index - 1]
    if (leftInterval && ((interval.from - leftInterval.to) <= 1) &&
      this._equals(interval.data, leftInterval.data)) {
      const newInterval = new Interval(leftInterval.from, interval.to, interval.data)
      // Remove and replace
      this._list.splice(index - 1, 2, newInterval)

      // Compensate for new interval and index
      index -= 1
      interval = newInterval
    }

    // Check right side
    const rightInterval = this._list[index + 1]
    if (rightInterval && ((rightInterval.from - interval.to) <= 1) &&
      this._equals(interval.data, rightInterval.data)) {
      const newInterval = new Interval(interval.from, rightInterval.to, interval.data)
      // Remove and replace
      this._list.splice(index, 2, newInterval)
    }
  }
}

module.exports = NonOverlappingIntervalList
