require('dotenv').config()
const express = require("express")
const cors = require("cors")
var morgan = require("morgan")
const app = express()
const Contact = require('./models/contact')

morgan.token('post', function (req, res) { return JSON.stringify(req.body) })

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :response-time :post'))
// app.use(unknownEndpoint)
app.use(errorHandler)


let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get("/info", (req, res, next) => {
  let date = new Date()
  Contact.countDocuments((err, count) => {
    res.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
  })
})

app.get("/api/persons", (req, res) => {
  Contact.find({}).then(contacts => {
    res.json(contacts)
  })
})

app.get("/api/persons/:id", (req, res, next) => {
  Contact.findById(req.params.id)
    .then(contact => {
      if (contact) {
        res.json(contact)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (req, res) => {
  Contact.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body

  const contact = {
    name: body.name,
    number: body.number
  }

  Contact.findByIdAndUpdate(req.params.id, contact, { new: true })
    .then(updatedContact => {
      res.json(updatedContact)
    })
    .catch(error => next(error))
})

const genID = () => {
  const MAX = 1000000
  let newID = Math.floor(Math.random() * MAX)
  while (persons.some(person => person.id === newID)) {
    newID = Math.floor(Math.random() * MAX)
  }
  return newID
}

app.post("/api/persons", (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name or number missing"
    })
  }

  if (persons.some(person => person.name === body.name)) {
    return res.status(400).json({
      error: "name must be unique"
    })
  }


  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  contact.save().then(savedContact => {
    res.json(savedContact)
  })

})
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

