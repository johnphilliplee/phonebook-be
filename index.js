const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token("body", function (req) {
    return JSON.stringify(req.body);
});

app.use(
  morgan(':method :url :status - :response-time ms :body', {
    skip: function (req, res) { return req.method !==  'POST'}
  })
)

let data = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get('/', (request, response) => {
    response.json(data)
})

app.get("/api/persons", (request, response) => {
  response.json(data);
});

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id
    const person = data.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
    const person = data.find(person => person.id === id)
    if (person) {
        data = data.filter((person) => person.id !== id);
        response.status(204).end();
    } else {
        response.status(404).end()
    }
});

const generateId = () => {
    const maxId = data.length > 0 ? Math.max(...data.map(person => Number(person.id))) : 0
    return String(maxId + 1)
}

app.post("/api/persons", (request, response) => {
    const id = generateId()
    const body = request.body
    if (!body.name) {
        response.status(400).json({
            error: 'name is required and is missing from request body'
        })
    }

    if (!body.number) {
        response.status(400).json({
        error: "number is required and is missing from request body",
        });
    }

    const existing = data.find(person => person.name === body.name)
    if (existing) {
        response.status(400).json({
          error: "name is already on record",
        });
    }

    const person = {
        id: id,
        name: body.name,
        number: body.number,
    }

    data = data.concat(person)
    response.json(person)
});

app.get("/info", (request, response) => {
    const info = `<p> Phonebook has info for ${data.length} people</p>`
    const date = new Date().toString()
    return response.send(info + `<div>${date}</div>`);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})