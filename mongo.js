const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Contact = mongoose.model('Contact', contactSchema)


if (process.argv.length === 3) {
    const password = process.argv[2]
    const url = `mongodb+srv://fullstack:${password}@cluster0.3wxvw4r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    mongoose.set('strictQuery',false)

    mongoose.connect(url)
    console.log('phonebook:')
    Contact.find({}).then(result => {
        result.forEach(contact => {
            console.log(contact.name, contact.number)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length === 5) {
    const password = process.argv[2]
    const name = process.argv[3]
    const number = process.argv[4]
    const url = `mongodb+srv://fullstack:${password}@cluster0.3wxvw4r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    mongoose.set('strictQuery',false)

    mongoose.connect(url)
    const contact = new Contact({
        name: name,
        number: number,
    })

    contact.save().then(result => {
        console.log('contact saved!')
        mongoose.connection.close()
    })

} else {
    console.log('Invalid number of parameters...')
    process.exit(1)
}
