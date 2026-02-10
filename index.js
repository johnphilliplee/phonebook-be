require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();


app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

const Person = require("./models/person");

morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status - :response-time ms :body", {
    skip: function (req, res) {
      return req.method !== "POST";
    },
  }),
);

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

app.get("/api/persons", (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).end()
    }    
  })
  .catch(error => next(error))
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
});

const generateId = () => {
  const maxId =
    data.length > 0 ? Math.max(...data.map((person) => Number(person.id))) : 0;
  return String(maxId + 1);
};

app.post("/api/persons", (request, response, next) => {
  const id = generateId();
  const body = request.body;
  if (!body.name) {
    response.status(400).json({
      error: "name is required and is missing from request body",
    });
  }

  if (!body.number) {
    response.status(400).json({
      error: "number is required and is missing from request body",
    });
  }

  const person = new Person({    
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    response.json(savedPerson);
  })
  .catch(error => next(error))
  
});

app.get("/info", (request, response, next) => {    
  Person.find({}).then(results => {
    const info = `<p> Phonebook has info for ${results.length} people</p>`;
    const date = new Date().toString();
    return response.send(info + `<div>${date}</div>`);
  })
  .catch(error => next(error))
});

app.put("/api/persons/:id", (req, res, next) => {
  const { number } = req.body
  Person.findById(req.params.id).then(person => {
    if (!person) {
      return res.status(404).end();
    }

    person.number = number

    return person.save().then(savedPerson => {
      res.json(savedPerson)
    })
  })
  .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({error: error.message})
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
