const express = require('express')
router = express.Router()
const mongoose = require('mongoose')
    require('../models/Client')
const Client = mongoose.model("clients")
    require('../models/Process')
const Process = mongoose.model("processes")
    require('../models/User')
const User = mongoose.model("users")
const nodemailer = require('nodemailer')
const {transporter, handlebarOptions} = require('../helpers/senderMail')
const hbs = require('nodemailer-express-handlebars')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require("path")
const uploadAttach = require('../helpers/uploadAttachments')
const { connect } = require('http2')
require('dotenv').config()

router.get('/', (req, res) => {
    //User.findOne().then((user) => {
        res.render('admin/index', /*{user: user}*/)
    //}).catch((err) => {
        //req.flash('error_msg', `Houve um erro interno ao carregar o usuário: ${err}`)
        //res.redirect('/')
    //})
})

/* ==== EMAIL ==== */
/* ==== EMAIL ==== */
/* ==== EMAIL ==== */
router.get('/send-mail', (req, res) => {
    res.render('admin/send-mail')
})

router.post('/sending-mail', uploadAttach.array('attachments'), (req, res) => { 
    const receiver = req.body.receiver
    const subject = req.body.subject
    const message = req.body.message
    const attachments = req.files

    transporter.use('compile', hbs(handlebarOptions))

    const mailOptions = {
        from: `Zottis Rezende Advogados <${process.env.USER_MAIL}>`,
        to: receiver,
        replyTo: process.env.MAIL_REPLY,
        subject,
        template: 'email-individual',
        attachments,
        context: {
            message
        }
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log(err)
            req.flash('error_msg', `Houve um erro ao enviar este e-mail: ${err}`)
            res.redirect('/admin')
        } else {
            req.flash('success_msg', `Envio feito com sucesso para ${receiver}`)
            res.redirect('/admin')
        }
    })
})

router.get('/send-mass-mail', (req, res) => {
    Process.find().sort({clientName: "ASC"}).then((processes) => {
        res.render('admin/send-mass-mail', {processes})
    })
})

