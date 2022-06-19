require('dotenv').config();

const aws = require('aws-sdk');

aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION
});

console.log('conectado a aws')

module.exports = {aws};