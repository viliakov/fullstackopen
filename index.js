const express = require('express')
var morgan = require('morgan')

const app = express()
const cors = require('cors')


app.use(cors())
app.use(express.json())
app.use(morgan(function (tokens, request, response) {
    const body = JSON.stringify(request.body)
    return [
        tokens.method(request, response),
        tokens.url(request, response),
        tokens.status(request, response),
        tokens.res(request, response, 'content-length'), '-',
        tokens['response-time'](request, response), 'ms',
        body,
    ].join(' ')
}))

let contacts = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/contacts', (request, response) => {
    response.json(contacts)
})

app.get('/info', (request, response) => {
    const currentTime = new Date()
    response.send(`
        <p>Phonebook has info for ${contacts.length} people</p>
        <p>${currentTime.toString()}</p>
    `)
})

app.get('/api/contacts/:id', (request, response) => {
    const id = request.params.id
    const contact = contacts.find(contact => contact.id === id)
    if (contact) {
        response.json(contact)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/contacts/:id', (request, response) => {
    const id = request.params.id
    contacts = contacts.filter(contact => contact.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const max = 100000
    return String(Math.floor(Math.random() * max));
}

app.post('/api/contacts', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name is required',
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number is required',
        })
    }

    const contactAlreadyExists = contacts.find(contact => contact.name === body.name)

    if (contactAlreadyExists) {
        return response.status(400).json({
            error: 'name must be unique',
        })
    }

    const contact = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    contacts = contacts.concat(contact)

    response.json(contact)
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
