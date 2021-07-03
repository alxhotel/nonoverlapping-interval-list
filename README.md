# nonoverlapping-interval-list

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
