require('dotenv').config();
const aws = require('aws-sdk');
const BUCKET = process.env.BUCKET;
const path = require('path');
const fs = require('fs');

const s3 = new aws.S3();
exports.backupData = async (data) => {
    try {
        //almacenar de manera local
        //obtener la data y convertirlo a json
        const jsonData = JSON.stringify(data, null, 2);
        //declarar un nombre al archivo según la fecha actual
        const file = `db-${Date.now()}.json`;
        //la dirección de la carpeta donde se guardara
        const storeFolder = path.join(__dirname, `../backup/${file}`);
        fs.writeFile(storeFolder, jsonData, (err) => {
            if (err) {
                console.error('no se logro guardar los datos');
                console.error(err);
            } else {
                console.log('archivado');
            }
        });
        //almacenar de manera virtual
        const buf = Buffer.from(JSON.stringify(data));

        const params = ({
            Bucket: BUCKET,
            Key: file,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'application/json'
        });

        await s3.upload(params, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                console.log('se subio correctamente');
            }
        }).promise();

        return true;

    } catch (err) {
        console.error(err);
        return false;
    }
}