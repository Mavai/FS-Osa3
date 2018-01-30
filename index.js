const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(bodyParser.json())

morgan.token('type', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :type :status :res[content-length] - :response-time ms'))

app.use(cors())
app.use(express.static('build'))

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Martti Tienari',
    number: '040-123465',
    id: 2
  },
  {
    name: 'Arto Järvinen',
    number: '040-123456',
    id: 3
  },
  {
    name: 'Lea Kutvonen',
    number: '040-123456',
    id: 4
  },
]

app.get('/', (req, res) => {
  res.send('<h1>Puhelinluettelo REST API</h1>')
})

app.get('/info', (req, res) => {
  const count = persons.length
  res.send(
    `<p>Puhelinluettelossa on tällä hetkellä ${count} henkilön tiedot</p>
    <p>${new Date()}`
  )
})


app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  person ? res.json(person) : res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name) return res.status(400).json({ error: 'name missing' })
  if (!body.number) return res.status(400).json({ error: 'number missing' })
  if (persons.find(person => person.name === body.name)) return res.status(400).json({ error: 'name must be unique' })

  const person = {
    name: body.name,
    number: body.number,
    id: generatedId(1000)
  }
  
  persons = persons.concat(person)
  res.json(person)
})

const generatedId = (max) => Math.floor(Math.random() * max)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})