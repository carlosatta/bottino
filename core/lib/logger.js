let util = require('util')
let winston = require('winston')
let logger = new winston.Logger()


// Override the built-in console methods with winston hooks
switch((process.env.NODE_ENV || '').toLowerCase()){
  case 'production':
    production = true;
    logger.add(winston.transports.File, {
      filename: __dirname + '/application.log',
      handleExceptions: true,
      exitOnError: false,
      level: 'warn'
    });
    break;
  case 'test':
    // Don't set up the logger overrides
    return;
  default:
    logger.add(winston.transports.Console, {
      colorize: true,
      timestamp: true,
      level: 'info'
    });
    break;
}

function formatArgs(args){
  return [util.format.apply(util.format, Array.prototype.slice.call(args))];
}

console.log = function(){
  logger.info.apply(logger, formatArgs(arguments));
};
console.info = function(){
  logger.info.apply(logger, formatArgs(arguments));
};
console.warn = function(){
  logger.warn.apply(logger, formatArgs(arguments));
};
console.error = function(){
  logger.error.apply(logger, formatArgs(arguments));
};
console.debug = function(){
  logger.debug.apply(logger, formatArgs(arguments));
};