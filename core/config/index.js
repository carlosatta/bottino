const _ = require('lodash')
const fs = require('fs');


class Config {
  constructor (config) {
    try {
      config = _.merge({}, require('./config.default'), config)
    } catch (error) {
      config = _.merge({}, config)
    }
    return config
  }
}

module.exports = Config