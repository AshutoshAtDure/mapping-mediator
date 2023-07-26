'use strict'

const rawBodyParser = require('raw-body')

const logger = require('./logger')
const axios = require('axios')

const {handleServerError} = require('./util')


const KoaBodyParser = () => async (ctx, next) => {
  try {
    const body = await rawBodyParser(ctx.req)

    ctx.request.body = body.toString() ? JSON.parse(body) : {}
    await next()
  } catch (error) {
    const failureMsg = 'Parsing incoming request body failed: '
    ctx.statusCode = 400
    handleServerError(ctx, failureMsg, error, logger)
  }
}

const consumeDhisData = router => {
    router.post('/consumeDhisData', KoaBodyParser(), async (ctx, next) => {
    const reqparams = ctx.request.body
  try {
    if(!reqparams) {
      return utils.logAndSetResponse(ctx, 400, 'params not specified', 'error')
    }

    const options = {
      url: `https://1dataconnect.com/service/dhis/consumeDhisData`,
      method: 'post',
      data: reqparams
    }

    await new Promise(resolve => {
      axios(options)
        .then((res) => {
          ctx.status = 200
          resolve()
        })
        .catch(err => {
          ctx.status = 500
          resolve()
        })
    })

	} catch (e) {
    console.log("error>>>", e)
    }
})
}

const uploadFhir = router => {
    router.post('/uploadFhir', KoaBodyParser(), async (ctx, next) => {
    try {
      ctx.status = 200
      const options = {
        url: `https://1dataconnect.com/service/dhis/uploadUpdatedFhir?sysName=Zimbabwe`,
        method: 'post',
        data: {}
      }
      await new Promise(resolve => {
        axios(options)
          .then((res) => {
            // Return success status
            ctx.status = 200
            resolve()
          })
          .catch(err => {
            logger.error(err.message)
            ctx.status = 500
            resolve()
          })
      }) 
      } catch (e) {
      ctx.statusCode = 400
      next()
    }
  })
  }

  const runShFile = router => {
    router.post('/runShFile', KoaBodyParser(), async (ctx, next) => {

  try {
    
    const options = {
      url: `https://fptraining.duredemos.com/service/api/demoFhir/runShFile`,
      method: 'post',
      headers: {
        Authorization: "Basic YWRtaW46VHJhaW5pbmdAZGhpczI="
      },
      data: {}
    }

    await new Promise(resolve => {
      axios(options)
        .then((res) => {
          ctx.status = 200
          resolve()
        })
        .catch(err => {
          logger.error(err.message)
          ctx.status = 500
          resolve()
        })
    })

	} catch (e) {
        ctx.statusCode = 400
      next()
    }
})
}

  exports.transferApiRoutes = router => {
    uploadFhir(router)
    consumeDhisData(router)
    runShFile(router)
  }
  