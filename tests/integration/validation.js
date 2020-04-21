'use strict'

const request = require('supertest')
const sleep = require('util').promisify(setTimeout)
const tap = require('tap')

const port = 13003

const {withTestMapperServer} = require('../utils')

tap.test(
  'ValidationMiddleware',
  withTestMapperServer(port, async t => {
    t.test(
      'validateBodyMiddleware should validate lookupRequests and requestBody data',
      async t => {
        const testEndpoint = {
          name: 'Test Endpoint',
          endpoint: {
            pattern: '/validationTest'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          requests: {
            lookup: [
              {
                id: 'checkTestServerUp',
                config: {
                  method: 'get',
                  url: `http://localhost:${port}/uptime`
                }
              }
            ]
          },
          inputValidation: {
            type: 'object',
            properties: {
              lookupRequests: {
                type: 'object',
                properties: {
                  checkTestServerUp: {
                    type: 'object',
                    properties: {
                      milliseconds: {
                        type: 'number'
                      }
                    },
                    required: ['milliseconds']
                  }
                },
                required: ['checkTestServerUp']
              },
              requestBody: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  }
                },
                required: ['name']
              }
            },
            required: ['lookupRequests', 'requestBody']
          }
        }

        await request('http://localhost:13003')
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
        // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
        // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
        await sleep(1000)

        const requestData = {
          name: 'Test'
        }

        await request('http://localhost:13003')
          .post('/validationTest')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(200)

        t.end()
      }
    )
  })
)
