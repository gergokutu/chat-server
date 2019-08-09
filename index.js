const express = require('express')
const cors = require('cors')
const Sse = require('json-sse')
const bodyParser = require('body-parser')

const messages = ['hello world']
const sse = new Sse(messages)

const app = express()

const middleWare = cors()
app.use(middleWare)

const jsonParser = bodyParser.json()
app.use(jsonParser)

// not calling just passing the sse.init function
// keeps the request alive
// with 1 request we can send many responses
app.get('/stream', sse.init)

app.post('/message', (request, response) => {
  const {message} =request.body
  messages.push(message)
  
  sse.updateInit(messages)
  sse.send(message)

  response.send()
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`listeninportg on port: ${port}`))