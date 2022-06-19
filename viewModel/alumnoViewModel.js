require("dotenv").config()
const Alumno = require('../model/Alumno');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const BUCKET = process.env.BUCKET;
const backUpFunction = require('../helper/backup');

module.exports = {
    show: function(req, res) {
        //la función exec es un promesa por lo tanto no necesitas de await y async
        //solamente en este caso
        Alumno.find().exec((err, alumnos) => {
            //si hay error mostrar mensaje
            if(err) {
                res.json({message: err.message});
            } else { //si no hay error entonces mostrar datos
                res.render('list_alumno', {alumnos: alumnos});
            }
        })
    },     //esta es una manera de acortar funciones
    detail: (req, res) => {
        //obtener el id
        let id = req.params.id;
        Alumno.findById(id, (err, alumno) => {
            if(err) {
                res.redirect('/alumnos/list');
            } else {
                if(alumno == null) {
                    res.redirect('/alumnos/list');
                } else {
                    res.render('detail_alumno', {alumno: alumno})
                }
            }
        });
    },
    edit: (req, res) => {
        let id = req.params.id;
        Alumno.findById(id, (err, alumno) => {
            if(err) {
                res.redirect('/alumnos/list');
            } else {
                if(alumno == null) {
                    res.redirect('/alumnos/list');
                } else {
                    res.render('edit_alumno', {alumno: alumno})
                }
            }
        });
    },
    create: async (req, res) => {
        console.log(req.body);
        try {
            const alumno = new Alumno({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                birth: req.body.birth,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                description: req.body.description,
                photoUser: req.file.location,
                photoUserName: req.file.originalname
            });
            
            console.log(alumno);

            await alumno.save((err) => {
                if(err) {
                    res.json({ message: err, type: 'Danger'});
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'El alumno a sido registrado correctamente'
                    };
                    res.redirect('/alumnos/list');
                }
            })
        } catch(err) {
            console.log(err);
            res.redirect('/alumnos/list');
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

        const newAlumno = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            birth: req.body.birth,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            description: req.body.description,
            photoUser: new_img,
            photoUserName: new_filename
        };

        Alumno.findByIdAndUpdate(id, newAlumno, (err, result) => {
            if(err) {
                res.json({ message: err.message, type: 'danger' });
            } else {
                req.session.message = { type: 'success', message: 'Los datos del alumno han sido cambiados correctamente'};
                res.redirect('/alumnos/list');
            }
        });
    },
    delete: (req, res) => {
        let id = req.params.id;
        const result = Alumno.findByIdAndDelete(id, async (err, result) => {
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
                req.params.message = { type: 'success', message: 'Alumno eliminado correctamente'};
                res.redirect('/alumnos/list');
            }
        });
    },
    backup: async (req, res) => {
        try {
            const data = await Alumno.find();
            //si los datos estan vacios entonces mostrar mensaje de que no hay cosas que guardar
            if (data == '') {
                req.session.message = { type: 'Danger', message: 'No hay alumnos registrados'};
                res.redirect('/alumnos/list');
            } 
            //en caso de si haya entonces realizar las siguientes acciones
            else {
                const result = await backUpFunction.backupData(data);
                //si se logra subir el resultado botar mensaje satisfactorio
                if (result == true) {
                    req.session.message = { type: 'success', message: 'Se guardaron los datos'};
                } 
                //si sucede un error entonces botar mensaje insatisfactorio
                else {
                    req.session.message = { type: 'Danger', message: 'No se lograron guardar los datos'};
                }
                res.redirect('/alumnos/list');
            }
        } catch (err) {
            console.error(err);
        }
    }
}