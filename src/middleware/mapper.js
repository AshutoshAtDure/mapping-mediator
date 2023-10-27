'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')
const {OPENHIM_TRANSACTION_HEADER} = require('../constants')
const {createOrchestration} = require('../orchestrations')

function deepObjectComparison(firstObj, secondObj) {
  const result = {};

  for (const key in firstObj) {
    const cleanKey = key.replace('requestBody.', ''); // Remove "requestBody" prefix
    if (keyExistsDeep(cleanKey, secondObj)) {
      result[key] = firstObj[key];
    }
  }

  return result;
}

function keyExistsDeep(key, obj) {
  const keys = key.split('.').map(k => k.replace(/\[\d+\]/g, ''));
  let currentObj = obj;

  for (const k of keys) {
    if (Array.isArray(currentObj) && currentObj[0][k] !== undefined) {
      currentObj = currentObj[0][k];
    } else if (currentObj[k] !== undefined) {
      currentObj = currentObj[k];
    } else {
      return false;
    }
  }

  return true;
}

const createMappedObject = ctx => {
  if (
    !ctx.state.metaData.inputMapping ||
    !Object.keys(ctx.state.metaData.inputMapping).length
  ) {
    logger.warn(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No mapping schema supplied`
    )
    ctx.body = ctx.state.allData.lookupRequests
      ? {
          requestBody: ctx.state.allData.requestBody,
          lookupRequests: ctx.state.allData.lookupRequests
        }
      : ctx.state.allData.requestBody
    return
  }

  const dataToBeMapped = ctx.state.allData

  const output = {}
  const mappingStartTimestamp = new Date()
  let inputTransforms = ctx.state.metaData.inputMapping
  // console.log(inputTransforms, ctx.state.allData.requestBody, 'called')
  const filteredObject = deepObjectComparison(inputTransforms, dataToBeMapped.requestBody);
  console.log(filteredObject, 'came', dataToBeMapped)
  try {
    Object.assign(
      output,
      objectMapper(dataToBeMapped, filteredObject)
    )
  } catch (error) {
    logger.error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): Object mapping failed: ${error.message}`
    )
    // Set the status code which will used to set the response status
    ctx.statusCode = 500
    throw Error(`Object mapping schema invalid: ${error.message}`)
  }

  // set the outgoing payload as useable data point
  ctx.state.allData.responseBody = output

  ctx.body = output
  ctx.status = 200

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Successfully mapped output document`
  )

  if (ctx.request.headers && ctx.request.headers[OPENHIM_TRANSACTION_HEADER]) {
    const orchestrationName = `Endpoint Mapping: ${ctx.state.metaData.name}`
    const mappingEndTimestamp = new Date()
    const response = {
      body: output
    }
    const error = null

    if (!ctx.orchestrations) {
      ctx.orchestrations = []
    }

    const orchestration = createOrchestration(
      {data: dataToBeMapped},
      response,
      mappingStartTimestamp,
      mappingEndTimestamp,
      orchestrationName,
      error
    )

    ctx.orchestrations.push(orchestration)
  }
}

exports.mapBodyMiddleware = () => async (ctx, next) => {
  createMappedObject(ctx)
  await next()
}