router.post('/sending-mass-mail-by-group', (req, res) => {

    Process.find({process: req.body.process}).then((processes) => {
        if(req.body.process === "0") {
            req.flash('error_msg', `Nenhum tipo de processo foi selecionado`)
            res.redirect('/admin/send-mass-mail')
        } else {
            processes.forEach((processI) => {
                const receiver = processI.clientEmail
                const subject = req.body.subject
                const message = req.body.message
    
                transporter.use('compile', hbs(handlebarOptions))
    
                transporter.sendMail(
                    {
                        from: `Zottis Rezende Advogados <${process.env.USER_MAIL}>`,
                        to: receiver,
                        replyTo: process.env.MAIL_REPLY,
                        subject,
                        template: 'email-individual',
                        text: message,
                        context: {
                            message
                        }
                    }
                )
            })
            
            req.flash('success_msg', 'Todos os e-mails foram disparados com sucesso')
            res.redirect('/admin')
        }
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro: ${err}`)
        res.redirect('/admin')
    })
})

router.post('/sending-mass-mail-by-selection', async (req, res) => {
    try {
        const selectedEmails = req.body.selected
        if(selectedEmails === undefined) {
            req.flash('error_msg', 'Nenhum processo foi selecionado para ser feito o envio do e-mail.')
            res.redirect('/admin/send-mass-mail')
        } else {
            const emailsArray = [].concat(selectedEmails)
            emailsArray.forEach(email => {
                const receiver = email
                const subject = req.body.subject
                const message = req.body.message
        
                transporter.use('compile', hbs(handlebarOptions))
        
                transporter.sendMail(
                    {
                        from: `Zottis Rezende Advogados <${process.env.USER_MAIL}>`,
                        to: receiver,
                        replyTo: process.env.MAIL_REPLY,
                        subject,
                        template: 'email-individual',
                        text: message,
                        context: {
                            message
                        }
                    }
                )
            })
        
            req.flash('success_msg', 'Todos os e-mails foram disparados com sucesso')
            res.redirect('/admin')
        }
    }
    catch(err) {
        console.log(err)
        req.flash('error_msg', 'Ocorreu um erro. Entre em contato com o desenvolvedor do sistema')
        res.redirect('/admin')
    }
    
})

/* ==== USER ==== */
/* ==== USER ==== */
/* ==== USER ==== */
router.get("/register-user", (req, res) => {
    res.render("admin/register-user")
})

router.post("/registering-user", (req, res) => {
    let errors = []

    if(!req.body.name || typeof !req.body.name == undefined || req.body.name == null) {
        errors.push({text: "Nome inválido"})
    }

    if(!req.body.email || typeof !req.body.email == undefined || req.body.email == null) {
        errors.push({text: "E-mail inválido"})
    }

    if(req.body.password.length < 4) {
        errors.push({text: "Senha muito curta"})
    }

    if(req.body.password != req.body.password2) {
        errors.push({text: "As senhas não são iguais"})
    }

    if(errors.length > 0) {
        res.render("admin/register-user", {errors: errors})
    }else {
        User.findOne({email: req.body.email}).then((user) => {
            if(user) {
                req.flash("error_msg", "E-mail já cadastrado")
                res.redirect("/admin/register-user")
            } else{
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                //criptografar senha
                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if(error){
                            req.flash("error_msg", "Houve um erro durante o registro do usuário")
                            res.redirect("/admin")
                        } 

                        newUser.password = hash

                        newUser.save().then(() => {
                            req.flash("success_msg", "Usuário registrado com sucesso")
                            res.redirect("/admin")
                        }).catch(() => {
                            req.flash("error_msg", "Houve um erro ao registrar o seu uusário")
                            res.redirect("/admin")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", `Houve um erro interno: ${err}`)
            res.redirect("admin/consult-users")
        })
    }
})

router.get('/consult-users', (req, res) => {
    User.find().sort({createdAt: 'DESC'}).then((users) => {
        res.render('admin/consult-users', {users: users})
    }).catch((err) => {
        req.flash('error_msg', `Houve um erro ao listar os usuários ${err}`)
        res.redirect('/admin')
    })
})

router.get('/edit-user/:id' ,(req, res) => {
    User.findOne({_id: req.params.id}).then((user) => {
        res.render('admin/edit-user', {user: user})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o usuário a ser editado')
        res.redirect('/admin/consult-users')
    })
})

router.post('/editing-user', (req, res) => {
    User.findOne({_id: req.body.id}).then((user) => {
        user.name = req.body.name
        user.email = req.body.email
        user.password = req.body.password
        user.password2 = req.body.password2
        
        let errors = []

        if(user.password != user.password2) {
            errors.push({text: 'As senhas digitadas não coincidem'})
        }

        if(errors.length > 0) {
            res.render('admin/edit-user', {errors: errors, user: user})
        } else {
            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if(err){
                        req.flash("error_msg", `Houve um erro durante o registro do usuário: ${err}`)
                        res.redirect("/admin")
                    } 
    
                    user.password = hash
    
                    user.save().then(() => {
                        req.flash("success_msg", "Usuário registrado com sucesso")
                        res.redirect('/admin/consult-users')
                    }).catch((err) => {
                        req.flash("error_msg", `Houve um erro ao registrar o seu usuário: ${err}` )
                        res.redirect('/admin')
                    })
                })
            })
        }
  
    }).catch((err) => {
            req.flash('error_msg', `Não foi possível encontrar esse usuário: ${err}` )
            res.redirect('/admin/consult-users')
    })
})

router.get('/delete-user/:id', (req, res) => {
    User.findByIdAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Cadastro do usuário excluído com sucesso')
        res.redirect('/admin/consult-users')
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro: ${err}`)
        res.render('admin/consult-users')
    })
})

