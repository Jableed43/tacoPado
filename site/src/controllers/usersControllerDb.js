const db = require('../database/models');
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt');

module.exports = {
    // Para mostrar vista de login
    login: (req,res) => {
        res.render('users/login')
    },
    // Para loguear usuario por método POST
    processLogin: (req,res) => {
        let errors = validationResult(req);
        const { email, p1, recordar } = req.body;
        if (!errors.isEmpty()) {
            return res.render('users/login', {
                errores: errors.mapped(),
                data: req.body
            })
        } else {

            db.User.findOne({
                where: {
                    email
                }
            })
            .then((user) => {
                if (user && bcrypt.compareSync(p1.trim(), user.p1)) {
                    req.session.user = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar,
                        rol: user.rol
                    }
                    if (req.body.recordarme) {
                        res.cookie('tacopadoCookie', req.session.user, {maxAge: 1000 * 60 * 60})
                    }
                    return res.redirect('/')
                } else {
                    return res.render('users/login', {
                        errores : errors.mapped()
                        }
                    )
                }
            })
            .catch((error) => {
                res.send(error)
            })
        }
    },
   // Para mostrar vista registro
   register: (req, res, next) => {
    res.render('users/register');
    },
    // Para registrar usuario por método POST
    newUser: (req,res, next) => {
        let errors = validationResult(req);
        // Para validar la imagen
        if (req.fileValidationError) {
            let img = {
                param : "img",
                msj: "Solo se permiten imágenes"
            }
            errors.errors.push(img)
        const  {name, sexo, provincia, email, p1} = req.body
        
        db.User.create({
            name,
            email,
            p1: bcrypt.hashSync(p1, 12),
            avatar: req.file ? req.file.filename : 'default-img.jpg',
            sexo,
            provincia,
            rol: 2
        })
        .then(() => {
            res.redirect('/users')
        })
        .catch((error) => {
            res.send(error)
        })
    } else {
            return res.render('users/register', {
                errores: errors.mapped(),
                old: req.body
            })
    }},
    // 
    profile: (req, res) => {
        res.render('users/profile')
    },
    logout: (req, res) => {
        req.session.destroy();
        if (req.cookies.recordarme) {
            res.cookie('tacopadoCookie', '', { maxAge: -1 })
        }
        res.redirect('/')
    }
}