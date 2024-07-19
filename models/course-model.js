const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const courseSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    faculty: {
        type: ObjectId,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

const Course = mongoose.model('course', courseSchema);

module.exports = Course;