/* ==== CLIENT ==== */
/* ==== CLIENT ==== */
/* ==== CLIENT ==== */
router.get('/register-client', (req, res) => {
    res.render('admin/register-client')
})

router.post('/registering-client', (req, res) => {
    let errors = []

    if(!req.body.name || typeof !req.body.name == undefined || req.body.name == null) {
        errors.push({text: "Nome digitado de forma inválida"})
    }

    if(!req.body.email || typeof !req.body.email == undefined || req.body.email == null) {
        errors.push({text: "E-mail digitado de forma inválida"})
    }

    if(!req.body.country || typeof !req.body.country == undefined || req.body.country == null) {
        errors.push({text: "Pais digitado de forma inválida"})
    }

    if(errors.length > 0) {
        res.render("admin/register-client", {errors: errors})
    } else {
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
            req.flash('error_msg', `Ocorreu um erro: ${err}`)
            res.redirect('/admin/consult-clients')
        })
    
    }
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
    let errors = []

    if(!req.body.name || typeof !req.body.name == undefined || req.body.name == null) {
        errors.push({text: "Nome digitado de forma inválida"})
    }

    if(!req.body.email || typeof !req.body.email == undefined || req.body.email == null) {
        errors.push({text: "E-mail digitado de forma inválida"})
    }

    if(!req.body.country || typeof !req.body.country == undefined || req.body.country == null) {
        errors.push({text: "Pais digitado de forma inválida"})
    }

    if(errors.length > 0) {
        res.render("admin/register-client", {errors: errors})
    } else {
        Client.findByIdAndUpdate({_id: req.params.id}, req.body).then(() => {
            req.flash('success_msg', 'Cadastro do cliente editado com sucesso')
            res.redirect('/admin/consult-clients')
        }).catch((err) => {
            req.flash('error_msg', `Ocorreu um erro: ${err}`)
            res.render('admin/edit-client')
        })
    }  
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

