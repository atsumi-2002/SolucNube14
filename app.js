const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
//const bodyParser = require('body-parser');
const app = express();
const path = require('path');
require('./config/db');
require('./config/s3');
//llamar a views
const alumnoView = require('./view/contactoView')

//app.use establece lo que la aplicación va utilizar

//establecer motor de plantilla
app.set('view engine', 'ejs');
//establecer carpeta donde estan las vistas
app.set('views', path.join(__dirname, './screens'));
//permitir comunicación con los datos
app.use(express.urlencoded({extended: true}));
//utilizar json en transferencia de datos
app.use(express.json());
app.use(flash());

app.use(session({
    secret: 'my secret key',
    resave: false,
    saveUninitialized: true
    })
);

//poder enviar mensaje
app.use((req, res, next) => {
    //locals: establese una variable solamente del entorno del proyecto, 
    //por lo tanto message solo podra ser mostrado en la vista local
    
    //hacer que req valga res para mostrar el resultado del mensaje en la vista
    res.locals.message = req.session.message;
    //borrar el mensaje para que no se acumule entre más
    delete req.session.message;
    //esperar a los middlewares para luego poder usar las otras funciones
    next();
});

//utilizar urls
app.use('', alumnoView);
app.use(express.static('public'));

app.listen(3000, () => {
    console.log('listen on http://localhost:3000');
})