const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Process = new Schema({
    relatedClient: {
        type: Schema.Types.ObjectId,
        ref: "clients",
        required: true
    },
    numberProcess: {
        type: String,
        /*required: true*/
    },
    process: {
        type: String,
        required: true
    },
    received: {
        type: Number
    },
    registered: {
        type: Number
    },
    waitingQueries: {
        type: Number
    },
    checkingDocs: {
        type: Number
    },
    orderAnalysis: {
        type: Number
    },
    dispatch: {
        type: Number
    },
    finished: {
        type: Number
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
