/*LOADING MODULES AND PACKAGES*/
const express = require('express')
app = express()

const mongoose = require('mongoose')

const moment = require('moment')

const handlebars = require('express-handlebars')
const handle = handlebars.create({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    helpers: {
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY')
        }
    }
})

const nodemailer = require('nodemailer')

const bodyParser = require('body-parser')

const path = require('path')

const admin = require('./routes/admin')

const db = require("./config/db")




/*SETTINGS*/
app.use(express.static(path.join(__dirname, "public")))

//Handlerbars
app.engine('handlebars', handle.engine)
app.set('view engine', 'handlebars')

//Body Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//Mongoose
mongoose.connect("mongodb+srv://gustavo_admin:UPsqha23mljKbA4T@cluster0.bbkeaad.mongodb.net/rzadvogados?retryWrites=true&w=majority").then(() => {
    console.log("MongoDB connected...")
}).catch((err) => {
    console.log(`Erro: ${err}`)
})


/*ROUTES*/
app. get('/', (req, res) => {
    res.render('index')
})

app.use('/admin', admin)

/*SERVER*/
app.listen(8000, () => {
    console.log('Server ON')
})