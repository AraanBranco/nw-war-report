import { AnalyzeDocumentCommand, TextractClient } from '@aws-sdk/client-textract'
import textractHelper from 'aws-textract-helper'
import ObjectsToCsv from 'objects-to-csv'
import AWSService from './awsService'
import config from '../config.json'

export default class Parser {
  constructor (titleWar) {
    this.localPath = `./uploads/${titleWar}`
    this.titleWar = titleWar
    this.ALL_RECORDS = []
    this.keyReport = 'report-war.csv'
    this.textractClient = new TextractClient({
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
      },
      region: 'us-east-1'
    })
    this.awsService = new AWSService()
  }

  async analyzeDocs (listImages) {
    await Promise.all(
      listImages.map(async (img) => {
        await this.extractBoard(img)
      })
    )

    // Unify csv
    this.ALL_RECORDS.sort((a, b) => b.score - a.score)
    const csv = new ObjectsToCsv(this.ALL_RECORDS)
    await csv.toDisk(`${this.localPath}/${this.keyReport}`)
    await this.awsService.uploadFile(`${this.localPath}/${this.keyReport}`, `${this.titleWar}/${this.keyReport}`, true)
    return `${this.localPath}/${this.keyReport}`
  }

  async extractBoard (name) {
    const params = {
      Document: {
        S3Object: {
          Bucket: config.BUCKET,
          Name: `${this.titleWar}/${name}`
        }
      },
      FeatureTypes: ['TABLES']
    }
    const title = name.split('.')[0]
    const analyzerDoc = new AnalyzeDocumentCommand(params)
    const response = await this.textractClient.send(analyzerDoc)

    const items = this.formatData(response)
    const csv = new ObjectsToCsv(items)
    await csv.toDisk(`${this.localPath}/${title}.csv`)
  }

  formatData (response) {
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

          struct.push(player)
          this.ALL_RECORDS.push(player)

          // Clear var
          player = {}
        })
      })
      return struct
    } catch (err) {
      console.log('Error: ', err)
    }
  }
}
