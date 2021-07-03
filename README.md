# nonoverlapping-interval-list

[![NPM Version](https://img.shields.io/npm/v/nonoverlapping-interval-list.svg)](https://www.npmjs.com/package/nonoverlapping-interval-list)
[![Build status](https://github.com/alxhotel/nonoverlapping-interval-list/actions/workflows/ci.yml/badge.svg)](https://github.com/alxhotel/nonoverlapping-interval-list/actions/workflows/ci.yml)

Non-overlapping interval list for NodeJS.

## Install

```sh
npm install nonoverlapping-interval-list
```

## Usage

```js

const { NonOverlappingIntervalList } = require('nonoverlapping-interval-list')

const list = new NonOverlappingIntervalList()

list.add(1, 5)

list.remove(2, 3)
```

## License

MIT Copyright (c) [Alex](http://github.com/alxhotel)
