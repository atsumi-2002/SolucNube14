const mongoose = require('mongoose');

const alumnoSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    birth: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    photoUser: {
        type: String,
        required: true
    },
    photoUserName: {
        type: String,
        required: false
    }
});

const alumnos = mongoose.model('alumno', alumnoSchema);
module.exports = alumnos