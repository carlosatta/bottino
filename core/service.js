const q = require('q')
const _ = require('lodash')

const Config = require('./config/')
const tcpPortUsed = require('tcp-port-used');
const EventEmitter = require('events');

let client = {
  running: false,
  instance: null,
}

let base = {
  exist: false,

  healt: {
    current: false,
    prev: null
  },

  event: new EventEmitter(),
  check: baseHealtCheck,
  baseStart: baseStart,

  instance: null
}

class Service {

  constructor (config) {
    this.services = []
    this.config = new Config(config)
    this.prepare()
  }

  prepare () {
    let self = this
    base.check(this.config)    
    base.event.on('update', (status,prev_status) => {
      console.debug('Base is connected:', status)
      
      if (status === true && status !== prev_status && prev_status !== null) {
        console.log('Connected')
      }

      if (status === false && status !== prev_status && prev_status !== null) {
        console.warn('Base disconnected')
      }

      if(status === false) {
        console.debug('No base found. Try to raise myself to base.')      
        base.baseStart(this.config)
        
      }      
    })

    client.instance = require('seneca')({log: 'test'})
  }

  add (scope, cb) {
    this.services.push(scope)
    client.instance
      .add(scope, (request, respond) => {
        let args = argumentDecode(request.args);
        
        q.resolve(cb.apply(null, args))
          .then((response) => {
            response = argumentEncode(response)
            respond(null, response)  
          })
          .catch((error) => {
            respond(error, null)  
          })
     })
     .use('mesh', {pin: scope})
  }

  act (scope, ...args) {
    if (client.running === false) {
      console.debug('Client is not ready yet.')
      client.instance
        .client(this.config.network)
        .ready(function () {
          client.running = true
          console.debug('Client started.')
        })
    }

    let cb = null  
    if (args.length) {
      if (typeof args[args.length-1] === 'function') {
        cb = args.pop()
      }
    }

    let deferred = q.defer()
    client.instance
      .ready(function () {
        client.instance.act(`${scope}`, argumentEncode(args), (error, response) => {
          let args = argumentDecode(response.args)
          
          if (cb) {
            args = [].concat(error, args)
            return cb.apply(null, args)             
          }
          
          if(error) {
            deferred.reject(error)
          }
          deferred.resolve.apply(q, args)
        })
      })
    
    if (cb === null) return deferred.promise
  }
}

module.exports = Service

function baseHealtCheck (config) {
  let method =  base.healt.current ? 'waitUntilFreeOnHost' : 'waitUntilUsedOnHost'

  tcpPortUsed[method](config.network.port, config.network.host, config.healt.retry, config.healt.timeout)
    .then(() => {        
      if (method === 'waitUntilUsedOnHost') base.healt.current = true
      if (method === 'waitUntilFreeOnHost') base.healt.current = false
    })
    .catch(() => {
    })
    .done(() => {
      if (base.healt.current !== base.healt.prev) {
        base.exist = base.healt.current
        base.event.emit('update', base.healt.current, base.healt.prev)
      }
      base.healt.prev = base.healt.current      
      baseHealtCheck(config)
    })    
}

function baseStart (config) {
  if(base.exist === true) return

  base.instance = require('seneca')({log: 'test'})

  base.instance
    .listen(config.network)
    .use('mesh', {
      isbase: true
    })
    .ready(() => {
      console.log('Base ready')
    })
}  

function argumentEncode (...args) {
  return {args: args};
}

function argumentDecode (args) {
  return args.pop()
}
