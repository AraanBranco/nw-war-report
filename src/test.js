const { parser } = require('./parser')
const { uploadImage } = require('./s3')

const mockImage = [
  {
    attachment: 'https://cdn.discordapp.com/attachments/933486785307238460/972582853986639882/board-nw.png',
    name: 'board-nw.png',
    id: '972582853986639882',
    size: 560444,
    url: 'https://cdn.discordapp.com/attachments/933486785307238460/972582853986639882/board-nw.png',
    proxyURL: 'https://media.discordapp.net/attachments/933486785307238460/972582853986639882/board-nw.png',
    height: 556,
    width: 942
  },
  {
    attachment: 'https://cdn.discordapp.com/attachments/933486785307238460/972582853986639882/board-nw.png',
    name: 'board-nw2.png',
    id: '972582853986639882',
    size: 560444,
    url: 'https://cdn.discordapp.com/attachments/933486785307238460/972582853986639882/board-nw.png',
    proxyURL: 'https://media.discordapp.net/attachments/933486785307238460/972582853986639882/board-nw.png',
    height: 556,
    width: 942
  }
]

const s3Path = 'ww-2022-04-02'

const mock = {
  s3Path,
  listImages: [
    'board-nw.png',
    'board-nw2.png'
  ]
}

const init = async () => {
  // const img = await Promise.all(await mockImage.map(async (i) => await uploadImage(s3Path, i)))
  // console.log(img)
  // const rep = await parser(mock.s3Path, mock.listImages)
  // console.log(rep)
}

init()
