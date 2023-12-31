'use strict'

const mongoose = require('mongoose')

const {
  ALLOWED_CONTENT_TYPES,
  ALLOWED_ENDPOINT_METHODS,
  DEFAULT_ENDPOINT_METHOD,
  MIDDLEWARE_PATH_REGEX
} = require('../../constants')

const draftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: {
        unique: true
      }
    },
    subscriptionid: {
    },
    draft: {
      type: Boolean,
      required: true,
    },
    resourceType: {},
    programType:  {},
    isDhis: {
      type: Boolean,
      required: true,
    },
    channel: {},
    conversion: {},
    description: String,
    endpoint: {
      pattern: {
        type: String,
        match: MIDDLEWARE_PATH_REGEX,
        required: true,
        index: {
          unique: true
        }
      },
      method: {
        type: String,
        enum: ALLOWED_ENDPOINT_METHODS,
        default: DEFAULT_ENDPOINT_METHOD
      }
    },
    transformation: {
      input: {
        type: String,
        enum: ALLOWED_CONTENT_TYPES,
        required: function () {
          return (
            this &&
            this.endpoint &&
            this.endpoint.method &&
            (this.endpoint.method === 'POST' || this.endpoint.method === 'PUT')
          )
        }
      },
      output: {type: String, enum: ALLOWED_CONTENT_TYPES, required: true}
    },
    requests: {
      lookup: [],
      response: []
    },
    constants: {},
    inputMapping: {},
    inputTransforms: {},
    inputValidation: {},
    state: {
      default: {},
      extract: {},
      config: {
        networkErrors: {
          type: String, // This field adds a filter on the returned states by network errors.
          enum: ['include', 'exclude', 'no-filter'],
          default: 'no-filter'
        },
        includeStatuses: [String] // This field adds a filter on the returned states for http statuses. Example values ['*', '201', '4xx']
      }
    }
  },
  {
    minimize: false,
    timestamps: true // set the created_at/updated_at timestamps on the record
  }
)

draftSchema.pre('find', async function (next) {
    var endpoint = this
    console.log(endpoint)
    await DraftModel.find({
      'endpoint.pattern': endpoint.pattern
    }).then(result => {
      if (result.length > 0) {
        const error = new Error(
          `Duplicate error: regex created from endpoint pattern ${endpoint.endpoint.pattern} for matching requests already exists`
        )
        return next(error)
      }
  
      return next()
    })
  })


const DraftModel = mongoose.model('draft', draftSchema)

module.exports = DraftModel