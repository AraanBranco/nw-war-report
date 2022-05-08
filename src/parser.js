import { uploadToS3 } from './s3'
import { AnalyzeDocumentCommand, TextractClient } from '@aws-sdk/client-textract'
import textractHelper from 'aws-textract-helper'
import ObjectsToCsv from 'objects-to-csv'
import config from '../config.json'

const BUCKET = config.BUCKET
const ALL_RECORDS = []

const textractClient = new TextractClient({
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  },
  region: 'us-east-1'
})

const formatData = (response) => {
  try {
    const tables = textractHelper.createTables(response)
    const struct = []
    let player = {}
    const headers = [
      '',
      'rank',
      'avatar',
      'name',
      'score',
      'kills',
      'deaths',
      'assists',
      'healing',
      'damage'
    ]

    tables.forEach((line) => {
      Object.keys(line).forEach((item) => {
        Object.keys(line[item]).forEach((i) => {
          player[headers[i]] = line[item][i].trim()
        })

        if (player.healing === 'o') {
          player.healing = 0
        }

        // Add ally manually
        player.ally = 0

        // Remove Avatar
        delete player.avatar
        struct.push(player)
        ALL_RECORDS.push(player)

        // Clear var
        player = {}
      })
    })
    return struct
  } catch (err) {
    console.log('Error: ', err)
  }
}

const analyzeDoc = async (pathImage, image) => {
  try {
    const params = {
      Document: {
        S3Object: {
          Bucket: BUCKET,
          Name: `${pathImage}/${image}`
        }
      },
      FeatureTypes: ['TABLES']
    }
    const title = image.split('.')[0]
    const analyzerDoc = new AnalyzeDocumentCommand(params)
    const response = await textractClient.send(analyzerDoc)

    // const response = require('./brightwood-2022-01-18/1-response.json')
    const items = formatData(response)
    const csv = new ObjectsToCsv(items)
    await csv.toDisk(`./uploads/${pathImage}/${title}.csv`)
  } catch (err) {
    console.log('Error: ', err)
  }
}

export const parser = async (pathS3, listImages) => {
  const localPath = `./uploads/${pathS3}/report-war.csv`

  // Create csv
  await Promise.all(
    listImages.map(async (img) => {
      await analyzeDoc(pathS3, img)
    })
  )

  // Unify csv
  ALL_RECORDS.sort((a, b) => b.score - a.score)
  const csv = new ObjectsToCsv(ALL_RECORDS)
  await csv.toDisk(`./uploads/${pathS3}/report-war.csv`)
  await uploadToS3(localPath, `${pathS3}/report-war.csv`, true)
  return `./uploads/${pathS3}/report-war.csv`
}
