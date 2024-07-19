const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

//unit collection
const timetableSchema = new Schema({
    unit: {
        type: ObjectId,
        required: true
    },
    course: {
        type: ObjectId,
        required: true
    },
    lecturer: {
        type: ObjectId,
        required: true
    },
    session: {
        type: String,
        required: true
    },
    hall: {
        type: ObjectId,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Timetable = mongoose.model('timetable', timetableSchema);

module.exports = Timetable;