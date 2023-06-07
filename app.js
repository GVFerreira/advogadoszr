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
            return moment(date).format('DD/MM/YYYY hh:mm')
        },
        formatDateWithoutHour: (date) => {
            return moment(date).format('DD/MM/YYYY')
        },
        pagination: (page, totalPages, limit, sort) => {
            let output = '';
  
            for (let i = 1; i <= totalPages; i++) {
                // Marca a página atual como "ativa"
                const pageNUM = parseInt(page)
                const activeClass = i === pageNUM ? 'btn-success' : 'btn-secondary ';

                // Gera o HTML para o link da página
                output += `
                    <a class="btn ${activeClass}" href="/admin/consult-processes?sort=${sort}&limit=${limit}&page=${i}">${i}</a>
                `;
            }

            return output;
        },
        paginationClient: (page, totalPages, limit, sort) => {
            let output = '';
  
            for (let i = 1; i <= totalPages; i++) {
                // Marca a página atual como "ativa"
                const pageNUM = parseInt(page)
                const activeClass = i === pageNUM ? 'btn-success' : 'btn-secondary ';

                // Gera o HTML para o link da página
                output += `
                    <a class="btn ${activeClass}" href="/admin/consult-clients?sort=${sort}&limit=${limit}&page=${i}">${i}</a>
                `;
            }

            return output;
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
require('dotenv').config()
const { isAdmin } = require('./helpers/isAdmin')

/*AUTHENTICATION*/
    const passport = require("passport")
const router = require('./routes/users')
    require("./config/auth")(passport)

/*SETTINGS*/
    app.use(express.static(path.join(__dirname, "public")))

    app.use(session({
        secret: process.env.SESSION_SECRET,
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
    const dbPROD = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bbkeaad.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
    const dbDEV = 'mongodb://127.0.0.1:27017/advogadoszr'
    mongoose.connect(dbPROD).then(() => {
        console.log("MongoDB connected...")
    }).catch((err) => {
        console.log(`Erro: ${err}`)
    })

/*ROUTES*/
    app.get('/', (req, res) => {
        res.render('index')
    })

    app.get('/ts1', (req, res) => {
        res.render('email/email-individual')
    })

    app.get('/ts2', (req, res) => {
        res.render('email/template-email')
    })

    app.post('/consulting-process', (req, res) => {
        if(req.body.codeInsert === undefined || req.body.codeInsert === null || req.body.codeInsert === '') {
            req.flash('error_msg', `Digite um código`)
            res.redirect('/')
        } else {
            Process.findOne({code: req.body.codeInsert}).populate('relatedClient').then((search_result) => {
                Client.find({id: req.body.relatedClient}).then((client) => {
                    res.render('view-process', {search_result: search_result, client: client})
                })
            }).catch((err) => {
                req.flash('error_msg', `Ocorreu um erro: ${err}`)
                res.redirect('/')
            })
        }
    })

    app.get('/download/:filename', (req, res) => {
        res.download(`public/uploads/attachments/${req.params.filename}`)
    })

    app.use('/admin', /*isAdmin,*/ admin)
    app.use('/users', users)

/*SERVER*/
    app.listen(process.env.PORT || 3000, () => {
        console.log('Server ON')
    })
