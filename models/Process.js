const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Process = new Schema({
    relatedClient: {
        type: Schema.Types.ObjectId,
        ref: "clients",
        required: true
    },
    clientName: {
        type: String,
    },
    clientEmail: {
        type: String,
    },
    numberProcess: {
        type: String
    },
    process: {
        type: String,
        required: true
    },
    received: {
        type: String
    },
    registered: {
        type: String
    },
    waitingQueries: {
        type: String
    },
    checkingDocs: {
        type: String
    },
    orderAnalysis: {
        type: String
    },
    dispatch: {
        type: String
    },
    finished: {
        type: String
    },
    comments: {
        type: String
    },
    monetaryPendency: {
        type: String
    },
    attachments: {
        type: Array
    },
    code: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

})

mongoose.model("processes", Process)
