const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Client = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    tel: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    observations: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("clients", Client)