const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1)
}

const password = process.argv[2]


const url = `mongodb+srv://phonebook-admin:${password}@cluster0.odbdijo.mongodb.net/Phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length == 3)
{
  Contact
    .find({})
    .then(result => {
      console.log("phonebook:");

      result.forEach(contact => {
        console.log(`${contact.name} ${contact.number}`);
      })

      mongoose.connection.close();
    })
}
else if (process.argv.length == 5)
{
  const name = process.argv[3]
  const number = process.argv[4]

  const contact = new Contact({
    name: name,
    number: number,
  });

  contact.save().then(result => {
    const msg = `added ${result.name} number ${result.number} to phonebook`
    console.log(msg);
    mongoose.connection.close();
  });
};
