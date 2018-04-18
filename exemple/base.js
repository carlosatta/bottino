const bottino = require('../')

bottino.require('watcher:coinmarketcap:getTop', 10)
  .then((coins) => {
    console.log(coins)
  })
