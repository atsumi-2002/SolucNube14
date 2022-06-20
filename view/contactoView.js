const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const upload = require('../helper/file');
const ContactoViewModel = require('../viewModel/contactoViewModel');

//es para poder utilizar put, delete, etc. y no solamente usar post y get
//si no se utiliza esto y se llama a un put o delete, va mostrar error
router.use(methodOverride('_method'));

//poder utilizar delte sin un form y solamente con link
router.use((req, res, next) => {
    //req.query: en la url se va obtener una peticion
    //de esta peticion si es "delete"
    if(req.query._method == 'DELETE') {
        req.method = 'DELETE';
        req.url = req.path;
    }
    next();
});

router.get('/', (req, res) => {
    ContactoViewModel.show(req, res);
});

router.get('/create', (req, res) => {
    res.render('add_contacto');
});

router.post('/create', upload.single("file"), (req, res) => {
    ContactoViewModel.create(req, res);
});

router.get('/edit/:id', (req, res) => {
    ContactoViewModel.edit(req, res);
});

router.put('/edit/:id', upload.single("file"), (req, res) => {
    ContactoViewModel.update(req, res);
});

router.delete('/delete/:id', (req, res) => {
    ContactoViewModel.delete(req, res);
});

router.get('/backup', (req, res) => {
    ContactoViewModel.backup(req, res);
});

module.exports = router;