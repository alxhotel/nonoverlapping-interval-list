const test = require('tape')
const { NonOverlappingIntervalList } = require('../')
// const { checkInterval } = require('./common')

test('big add', function (t) {
  t.plan(2)

  const list = new NonOverlappingIntervalList()

  for (let i = 0; i < 10_000; i++) {
    list.add(i, i, i.toString())
  }
  t.equals(list.size(), 10_000)

  list.add(0, 10_000, 'not_a_number')
  t.equals(list.size(), 1)
})
