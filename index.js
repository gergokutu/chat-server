const express = require('express')
const Sse = require('json-sse')
const bodyParser = require('body-parser')

const data = 'hello'
const sse = new Sse(data)


const app = express()

const jsonParser = bodyParser.json()
app.use(jsonParser)

// not calling just passing the sse.init function
// keeps the request alive
// with 1 request we can send many responses
app.get('/stream', sse.init)

app.post('/message', (request, response) => {
  const {message} =request.body
  sse.send(message)
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`listeninportg on port: ${port}`))