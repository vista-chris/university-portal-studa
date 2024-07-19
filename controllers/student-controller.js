const Student = require('../models/student-model');
const Semester = require('../models/semester-model');
const { AttendanceDetail } = require('../models/attendance-model')

//fetch students
const fetchStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 })
        res.send(students)
    } catch (error) {
        console.log(error)
    }
}

//remove student
const deleteStudent = async (req, res) => {
    const students = req.body;

    try {
        for (let i = 0; i < students.length; i++) {
            const id = students[i];
            await Student.findByIdAndDelete(id).clone();
            await Semester.deleteMany({ student: id });
            await AttendanceDetail.deleteMany({ student: id });
        }
        res.json({ success: 'The student(s) have been deleted!' });
    } catch (err) {
        console.log(err);
        res.json({ err: 'Failed to delete student(s)!' });
    }
}

//update student
const updateStudent = async (req, res) => {
    const id = req.params.id
    const { fname, mname, lname, email, gender, birthday, phone, address, category, course } = req.body

    try {
        await Student.findByIdAndUpdate(id, { fname, mname, lname, email, gender, birthday, phone, address, category, course })
        res.json({ success: 'The student details have been updated...' })
    } catch (err) {
        if (err.code === 11000) {
            res.json({ err: 'The email already exists...' })
        } else {
            console.log(err)
            res.json({ err: 'Failed to update student!' })
        }
    }
}
module.exports = { fetchStudents, deleteStudent, updateStudent }