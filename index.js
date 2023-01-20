const express = require('express')
const cors = require('cors')
var morgan = require('morgan')

const app = express()

app.use(cors())
app.use(express.json())

let skipper = (req, res) => req.method !== 'POST'
let unSkipper = (req, res) => req.method === 'POST'
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body', {
    skip : skipper
}));
app.use(morgan('tiny', {
    skip : unSkipper
}))

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

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    let people = persons.length
    let date = getDate()
    response.send(`<p>Phonebook has info for ${people} people.</p><p>${date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)

    if (person) response.json(person)
    else return response.status(404).json({error:"Person doesn't exist"})
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
    
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    
    const body = request.body
    
    const checkPerson = persons.find(p => p.name === body.name)

    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error : 'Missing Data' 
        })
    } else if (checkPerson){
        return response.status(409).json({
            error : 'Name must be unique'
        })
    }
    
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(body.name),
    }
    
    persons = persons.concat(person)

    response.json(person)

    morgan.token('body',(request, response) =>{
        return JSON.stringify(request.body) })
 
})

const generateId = (name) => {
    let myHash = 0
    name.split('').forEach( letter => myHash += letter.charCodeAt(0))
    return Math.floor(myHash * Math.random())
}

const getDate = () => {
    let date = new Date()
    return (date.toDateString(), date.toTimeString())
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})