/* ==== PROCESS ==== */
/* ==== PROCESS ==== */
/* ==== PROCESS ==== */
router.get('/register-process', (req, res) => {
    Client.find().then((clients) => {
        res.render('admin/register-process', { clients })
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro ao carregar o formulário. Erro: ${err}`)
        res.redirect('/admin/consult-processes')
    })
})

router.post('/registering-process', uploadAttach.array('attachments'), (req, res) => {
    let errors = []

    if(!req.body.relatedClient || typeof !req.body.relatedClient == undefined || req.body.relatedClient == null || req.body.relatedClient == "0") {
        errors.push({text: "Nenhum cliente foi selecionado"})
    }

    if(!req.body.process || typeof !req.body.process == undefined || req.body.process == null || req.body.process == "0") {
        errors.push({text: "Nenhum tipo de processo foi selecionado"})
    }

    if(errors.length > 0) {
        Client.find().then((clients) => {
            const comments = req.body.comments
            const numberProcess = req.body.numberProcess
            res.render('admin/register-process', { clients, errors, comments, numberProcess })
        }).catch((err) => {
            req.flash('error_msg', `Ocorreu um erro ao carregar o formulário. Erro: ${err}`)
            res.redirect('/admin/consult-processes')
        })
    } else {
        bcrypt.genSalt(10, (error, salt) => {
            let code = ''
            bcrypt.hash(code, salt, (error, hash) => {
                let codeProcess = ''
                code = hash
                codeProcess = code.substring(40, 45).replace(/[^A-Z a-z 0-9]/g, "X").toUpperCase()

                //verificar o switch e enviar o e-mail de acordo com o status
                if(req.body.sendNotification === "on") {
                    Client.findOne({_id: req.body.relatedClient}).then((client) => {
                        const receiver = client.email
                        const clientName = client.name
                        const subject = `O processo ${req.body.numberProcess} foi criado.`
                        const comments = req.body.comments
                        const numberProcess = req.body.numberProcess
                        const attachments = req.files

                        transporter.use('compile', hbs(handlebarOptions))

                        const mailOptions = {
                            from: `Zottis Rezende Advogados <${process.env.USER_MAIL}>`,
                            to: receiver,
                            replyTo: process.env.MAIL_REPLY,
                            subject,
                            template: 'template-email',
                            attachments,
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
                                console.log(`Message sent: ${info}`)
                            }
                        })
                    })
                    
                }

                Client.findOne({_id: req.body.relatedClient}).then((client) => {
                    const clientName = client.name
                    const clientEmail = client.email
                    const newProcess = new Process({
                        relatedClient: req.body.relatedClient,
                        clientName,
                        clientEmail,
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
                        monetaryPendency: req.body.monetaryPendency,
                        attachments: req.files,
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
    }
})

router.get('/consult-processes', async (req, res) => {
    const page = req.query.page || 1
    const sort = req.query.sort || "ASC"
    const limit = req.query.limit || 10
    const processesPerPage = limit
    const skip = (page - 1) * processesPerPage

    const totalProcesses = await Process.countDocuments()

    Process.find().populate('relatedClient').sort({clientName: sort}).skip(skip).limit(limit).then((processes) => {
        Process.find().countDocuments().then((totalDocuments) => {
            const totalPages = Math.ceil(totalProcesses / processesPerPage)
            res.render('admin/consult-processes', {processes, limit, sort, page, totalPages, totalDocuments})
        })
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

router.post('/editing-process/:id', uploadAttach.array('attachments'), (req, res) => {
    Process.findOne({_id: req.params.id}).then((process) => {
        process.numberProcess = req.body.numberProcess
        process.received = req.body.received
        process.registered = req.body.registered
        process.waitingQueries = req.body.waitingQueries
        process.checkingDocs = req.body.checkingDocs
        process.orderAnalysis = req.body.orderAnalysis
        process.dispatch = req.body.dispatch
        process.finished = req.body.finished
        process.comments = req.body.comments
        process.monetaryPendency = req.body.monetaryPendency
        process.code = req.body.code
        if(process.attachments.length === 0) {
            process.attachments = req.files
        } else {
            process.attachments = [...process.attachments].concat(req.files)
        }

        //verificar o switch e enviar o e-mail de acordo com o status
        if(req.body.sendNotification === "on") {
            Client.findOne({_id: req.body.relatedClient}).then((client) => {
                const receiver = client.email
                const clientName = client.name
                const subject = `O processo ${req.body.numberProcess} foi atualizado.`
                const comments = req.body.comments
                const numberProcess = req.body.numberProcess
                const codeProcess = req.body.code
                const attachments = req.files

                transporter.use('compile', hbs(handlebarOptions))

                const mailOptions = {
                    from: `Zottis Rezende Advogados <${process.env.USER_MAIL}>`,
                    to: receiver,
                    replyTo: process.env.MAIL_REPLY,
                    subject,
                    template: 'template-email',
                    attachments,
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
                        console.log(`Message sent: ${info}`)
                    }
                })
            })
               
        }
        process.save().then(() => {
            req.flash('success_msg', 'Processo atualizado com sucesso')
            res.redirect('/admin/consult-processes')
        }).catch((err) => {
            req.flash('error_msg', `Ocorreu um erro ao salvar a atualização. Erro: ${err}.`)
            res.redirect('/admin/consult-processes')
        })
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro ao salvar a atualização. Erro: ${err}.`)
        res.redirect('/admin/consult-processes')
    })
})

router.get('/delete-process/:id', (req, res) => {
    Process.findByIdAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Processo excluído com sucesso')
        res.redirect('/admin/consult-processes')
    }).catch((err) => {
        req.flash('error_msg', `Ocorreu um erro: ${err}`)
        res.render('admin/consult-processes')
    })
})

module.exports = router
