require('dotenv').config()
const express = require('express')
var morgan = require('morgan')

const app = express()


const Contact = require('./models/contact')

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(express.static('dist'))
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

app.get('/api/contacts', (request, response) => {

    Contact.find({}).then(contacts => {
        response.json(contacts)
    })
})

app.get('/info', (request, response) => {
    const currentTime = new Date()
    Contact.find({}).then(contacts => {
        response.send(`
            <p>Phonebook has info for ${contacts.length} people</p>
            <p>${currentTime.toString()}</p>
        `)
    })
})

app.get('/api/contacts/:id', (request, response, next) => {
    Contact.findById(request.params.id).then(contact => {
        if (contact) {
            response.json(contact)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/contacts/:id', (request, response, next) => {
    Contact.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

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

    const contact = new Contact({
        name: body.name,
        number: body.number,
    })

    contact.save().then(savedContact => {
        response.json(savedContact)
    })
})

app.put('/api/contacts/:id', (request, response, next) => {
    const { name, number } = request.body

    Contact.findById(request.params.id)
        .then(contact => {
            if (!contact) {
                return response.status(404).end()
            }

            contact.name = name
            contact.number = number

            return contact.save().then((updatedContact) => {
                response.json(updatedContact)
            })
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
