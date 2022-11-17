/*LOADING MODULES AND PACKAGES*/
const express = require('express')
    app = express()
const mongoose = require('mongoose')
    require('./models/Client')
const Client = mongoose.model("clients")
    require('./models/Process')
const Process = mongoose.model("processes")
    require('./models/User')
const User = mongoose.model("users")
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
const session = require("express-session")
const flash = require("connect-flash")
const path = require('path')
const multer  = require('multer')
const admin = require('./routes/admin')
const users = require('./routes/users')
const db = require("./config/db")
const { isAdmin } = require('./helpers/isAdmin')

/*AUTHENTICATION*/
    const passport = require("passport")
    require("./config/auth")(passport)

/*SETTINGS*/
    app.use(express.static(path.join(__dirname, "public")))

    app.use(session({
        secret: "123456",
        resave: true,
        saveUninitialized: true
    }))

    app.use(flash())

    app.use(passport.initialize())
    app.use(passport.session())

//Handlerbars
    app.engine('handlebars', handle.engine)
    app.set('view engine', 'handlebars')

//Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

//Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()
    })

//Mongoose
    mongoose.connect("mongodb+srv://gustavo_admin:UPsqha23mljKbA4T@cluster0.bbkeaad.mongodb.net/rzadvogados?retryWrites=true&w=majority").then(() => {
        console.log("MongoDB connected...")
    }).catch((err) => {
        console.log(`Erro: ${err}`)
    })

/*ROUTES*/
    app.get('/', (req, res) => {
        res.render('index')
    })

    app.post('/consulting-process', (req, res) => {
        Process.findOne({code: req.body.codeInsert}).populate('relatedClient').then((search_result) => {
            Client.find({id: req.body.relatedClient}).then((client) => {
                res.render('view-process', {search_result: search_result, client: client})
            })
        }).catch((err) => {
            req.flash('error_msg', `Ocorreu um erro: ${err}`)
            res.redirect('/')
        })
    })

    app.get('/teste', (req, res) => {
        res.render('view-process')
    })

    app.use('/admin', /*isAdmin,*/ admin)
    app.use('/users', users)

/*SERVER*/
    app.listen(8000, () => {
        console.log('Server ON')
    })
