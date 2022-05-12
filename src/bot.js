import AWSService from './awsService'
import Parser from './parser'
import { Client } from 'discord.js'
import config from '../config.json'
import { format } from 'date-fns'

const client = new Client()
const PREFIX = config.PREFIX

const awsService = new AWSService()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (message) => {
  // If message is bot
  if (message.author.bot) return

  // if message not have prefix (command bot)
  if (message.channel.name === config.CHANNEL) {
    if (!message.content.startsWith(PREFIX)) return
    const commandBody = message.content.slice(PREFIX.length)
    const args = commandBody.split(' ')
    const command = args.shift().toLowerCase()

    // Return if command is not exist
    if (!config.COMMANDS.includes(command)) return

    if (command === 'send') {
      const territory = args[0]
      const dateWar = format(new Date(), 'yyyy-MM-dd')
      const titleWar = `${territory}-${dateWar}`

      // prepare

      await awsService.init(titleWar)
      const parser = new Parser(titleWar)
      const images = []
      message.channel.send(`Getting all the prints of the **${territory}** war from **${dateWar}**`)
      // Get all prints
      message.channel.messages.fetch()
        .then(async (messages) => {
          await Promise.all(
            messages.map(async (message) => {
              // Check if exist attachments (image)
              if (!message.author.bot && message.attachments.size > 0) {
                message.react('🔍')

                const attachs = message.attachments.toJSON()
                await Promise.all(await attachs.map(async (att) => images.push(await awsService.uploadPrint(titleWar, att))))
              }
            })
          )
          const report = await parser.analyzeDocs(images)
          message.channel.send({
            content: 'Report of war',
            files: [
              {
                name: `${titleWar}.csv`,
                attachment: report
              }
            ]
          })
        })
    }

    if (command === 'clear') {
      message.channel.messages.fetch()
        .then(async (messages) => {
          await Promise.all(
            messages.map(async (message) => {
              message.delete()
            })
          )
          message.channel.send('Send all prints of war and send command `!send <name-territory-war>` to start analyzing...')
        })
    }
  }
})

client.login(config.DISCORD_TOKEN)
