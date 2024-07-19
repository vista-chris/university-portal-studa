const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const structureSchema = new Schema({
    course: {
        type: ObjectId,
        required: true
    },
    session: {
        type: String,
        required: true
    },
    academics: {
        type: Number,
        required: true
    },
    accomodation: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Structure = mongoose.model('structure', structureSchema);

const academicSchema = new Schema({
    semester: {
        type: ObjectId,
        required: true
    },
    payable: {
        type: Number,
        required: true
    },
    paid: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    excess: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Academic = mongoose.model('academic', academicSchema);

const accomodationSchema = new Schema({
    semester: {
        type: ObjectId,
        required: true
    },
    payable: {
        type: Number,
        required: true
    },
    paid: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    excess: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Accomodation = mongoose.model('accomodation', accomodationSchema);

module.exports = { Structure, Academic, Accomodation };