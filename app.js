/*LOADING MODULES AND PACKAGES*/
const express = require('express')
app = express()

const handlebars = require('express-handlebars')
const handle = handlebars.create({
    defaultLayout: "main",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    /*helpers: {
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY')
        }
    }*/
})

/*SETTINGS*/
app.engine("handlebars", handle.engine)
app.set("view engine", "handlebars")

/*ROUTES*/
app. get('/', (req, res) => {
    res.render('index')
})

/*SERVER*/
app.listen(8000, () => {
    console.log('Server ON')
})