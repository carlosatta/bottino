const q = require('q')
const CoinMarketCap = require('node-coinmarketcap')


module.exports = (config) => {

  const coinmarketcap = new CoinMarketCap(config)

  return {
    get: (symbol) => {
      let deferred = q.defer()
      coinmarketcap.multi(coins => {       
        deferred.resolve(coins.get(symbol))
      })
      return deferred.promise
    },

    getTop: (limit, skip) => {
      let deferred = q.defer()
      coinmarketcap.multi(coins => {
        let number = limit + (skip || 0)
        let list = coins.getTop(number)
        if (skip && skip > 0) {
          list = list.slice(skip)
        }
        deferred.resolve(list)
      })
      return deferred.promise
    },

    on: (symbol, cb) => {
      coinmarketcap.on(symbol, cb)
    }
  }
}
