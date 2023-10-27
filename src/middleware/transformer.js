'use strict'

const jsonata = require('jsonata')

const logger = require('../logger')
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


const jsonataTransformer = ctx => {
  let inputTransforms = ctx.state.metaData.inputMapping
  // console.log(inputTransforms, ctx.state.allData.requestBody, 'called')
  const filteredObject = deepObjectComparison(inputTransforms, ctx.state.allData.requestBody);
  inputTransforms = filteredObject;
  console.log(inputTransforms)
  if (!inputTransforms || Object.keys(inputTransforms).length === 0) {
    return
  }
  ctx.state.allData.transforms = {}

  Object.keys(inputTransforms).forEach(transformKey => {
    
    const expression = jsonata(inputTransforms[transformKey])
    const result = expression.evaluate(ctx.state.allData.requestBody)
    console.log(result)
    ctx.state.allData.transforms[transformKey] = result
    console.log(ctx.state.allData.transforms)
    
  })
  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Input transforms completed`
  )
}

exports.transformerMiddleware = () => async (ctx, next) => {
  try {
    jsonataTransformer(ctx)
    await next()
  } catch (error) {
    ctx.status = 500
    console.log('this is theer', error)
    const errorMessage = `Input transform error: ${error.message}`
    logger.error(errorMessage)
    throw Error(errorMessage)
  }
}
