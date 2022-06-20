require("dotenv").config()
const Contacto = require('../model/Contacto');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const BUCKET = process.env.BUCKET;
const backUpFunction = require('../helper/backup');

module.exports = {
    show: function(req, res) {
        //la función exec es un promesa por lo tanto no necesitas de await y async
        //solamente en este caso
        Contacto.find().exec((err, contactos) => {
            //si hay error mostrar mensaje
            if(err) {
                res.json({message: err.message});
            } else { //si no hay error entonces mostrar datos
                res.render('index', {contactos: contactos});
            }
        })
    },     //esta es una manera de acortar funciones
    edit: (req, res) => {
        let id = req.params.id;
        Contacto.findById(id, (err, contacto) => {
            if(err) {
                res.redirect('/');
            } else {
                if(contacto == null) {
                    res.redirect('/');
                } else {
                    res.render('edit_contacto', {contacto: contacto})
                }
            }
        });
    },
    create: async (req, res) => {
        console.log(req.body);
        try {
            const contacto = new Contacto({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                photoUser: req.file.location,
                photoUserName: req.file.originalname
            });
            
            console.log(contacto);

            await contacto.save((err) => {
                if(err) {
                    res.json({ message: err, type: 'Danger'});
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'El contacto a sido registrado correctamente'
                    };
                    res.redirect('/');
                }
            })
        } catch(err) {
            console.log(err);
            res.redirect('/');
        }
    },
    update: async (req, res) => {
        const id = req.params.id;
        let new_img = '';
        let new_filename = '';

        if (req.file) {
            new_img = req.file.location;
            new_filename = req.file.originalname;
            try {
                let params = { Bucket: BUCKET, Key: req.body.photoUserName }
                console.log('params: ' + params)
                await s3.deleteObject(params).promise();
            } catch(err) {
                console.log(err);
            }
        } else {
            new_img = req.body.old_img;
            new_filename = req.body.photoUserName
        }

        const newContacto = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            photoUser: new_img,
            photoUserName: new_filename
        };

        Contacto.findByIdAndUpdate(id, newContacto, (err, result) => {
            if(err) {
                res.json({ message: err.message, type: 'danger' });
            } else {
                req.session.message = { type: 'success', message: 'Los datos del contacto han sido cambiados correctamente'};
                res.redirect('/');
            }
        });
    },
    delete: (req, res) => {
        let id = req.params.id;
        const result = Contacto.findByIdAndDelete(id, async (err, result) => {
            if (result.photoUserName != '') {
                try {
                    await s3.deleteObject({ Bucket: BUCKET, Key: result.photoUserName }).promise();
                } catch (err) {
                    console.log(err);
                }
            }

            if(err) {
                res.json({ message: err.message });
            } else {
                req.params.message = { type: 'success', message: 'Contacto eliminado correctamente'};
                res.redirect('/');
            }
        });
    },
    backup: async (req, res) => {
        try {
            const data = await Contacto.find();
            console.log('ehe1')
            //si los datos estan vacios entonces mostrar mensaje de que no hay cosas que guardar
            if (data == '') {
                req.session.message = { type: 'Danger', message: 'No hay contactos registrados'};
                res.redirect('/');
            } 
            //en caso de si haya entonces realizar las siguientes acciones
            else {
                const result = await backUpFunction.backupData(data);
                res.redirect('/');
                //si se logra subir el resultado botar mensaje satisfactorio
                if (result == true) {
                    console.log('ehe3')
                    req.session.message = { type: 'success', message: 'Se guardaron los datos'};
                } 
                //si sucede un error entonces botar mensaje insatisfactorio
                else {
                    req.session.message = { type: 'Danger', message: 'No se lograron guardar los datos'};
                }
                res.redirect('/');
            }
        } catch (err) {
            console.error(err);
        }
    }
}