const express = require('express')
const cors = require('cors')
const Sse = require('json-sse')
const bodyParser = require('body-parser')
const Sequilize = require('sequelize')

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/postgres'
const db = new Sequilize(databaseUrl)

db
  .sync({ force: true })
  .then(() => console.log('db synced'))

const Message = db.define(
  'message',
  {
    text: Sequilize.STRING,
    user: Sequilize.STRING
  }
)

const Channel = db.define(
  'channel',
  {
    name: Sequilize.STRING
  }
)
// starting message
// we have db now » remove
// const messages = ['hello world']
// create string from JSON » serialize
// const data = JSON.stringify(messages)

Message.belongsTo(Channel)
Channel.hasMany(Message)

const stream = new Sse()

const app = express()

const middleWare = cors()
app.use(middleWare)

const jsonParser = bodyParser.json()
app.use(jsonParser)

// not calling just passing the sse.init function
// keeps the request alive
// with 1 request we can send many responses
app.get('/stream',
  async (request, response) => {
    const channels = await Channel.findAll({ include: [Message] })
    // serialization
    const data = JSON.stringify(channels)
    stream.updateInit(data)
    stream.init(request, response)
  }
)

app.post('/message',
  async (request, response) => {
    const { message, user, channelId } = request.body
    // using db instead og the initial array
    // messages.push(message)
    // first need to create a new record in the db...
    const entity = await Message.create({
      text: message,
      user,
      channelId
    })
    // next line is because of the chat history
    const channels = await Channel.findAll({include: [Message]})
    // stringification
    const data = JSON.stringify(channels)

    stream.updateInit(data)
    // broadcast (send everybody) all the messages with this
    // so use messages instead of message
    // stream.send(message)
    stream.send(data)

    response.send(entity)
  })

  app.post('/channel', 
  async(request, response) => {
    const channel = await Channel.create(request.body)

    const channels = await Channel.findAll({include: [Message]})
    const data = JSON.stringify(channels)

    stream.updateInit(data)
    stream.send(data)

    response.send(channel)
  })

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`listeninportg on port: ${port}`))