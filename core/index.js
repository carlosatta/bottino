const _ = require('lodash')
const fs = require('fs');

const logger = require('./lib/logger')
const Bottino = require('./bottino');

let config = fs.existsSync(`${__dirname}/config.json`) ? require('./config.json') : {}
const bottino = new Bottino(config)

module.exports = bottino