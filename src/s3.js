const fs = require('fs')
const https = require('https')
const Stream = require('stream').Transform
const AWS = require('aws-sdk')
const config = require('../config.json')

export const uploadImage = async (pathImageLocal, objectImage) => {
  const { url, name } = objectImage
  const pathImage = `./uploads/${pathImageLocal}/${name}`
  const pathS3 = `${pathImageLocal}/${name}`

  await checkFolders(pathImageLocal)
  await getImage(url, pathImage)
  await uploadToS3(pathImage, pathS3)

  return name
}

const getImage = async (url, pathImage) => {
  return new Promise((resolve, reject) => {
    https.request(url, function (response) {
      const data = new Stream()

      response.on('data', function (chunk) {
        data.push(chunk)
      })

      response.on('error', (err) => {
        reject(err)
      })

      response.on('end', function () {
        resolve(fs.promises.writeFile(pathImage, data.read(), { flag: 'w+' }))
      })
    }).end()
  })
}

const checkFolders = async (pathImageLocal) => {
  await fs.promises.mkdir(`./uploads/${pathImageLocal}`, { recursive: true })
}

export const uploadToS3 = (filePath, pathS3) => {
  const blob = fs.readFileSync(filePath)
  const S3 = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  })
  const params = {
    Body: blob,
    Bucket: config.BUCKET,
    Key: pathS3
  }

  S3.upload(params, function (err, data) {
    if (err) console.error(err, err.stack)
    console.log(data)
  })
}
