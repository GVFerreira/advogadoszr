const express = require('express')
router = express.Router()
// const path = require('path')

const mongoose = require('mongoose')
require('../models/Client')
const Client = mongoose.model("clients")
require('../models/Process')
const Process = mongoose.model("processes")

const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const bcrypt = require('bcryptjs')


router.get('/', (req, res) => {
    res.render('admin/index')
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

router.get('/register-client', (req, res) => {
    res.render('admin/register-client')
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
        req.flash('success_msg', 'Cadasrto do cliente feito com sucesso')
        res.redirect('/admin/consult-clients')
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro ao criar: ${err}`)
        res.redirect('/admin')
    })
})

router.get('/consult-clients', (req, res) => {
    Client.find().sort({createdAt: "DESC"}).then((clients) => {
        res.render('admin/consult-clients', { clients: clients })
    }).catch((err) => {
        req.flash('erro_msg', `Ocorreu um erro ao listar os clientes. Erro: ${err}`)
        res.redirect('/admin')
    })
})

router.get('/edit-client/:id', (req, res) => {
    Client.findOne({ _id: req.params.id }).then((client) => {
        res.render('admin/edit-client', { client: client })
    })
})

router.post('/editing-client/:id', (req, res) => {
    Client.findByIdAndUpdate({_id: req.params.id}, req.body).then(() => {
        req.flash('success_msg', 'Cadastro do cliente editado com sucesso')
        res.redirect('/admin/consult-clients')
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro: ${err}`)
        res.render('admin/edit-client')
    })
})

router.get('/delete-client/:id', (req, res) => {
    Client.findByIdAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Cadastro do cliente excluído com sucesso')
        res.redirect('/admin/consult-clients')
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro: ${err}`)
        res.render('admin/consult-clients')
    })
})

router.get('/register-process', (req, res) => {
    Client.find().then((clients) => {
        res.render('admin/register-process', { clients: clients })
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro ao carregar o formulário. Erro: ${err}`)
        res.redirect('/admin/consult-processes')
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
                    const clientName = client.name
                    const subject = `O processo ${req.body.numberProcess} foi atualizado.`
                    const comments = req.body.comments
                    const numberProcess = req.body.numberProcess


                    const transporter = nodemailer.createTransport({
                        host: 'smtp.umbler.com',
                        port: 587,
                        auth: {
                            user,
                            pass
                        },
                    })

                    const handlebarOptions = {
                        viewEngine: {
                          partialsDir: "D:/rzadvogados/views/email",
                          defaultLayout: false,
                        },
                        viewPath: "D:/rzadvogados/views/email",
                      };

                    transporter.use('compile', hbs(handlebarOptions))

                    const mailOptions = {
                        from: `Agência GVF <${user}>`,
                        to: receiver,
                        subject,
                        template: 'template-email',
                        context: {
                            comments,
                            codeProcess,
                            numberProcess,
                            clientName
                        }
                    }

                    transporter.sendMail(mailOptions, (err, info) => {
                        if(err) {
                            console.log(`Error: ${err}`)
                        } else {
                            console.log('Message sent')
                        }
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
                dispatch: req.body.dispatch,
                finished: req.body.finished,
                comments: req.body.comments,
                code: codeProcess
            })

            
            //salvar dados do formulário
            newProcess.save().then(() => {
                req.flash("success_msg", `O processo foi cadastrado com sucesso. Esse é o código de acompanhamento: ${codeProcess}`)
                res.redirect('/admin/consult-processes')
            }).catch((err) => {
                req.flash("error_msg", `Deu um erro aqui: ${err}`)
                res.redirect('/admin')
            })
        })
    }) 
})

router.get('/consult-processes', (req, res) => {
    Process.find().populate("relatedClient").sort({createdAt: "DESC"}).then((processes) => {
        res.render('admin/consult-process', { processes: processes })
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro ao listar os processos. Erro: ${err}`)
    })
})

router.get('/edit-process/:id', (req, res) => {
    Process.findOne({_id: req.params.id}).populate("relatedClient").then((process) => {
        res.render('admin/edit-process', { process: process })
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro carregar o formulário. Erro: ${err}`)
        res.redirect('/admin/consult-processes')
    })
})

router.post('/editing-process/:id', (req, res) => {
    Process.findByIdAndUpdate({_id: req.params.id}, req.body).then(() => {
        req.flash('success_msg', 'Cadastro do processo editado com sucesso')
        res.redirect('/admin/consult-processes')
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro ao salvar a atualização. Erro: ${err}`)
        res.redirect('/admin/consult-processes')
    })
})

router.get('/teste', (req, res) => {
    res.render('email/template-email')
})

module.exports = router