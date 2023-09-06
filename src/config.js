'use strict'

const {parseStringToBoolean} = require('./util')

exports.getConfig = function () {
  return Object.freeze({
    port: process.env.SERVER_PORT || 3003,
    logLevel: process.env.LOG_LEVEL || 'info',
    enableLogging: parseStringToBoolean(process.env.ENABLE_LOGGING, true),
    mongoUrl:
      'mongodb://localhost:27017/mapping-mediator',
    openhim: Object.freeze({
      apiURL: 'https://13.95.166.46:8080',
      // apiURL: 'https://127.0.0.1:8080',
      username: 'root@openhim.org',
      password: 'root@duretech',
      // password: 'ashu@dure',
      trustSelfSigned: 
        true
      ,
      register: true,
      urn: 'urn:mediator:generic_mapper'
    }),
    parser: Object.freeze({
      limit: process.env.PARSER_LIMIT || '1mb',
      xmlOptions: {
        trim: parseStringToBoolean(process.env.PARSER_XML_OPTIONS_TRIM, true),
        explicitRoot: parseStringToBoolean(
          process.env.PARSER_XML_OPTIONS_EXPLICIT_ROOT,
          false
        ),
        explicitArray: parseStringToBoolean(
          process.env.PARSER_XML_OPTIONS_EXPLICIT_ARRAY,
          false
        )
      }
    }),
    validation: Object.freeze({
      nullable: parseStringToBoolean(
        process.env.VALIDATION_ACCEPT_NULL_VALUES,
        false
      ),
      coerceTypes:
        parseStringToBoolean(
          process.env.VALIDATION_COERCE_TYPES,
          process.env.VALIDATION_COERCE_TYPES
        ) || false
    }),
    dynamicEndpoints: parseStringToBoolean(process.env.DYNAMIC_ENDPOINTS, true)
  })
}
