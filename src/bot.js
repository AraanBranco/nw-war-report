const { Client, MessageAttachment } = require('discord.js')
const { uploadImage } = require('./s3')
const config = require('../config.json')
const { format } = require('date-fns')
const { parser } = require('./parser')
const client = new Client()
const PREFIX = config.PREFIX

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (message) => {
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
      const warDate = format(new Date(), 'yyyy-MM-dd')
      const s3Path = `${territory}-${warDate}`
      let report
      let images = []
      message.channel.send(`Getting all the prints of the **${territory}** war from **${warDate}**`)
      message.channel.messages.fetch()
        .then(async (messages) => {
          await Promise.all(
            messages.map(async (message) => {
              if (!message.author.bot && message.attachments.size > 0) {
                message.react('🔍')

                const attachs = message.attachments.toJSON()
                images = await Promise.all(await attachs.map(async (att) => await uploadImage(s3Path, att)))
              }
            })
          )
          report = await parser(s3Path, images)
          message.channel.send({
            content: 'Report of war',
            files: [
              {
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
