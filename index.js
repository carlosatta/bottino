const bottino = require('./core/')
module.exports = bottino


const coinmarketcap = require('./service/watcher/coinmarketcap')() 

bottino.provide('watcher:coinmarketcap:get', coinmarketcap.get)
bottino.provide('watcher:coinmarketcap:getTop', coinmarketcap.getTop)
