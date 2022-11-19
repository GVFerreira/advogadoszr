const multer  = require('multer')
const upload = multer(
    {
        dest: './public/uploads/attachments'
    }
)
const path = require('path')
const crypto = require('crypto')

module.exports = (multer(
    {
        storage: multer.diskStorage(
            {
                destination: (req, file, cb) => {
                    cb(null, './public/uploads/attachments')
                },
                filename: (req, file, cb) => {
                        cb(null, `${Date.now()}-${file.originalname}`)
                    }
            }
        )
    }
))
