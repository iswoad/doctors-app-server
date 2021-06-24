const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload =  require('express-fileupload');
require('dotenv').config()



const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello doctors and patients")
    console.log('db connected')
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pljh2.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("appointments");
    // perform actions on the collection object
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
        .then( result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        console.log(date.date);
        appointmentCollection.find({ date: date.date})
        .toArray((err , documents) => {
            res.send(documents)
        }) 
    })


    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email= req.body.email;
        console.log(file, name, email);
        file.mv(`${__dirname}/doctors/${file.name}`, err =>{
            if (err) {
                console.log(err);
                return res.status(500).send({msg: 'failed to upload image'})
            }
            return res.send({name: file.name, path: `/${file.name}`})
        })
    })
    
  });

  




app.listen(process.env.PORT || port)