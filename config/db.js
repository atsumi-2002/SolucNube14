require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.URI)
        .then(() => console.log('base de datos conectada'))
        .catch(e => console.error('fallo en la conexion ' + e));

mongoose.Promise = global.Promise;