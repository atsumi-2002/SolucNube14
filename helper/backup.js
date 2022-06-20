require('dotenv').config();
const aws = require('aws-sdk');
const BUCKET = process.env.BUCKET;
const path = require('path');
const fs = require('fs');

const s3 = new aws.S3();
exports.backupData = async (data) => {
    try {

        const file = `DBBackUp-${ Math.ceil(Date.now()/1000)}.json`;

        //almacenar de manera virtual
        const buf = Buffer.from(JSON.stringify(data));

        const params = ({
            Bucket: BUCKET,
            Key: file,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'application/json'
        });
        console.log('ehe supremacy');
        await s3.upload(params, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                console.log('se subio correctamente');
            }
        }).promise();
        console.log('ehe supremacy2');
        return true;

    } catch (err) {
        console.error(err);
        return false;
    }
}