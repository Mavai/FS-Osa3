const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(bodyParser.json())

morgan.token('type', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :type :status :res[content-length] - :response-time ms'))

app.use(cors())
app.use(express.static('build'))

app.get('/', (req, res) => {
  res.send('<h1>Puhelinluettelo REST API</h1>')
})

app.get('/info', (req, res) => {
  let count = 0
  Person
    .count({})
    .then(count => {
      res.send(
        `<p>Puhelinluettelossa on tällä hetkellä ${count} henkilön tiedot</p>
        <p>${new Date()}`
      )
    })
    .catch(error => {
      console.log(error)
      res.status(404)
    })
})

app.get('/api/persons', (req, res) => {
  Person
    .find({}, {__v:0})
    .then(persons => res.json(persons.map(Person.format)))
    .catch(error => console.log(error))
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  Person
    .findById(req.params.id)
    .then(Person.format)
    .then(person => res.json(person))
    .catch(error => console.log(error))
})

app.delete('/api/persons/:id', (req, res) => {
  Person
    .findByIdAndRemove(req.params.id)
    .then(person => {
      person ? res.status(204).end() : res.status(404).send({ error: 'person has been removed already' })
    })
    .catch(error => {
      console.log(error);
      res.status(400).send({ error: 'malformed id' })
    })
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name) return res.status(400).json({ error: 'name missing' })
  if (!body.number) return res.status(400).json({ error: 'number missing' })

  Person
    .findOne({ name: body.name })
    .then(personWithSameName => {
      if (personWithSameName) res.status(400).json({ error: 'name already exists' })
      else {
        const person =  new Person({
          name: body.name,
          number: body.number
        })
      
        person
          .save()
          .then(Person.format)
          .then(person => res.json(person))
          .catch(error => console.log(error))
      }
    })
})
      

app.put('/api/persons/:id', (req, res) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person
    .findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedNote => res.json(Person.format(updatedNote)))
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformed id' })
    })
})


const generatedId = (max) => Math.floor(Math.random() * max)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})