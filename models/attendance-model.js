const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

//attendanceRecord Schema
const attendanceRecordSchema = new Schema({
    unit: {
        type: ObjectId,
        required: true
    },
    code: {
        type: String,
        required: true
    }
}, { timestamps: true });

attendanceRecordSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.code = await bcrypt.hash(this.code, salt);

    next();
})

const AttendanceRecord = mongoose.model('attendanceRecord', attendanceRecordSchema);

//attendanceDetail collection
const attendanceDetailSchema = new Schema({
    attendance: {
        type: ObjectId,
        required: true
    },
    student: {
        type: ObjectId,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

const AttendanceDetail = mongoose.model('attendanceDetail', attendanceDetailSchema);

module.exports = { AttendanceRecord, AttendanceDetail };