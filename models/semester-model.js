const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const semesterSchema = new Schema({
    session: {
        type: String,
        required: true
    },
    period: {
        type: String,
        required: true
    },
    hostel: {
        type: Boolean,
        required: true
    },
    student: {
        type: ObjectId,
        required: true
    }
}, { timestamps: true });

const Semester = mongoose.model('semester', semesterSchema);

module.exports = Semester;