const q = require('q')
const _ = require('lodash')

var seneca
let emitter = {}

class Bottino {  
  constructor(config) {
    const Config = require('./config/')
    const Service = require('./service')

    this.config = new Config(config)
    this.service = new Service(this.config)    
  }

  provide(...args) {
    this.service.add.apply(this.service, args)    
  }
  
  require(...args) {
    return this.service.act.apply(this.service, args)    
  }

  emitter(type, cb) {
    emitter[type] = cb
    this.seneca.add(type)
  }
  
  on(type, ...args) {
  
    let cb = null
    if (args.length) {
      if (typeof args[args.length-1] === 'function') {
        cb = args.pop()
      }
    }
  
    let self = this
    args = args.concat((...response) => {
      this.seneca.act(type, __argumentEncode(response))
      if (cb === null) {
        cb = new Function
      }
      q.resolve(cb.apply(null, response))
    })
  
    if(emitter[type]) emitter[type].apply(null, args)
  
    
  
  }
}

module.exports = Bottino
