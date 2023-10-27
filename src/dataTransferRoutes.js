'use strict'

const rawBodyParser = require('raw-body')
const { koaBody } = require('koa-body');
const FormData = require('form-data');

const logger = require('./logger')
const axios = require('axios')
const fs = require('fs');
const config = require('./config').getConfig()

console.log(`${config.apiBaseUrl}/service/dhis/consumeDhisDataScheduled`)
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
        console.log(ctx.request.body)
    const reqparams = ctx.request.body
  try {
    if(!reqparams) {
      return utils.logAndSetResponse(ctx, 400, 'params not specified', 'error')
    }

    const options = {
      url: `${config.apiBaseUrl}/service/dhis/consumeDhisDataScheduled`,
      method: 'post',
      data: reqparams
    }
   console.log(options)
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


const processDhisData = router => {
  router.post('/processDhisData', KoaBodyParser(), async (ctx, next) => {
      console.log(ctx.request.body)
  const reqparams = ctx.request.body
try {
  if(!reqparams) {
    return utils.logAndSetResponse(ctx, 400, 'params not specified', 'error')
  }

  const options = {
    url: `${config.apiBaseUrl}/service/dhis/processDhisFileUpload`,
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
      url: `https://1dataconnect.com/service/dhis/runShFile`,
      method: 'post',
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

// const uploadFile = router => {
//     router.post('/uploadFile', koaBody({ multipart: true }), async (ctx, next) => {
//       const { userid, orgid, resource, program } = ctx.request.body;
//       const formData = new FormData();
//       const file = ctx.request.files.file;
  
//       // Read the file and append it to formData
//       try {
//         const fileData = fs.readFileSync(file.filepath);
//         formData.append('file', fileData);
//         formData.append('orgid', orgid);
//         formData.append('userid', userid);
//         formData.append('resource', resource);
//         formData.append('program', program);
  
//         const boundary = formData.getBoundary();
//         const options = {
//           url: 'https://1dataconnect.com/service/dhis/consumeBulkIndicatorData',
//           method: 'post',
//           data: formData,
//           headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
//         };
  
//         try {
//           ctx.status = 200;
//           const response = await axios(options);
//           console.log('Response:', response.data);
//         } catch (err) {
//           console.log(err);
//           logger.error(err.message);
//           ctx.status = 500;
//         }
//       } catch (err) {
//         console.error('Error reading file:', err);
//         ctx.status = 400;
//       }
  
//       await next();
//     });
//   };


const uploadFile = router => {
    router.post('/uploadFile', koaBody({ multipart: true
   }), async (ctx, next) => {
    const { userid, orgid, resource, program } = ctx.request.body;
        const formData = new FormData();
        const file = ctx.request.files.file;
    
    try {
    //   ctx.status = 200
    const fileData = await fs.promises.readFile(file.filepath);
    formData.append('file', fileData, { filename: file.name, contentType: file.type });
    formData.append('orgid', orgid);
    formData.append('userid', userid);
    formData.append('resource', resource);
    formData.append('program', program);

    const boundary = formData.getBoundary();
    const options = {
      url: 'https://1dataconnect.com/service/dhis/consumeBulkIndicatorData',
      method: 'post',
      data: formData,
      headers: { 
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formData.getLengthSync(), // Add Content-Length header for binary data
      },
    };
      await new Promise(resolve => {
        axios(options)
          .then((res) => {
            console.log(resource)
            ctx.status = 200
            resolve()
          })
          .catch(err => {
            console.log('catch')
            logger.error(err.message)
            ctx.status = 500
            resolve()
          })
      }) 
      } catch (e) {
        console.log('outer catch')
      ctx.statusCode = 400
      next()
    }
  })
  }


  exports.transferApiRoutes = router => {
    uploadFhir(router)
    consumeDhisData(router)
    runShFile(router)
    uploadFile(router)
    processDhisData(router)
  }
  