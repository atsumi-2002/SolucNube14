require('dotenv').config();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const BUCKET = process.env.BUCKET

const s3 = new aws.S3();
const upload = multer({
    storage:multerS3({
        bucket: BUCKET,
        s3: s3,
        acl: 'public-read',
        key: (req, file, cb) => {
            console.log(file);
            cb(null, file.originalname);
        }
    })
});

module.exports = upload;