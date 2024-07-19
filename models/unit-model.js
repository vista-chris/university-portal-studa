const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

//unit collection
const unitSchema = new Schema({
    code: {
        type: String,
        unique: true,
        uppercase: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    course: {
        type: ObjectId,
        required: true
    },
    session: {
        type: String,
        required: true
    },
    lecturer: {
        type: ObjectId,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
}, { timestamps: true })

const Unit = mongoose.model('unit', unitSchema);

//offeredUnit collection
const offeredUnitSchema = new Schema({
    unit: {
        type: ObjectId,
        required: true
    },
    students: {
        type: Number,
        required: true
    },
    period: {
        type: String,
        required: true
    },
    lecturer: {
        type: ObjectId,
        required: true
    }
}, { timestamps: true });

const OfferedUnit = mongoose.model('offeredUnit', offeredUnitSchema);

//unitReg collection
const unitRegSchema = new Schema({
    unit: {
        type: ObjectId,
        required: true
    },
    semester: {
        type: ObjectId,
        required: true
    }
}, { timestamps: true });

const UnitReg = mongoose.model('unitReg', unitRegSchema);

module.exports = { Unit, OfferedUnit, UnitReg };