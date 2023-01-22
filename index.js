require('dotenv').config()
const express = require('express')
const cors = require('cors')
var morgan = require('morgan')
const Person = require('./models/mongo')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))


let skipper = (req, res) => req.method !== 'POST'
let unSkipper = (req, res) => req.method === 'POST'
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body', {
    skip : skipper
}));
app.use(morgan('tiny', {
    skip : unSkipper
}))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

// app.get('/info', (request, response) => {
//     let people = persons.length
//     let date = getDate()
//     response.send(`<p>Phonebook has info for ${people} people.</p><p>${date}</p>`)
// })

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) response.json(person)
        else return response.status(404).json({error:"Person doesn't exist"})
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    
    const body = request.body

    //const checkPerson = persons.find(p => p.name === body.name)

    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error : 'Missing Data' 
        })
     } //else if (checkPerson){
    //     return response.status(409).json({
    //         error : 'Name must be unique'
    //     })
    // }
    const checkPerson = { name: body.name }
    const person = {
        name: body.name,
        number: body.number
    }

    Person.findOneAndUpdate(checkPerson, person,{ upsert: true, new: true })
        .then(saved => {
        response.json(saved)
    })

    morgan.token('body',(request, response) =>{
        return JSON.stringify(request.body) })
 
})

app.put('/api/persons/:id', (request, response, next) => {

    const body = request.body

    const person = {
        name : body.name,
        number : body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, {new : true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})
// const generateId = (name) => {
//     let myHash = 0
//     name.split('').forEach( letter => myHash += letter.charCodeAt(0))
//     return Math.floor(myHash * Math.random())
// }
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  // handler of requests with unknown endpoint
  app.use(unknownEndpoint)

  
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
  }
  
  // this has to be the last loaded middleware.
app.use(errorHandler)

const getDate = () => {
    let date = new Date()
    return (date.toDateString(), date.toTimeString())
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})