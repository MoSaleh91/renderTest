const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log("conntected to DB")
    })
    .catch(error => {
        console.log("Error connecting to DB", error.message)
    })
// if (process.argv.length<3) {
//     console.log('give password as argument')
//     process.exit(1)
// }

// const password = process.argv[2]

const bookSchema = new mongoose.Schema({
    name: String,
    number: String,
})

bookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
  module.exports = mongoose.model('Person', bookSchema)

  
// const Person = mongoose.model('Person', bookSchema)

// if (process.argv.length>3) {
//     const name = new Person({
//         name: process.argv[3],
//         number: process.argv[4],
//     })
//     name.save().then(result => {
//         console.log(`Added ${name.name} with number ${name.number} to phonebook.`)
//         mongoose.connection.close()
//     })
// } else if (process.argv.length === 3){
//     Person.find({}).then(result => {
//         console.log("Phonebook")
//         result.forEach(p => {
//           console.log(p.name, " : ", p.number)
//         })
//         mongoose.connection.close()
//       })
// }