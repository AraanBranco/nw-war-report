import AWS from 'aws-sdk'
import fs from 'fs'
import https from 'https'
import { Transform } from 'stream'
import config from '../config.json'

export default class AWSService {
  constructor () {
    this.S3 = new AWS.S3({
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    })
  }

  async init (titleWar) {
    this.createFolders(titleWar)
  }

  async createFolders (titleWar) {
    await fs.promises.mkdir(`./uploads/${titleWar}`, { recursive: true })
  }

  async uploadPrint (titleWar, image) {
    const { name, url } = image
    const key = `${titleWar}/${name}`
    const pathLocal = `./uploads/${key}`

    await this.downloadFile(url, pathLocal)
    await this.uploadFile(pathLocal, key)

    return name
  }

  async downloadFile (url, pathImage) {
    return new Promise((resolve, reject) => {
      https.request(url, function (response) {
        const data = new Transform()

        response.on('data', function (chunk) {
          data.push(chunk)
        })

        response.on('error', (err) => {
          console.log('ERROR: ', err)
          reject(err)
        })

        response.on('end', function () {
          resolve(fs.promises.writeFile(pathImage, data.read(), { flag: 'w+' }))
        })
      }).end()
    })
  }

  async uploadFile (filePath, key) {
    const blob = fs.readFileSync(filePath)

    this.S3.upload({
      Body: blob,
      Bucket: config.BUCKET,
      Key: key
    }, function (err, data) {
      if (err) console.error(err, err.stack)
      console.log(data)
    }).promise()
  }
}
