const test = require('tape')
const { NonOverlappingIntervalList } = require('../')
const { checkInterval } = require('./common')

test('create instance', function (t) {
  t.plan(1)

  const list = new NonOverlappingIntervalList()
  t.assert(list instanceof NonOverlappingIntervalList)
})

test('simple add', function (t) {
  t.plan(1)

  const list = new NonOverlappingIntervalList()

  list.add(0, 1)
  t.equals(list.size(), 1)
})

test('add same interval', function (t) {
  t.plan(2)

  const list = new NonOverlappingIntervalList()

  list.add(0, 1)
  t.equals(list.size(), 1)

  list.add(0, 1)
  t.equals(list.size(), 1)
})

test('add same interval with different data', function (t) {
  t.plan(2)

  const list = new NonOverlappingIntervalList()

  list.add(0, 1, 'a')
  list.add(0, 1, 'b')
  t.equals(list.size(), 1)

  t.equals(list.getList()[0].data, 'b')
})

test('add overlapping compatible intervals', function (t) {
  t.plan(5)

  const list = new NonOverlappingIntervalList()

  list.add(0, 1, 'a')
  list.add(1, 2, 'a')
  t.equals(list.size(), 1)

  checkInterval(t, list.getList()[0], { from: 0, to: 2, size: 3, data: 'a' })
})

test('add overlapping conficting intervals', function (t) {
  t.plan(9)

  const list = new NonOverlappingIntervalList()

  list.add(0, 1, 'a')
  list.add(1, 2, 'b')
  t.equals(list.size(), 2)

  checkInterval(t, list.getList()[0], { from: 0, to: 0, size: 1, data: 'a' })
  checkInterval(t, list.getList()[1], { from: 1, to: 2, size: 2, data: 'b' })
})

test('add overlapping conficting intervals at left edge', function (t) {
  t.plan(10)

  const list = new NonOverlappingIntervalList()

  list.add(0, 4, 'a')
  list.add(5, 8, 'b')
  t.equals(list.size(), 2)

  list.add(5, 6, 'a')
  t.equals(list.size(), 2)

  checkInterval(t, list.getList()[0], { from: 0, to: 6, size: 7, data: 'a' })
  checkInterval(t, list.getList()[1], { from: 7, to: 8, size: 2, data: 'b' })
})

test('add overlapping conficting intervals at right edge', function (t) {
  t.plan(10)

  const list = new NonOverlappingIntervalList()

  list.add(0, 4, 'a')
  list.add(5, 8, 'b')
  t.equals(list.size(), 2)

  list.add(2, 4, 'b')
  t.equals(list.size(), 2)

  checkInterval(t, list.getList()[0], { from: 0, to: 1, size: 2, data: 'a' })
  checkInterval(t, list.getList()[1], { from: 2, to: 8, size: 7, data: 'b' })
})

test('add interval (in empty) and check left merge', function (t) {
  t.plan(10)

  const list = new NonOverlappingIntervalList()

  list.add(0, 4, 'a')
  list.add(10, 16, 'b')
  t.equals(list.size(), 2)

  list.add(5, 8, 'a')
  t.equals(list.size(), 2)

  checkInterval(t, list.getList()[0], { from: 0, to: 8, size: 9, data: 'a' })
  checkInterval(t, list.getList()[1], { from: 10, to: 16, size: 7, data: 'b' })
})

test('add interval (in empty) and check right merge', function (t) {
  t.plan(10)

  const list = new NonOverlappingIntervalList()

  list.add(0, 4, 'a')
  list.add(10, 16, 'b')
  t.equals(list.size(), 2)

  list.add(8, 9, 'b')
  t.equals(list.size(), 2)

  checkInterval(t, list.getList()[0], { from: 0, to: 4, size: 5, data: 'a' })
  checkInterval(t, list.getList()[1], { from: 8, to: 16, size: 9, data: 'b' })
})

test('add interval (in conflicting and compatible) and check merge', function (t) {
  t.plan(8)

  const list = new NonOverlappingIntervalList()

  list.add(0, 1, 'a')
  list.add(2, 5, 'b')
  list.add(6, 8, 'a')
  t.equals(list.size(), 3)

  list.add(3, 5)
  t.equals(list.size(), 4)

  list.add(2, 5)
  t.equals(list.size(), 3)

  list.add(2, 5, 'a')
  t.equals(list.size(), 1)

  checkInterval(t, list.getList()[0], { from: 0, to: 8, size: 9, data: 'a' })
})

test('remove interval', function (t) {
  t.plan(2)

  const list = new NonOverlappingIntervalList()

  list.add(0, 1, 'a')
  list.add(2, 5, 'b')
  list.add(6, 8, 'a')
  t.equals(list.size(), 3)

  list.remove(3, 5)
  t.equals(list.size(), 3)
})

test('remove all intervals', function (t) {
  t.plan(2)

  const list = new NonOverlappingIntervalList()

  list.add(0, 1, 'a')
  list.add(2, 5, 'b')
  list.add(6, 8, 'a')
  t.equals(list.size(), 3)

  list.remove(0, 10)
  t.equals(list.size(), 0)
})
