const express = require('express')
router = express.Router()

const mongoose = require('mongoose')
require('../models/Client')
const Client = mongoose.model("clients")
require('../models/Process')
const Process = mongoose.model("processes")

const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/register-client', (req, res) => {
    res.render('admin/register-client.handlebars')
})

router.post('/registering-client', (req, res) => {
    const newClient = new Client({
        name: req.body.name,
        email: req.body.email,
        tel: req.body.tel,
        country: req.body.country,
        observations: req.body.observations
    })

    newClient.save().then(() => {
        res.redirect('/admin')
    }).catch((err) => {
        res.redirect('/')
    })
})

router.get('/send-mail', (req, res) => {
    res.render('admin/send-mail')
})

router.post('/sending-mail', (req, res) => {
    const user = 'contato@gvfwebdesign.com.br'
    const pass = 'Contato*8351*'
    
    //sendind data
    const receiver = req.body.receiver
    const subject = req.body.subject
    const message = req.body.message


    const transporter = nodemailer.createTransport({
        host: 'smtp.umbler.com',
        port: 587,
        auth: {
            user,
            pass
        },
    })

    transporter.sendMail({
        from: `Agência GVF <${user}>`,
        to: receiver,
        subject,
        text: message,

    }).then((info) => {
        res.send(info)
    }).catch((err) => {
        res.send(`Ocorreu o seguinte erro: ${err}`)
    })
})

router.get('/register-process', (req, res) => {
    Client.find().then((clients) => {
        res.render('admin/register-process', {clients: clients})
    }).catch((err) => {

    })
})

router.post('/registering-process', (req, res) => {
    bcrypt.genSalt(10, (error, salt) => {
        let code = ''
        bcrypt.hash(code, salt, (error, hash) => {
            let codeProcess = ''
            code = hash
            codeProcess = code.substring(40, 45).replace(/[^A-Z a-z 0-9]/g, "X").toUpperCase()

            //verificar o switch e enviar o e-mail de acordo com o status
            if(req.body.sendNotification === "on") {
                Client.findOne({_id: req.body.relatedClient}).then((client) => {
                    const user = 'contato@gvfwebdesign.com.br'
                    const pass = 'Contato*8351*'
                    
                    //sendind data
                    const receiver = client.email
                    const subject = `Houve uma atualização no status do seu processo. Código: ${codeProcess}`
                    const comments = req.body.comments


                    const transporter = nodemailer.createTransport({
                        host: 'smtp.umbler.com',
                        port: 587,
                        auth: {
                            user,
                            pass
                        },
                    })

                    transporter.sendMail({
                        from: `Agência GVF <${user}>`,
                        to: receiver,
                        subject,
                        text: `
                            Houve um comentário em seu processo, confira abaixo:
                            ${comments}
                            Seu código para acompanhar no portal é: ${codeProcess}
                        `,

                    })
                })
                
            }


            const newProcess = new Process({
                relatedClient: req.body.relatedClient,
                numberProcess: req.body.numberProcess,
                process: req.body.process,
                received: req.body.received,
                registered: req.body.registered,
                waitingQueries: req.body.waitingQueries,
                checkingDocs: req.body.checkingDocs,
                orderAnalysis: req.body.orderAnalysis,
                dispatch: req.bodydispatch,
                finished: req.body.finished,
                comments: req.body.comments,
                sendNotification: req.body.sendNotification,
                code: codeProcess,
            })

            
            //salvar dados do formulário
            newProcess.save().then(() => {
                req.flash("success_msg", `O processo foi cadastrado com sucesso. Esse é o código de acompanhamento: ${codeProcess}`)
                res.redirect('/admin')
            }).catch((err) => {
                req.flash("error_msg", `Deu um erro aqui: ${err}`)
                res.redirect('/')
            })
        })
    }) 
})

router.get('/consult-process', (req, res) => {
    Process.find().populate("relatedClient").sort({createdAt: "DESC"}).then((processes) => {
        res.render('admin/consult-process', {processes: processes})
    })
})

module.exports = router