const { Unit, OfferedUnit, UnitReg } = require('../models/unit-model')
const Semester = require('../models/semester-model')
const { AttendanceRecord, AttendanceDetail } = require('../models/attendance-model')
const Timetable = require('../models/timetable-model')
const mongoose = require('mongoose')

//add course unit
const addUnit = async (req, res) => {
    const { code, name, course, session, lecturer, status } = req.body

    try {
        await Unit.create({ code, name, course, session, lecturer, status })
        res.status(201).json({
            success: `A new unit has beeen added succesfully.`
        })
    } catch (error) {
        if (error.code === 11000) {
            res.json({ err: 'The unit already exist...' })
        } else {
            console.log(error)
            res.status(201).json({
                err: 'Failed to add unit!'
            })
        }
    }
}

//fetch course units
const fetchUnits = async (req, res) => {

    try {

        const units = await Unit.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "units": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "units.non_existing_field",
                        "from": "courses",
                        "foreignField": "non_existing_field",
                        "as": "courses"
                    }
                },
                {
                    "$unwind": {
                        "path": "$courses",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "units.non_existing_field",
                        "from": "users",
                        "foreignField": "non_existing_field",
                        "as": "users"
                    }
                },
                {
                    "$unwind": {
                        "path": "$users",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$match": {
                        "$and": [
                            {
                                "$expr": {
                                    "$eq": [
                                        "$units.course",
                                        "$courses._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$units.lecturer",
                                        "$users._id"
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$sort": {
                        "units._id": -1
                    }
                },
                {
                    "$project": {
                        "units._id": "$units._id",
                        "units.code": "$units.code",
                        "units.name": "$units.name",
                        "units.session": "$units.session",
                        "units.status": "$units.status",
                        "courses._id": "$courses._id",
                        "courses.code": "$courses.code",
                        "courses.name": "$courses.name",
                        "users._id": "$users._id",
                        "users.title": "$users.title",
                        "users.fname": "$users.fname",
                        "users.lname": "$users.lname",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        )

        res.send(units)
    } catch (error) {
        console.log(error)
    }
}

//remove course unit
const deleteUnit = async (req, res) => {
    const units = req.body

    try {
        for (let i = 0; i < units.length; i++) {
            const id = units[i]
            await Unit.findByIdAndDelete(id)
        }
        res.json({ success: 'The unit(s) have been deleted...' })
    } catch (err) {
        console.log(err)
        res.json({ err: 'Failed to delete unit(s)!' })
    }
}

//update course unit
const updateUnit = async (req, res) => {
    const id = req.params.id
    const { code, name, course, session, lecturer, status } = req.body

    try {
        await Unit.findByIdAndUpdate(id, { code, name, course, session, lecturer, status })
        if (status == 0) {
            await OfferedUnit.findOneAndDelete({ unit: id })
        }
        res.json({ success: 'The unit details have been updated...' })
    } catch (err) {
        if (err.code === 11000) {
            res.json({ err: 'The unit already exist...' })
        } else {
            console.log(err)
            res.json({ err: 'Failed to update unit!' })
        }
    }
}

//apply selected course units
const applyUnits = async (req, res) => {
    const { period, units } = req.body
    const students = 0

    try {
        for (let i = 0; i < units.length; i++) {
            const unit = units[i]
            const offeredUnits = await OfferedUnit.find({ unit, period })
            if (offeredUnits.length < 1) {
                const result = await Unit.findById({ _id: unit })
                const lecturer = result.lecturer
                await OfferedUnit.create({ unit, students, period, lecturer })
            }
        }
        res.json({ success: 'The unit(s) have been applied...' })
    } catch (err) {
        console.log(err)
        res.json({ err: 'Failed to apply for unit(s)!' })
    }
}

//fetch offered course units
const fetchOfferedUnits = async (req, res) => {
    try {
        const units = await OfferedUnit.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "offeredunits": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "offeredunits.non_existing_field",
                        "from": "units",
                        "foreignField": "non_existing_field",
                        "as": "units"
                    }
                },
                {
                    "$unwind": {
                        "path": "$units",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "offeredunits.non_existing_field",
                        "from": "users",
                        "foreignField": "non_existing_field",
                        "as": "users"
                    }
                },
                {
                    "$unwind": {
                        "path": "$users",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "offeredunits.non_existing_field",
                        "from": "courses",
                        "foreignField": "non_existing_field",
                        "as": "courses"
                    }
                },
                {
                    "$unwind": {
                        "path": "$courses",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$match": {
                        "$and": [
                            {
                                "$expr": {
                                    "$eq": [
                                        "$offeredunits.unit",
                                        "$units._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$offeredunits.lecturer",
                                        "$users._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$units.course",
                                        "$courses._id"
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$sort": {
                        "offeredunits._id": -1
                    }
                },
                {
                    "$project": {
                        "offeredunits._id": "$offeredunits._id",
                        "offeredunits.students": "$offeredunits.students",
                        "offeredunits.period": "$offeredunits.period",
                        "offeredunits.createdAt": "$offeredunits.createdAt",
                        "courses._id": "$courses._id",
                        "courses.code": "$courses.code",
                        "courses.faculty": "$courses.faculty",
                        "units._id": "$units._id",
                        "units.code": "$units.code",
                        "units.name": "$units.name",
                        "units.session": "$units.session",
                        "units.lecturer": "$units.lecturer",
                        "users._id": "$users._id",
                        "users.title": "$users.title",
                        "users.fname": "$users.fname",
                        "users.lname": "$users.lname",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        )
        res.send(units)
    } catch (error) {
        console.log(error)
    }
}

//remove course unit
const removeOfferedUnit = async (req, res) => {
    const units = req.body

    try {
        for (let i = 0; i < units.length; i++) {
            const id = units[i];
            await OfferedUnit.findByIdAndDelete(id);
            await Timetable.findOneAndDelete({ unit: id });
            const attendance = await AttendanceRecord.findOneAndDelete({ unit: id });
            await AttendanceDetail.deleteMany({ attendance: attendance._id });
            await UnitReg.deleteMany({ unit: id });
        }
        res.json({ success: 'The unit(s) on offer have been removed...' });
    } catch (err) {
        console.log(err)
        res.json({ err: 'Failed to remove unit(s)!' });
    }
}

//register course unit
const regUnits = async (req, res) => {
    const { units, period, student } = req.body

    try {
        let result = await Semester.find({ period, student })
        if (result.length < 1) {
            res.json({ err: 'Please first register for the semester!' })
        } else {
            const semester = result[0]._id
            result = await UnitReg.find({ semester })
            console.log(result)
            if (result.length >= 8 || (result.length + units.length) > 8) {
                res.json({ err: `You have reached the maximum number of units per semester. You have already registered ${result.length} units. You can only add ${(8 - result.length)} units.` })
            } else {
                for (let i = 0; i < units.length; i++) {
                    const unit = units[i]
                    result = await UnitReg.find({ unit, semester })
                    if (result.length < 1) {
                        await AttendanceRecord.find({ unit }, async (err, docs) => {
                            for (let i = 0; i < docs.length; i++) {
                                const attendance = docs[i];
                                await AttendanceDetail.find({ attendance, student }, async (err, doc) => {
                                    if (doc.length < 1) {
                                        await AttendanceDetail.create({ attendance, student, status: 0 })
                                    }
                                }).clone();
                            }
                        }).clone();
                        await UnitReg.create({ unit, semester });
                        const unit_students = await UnitReg.aggregate([
                            { $match: { unit: mongoose.Types.ObjectId(unit) } },
                            { $group: { _id: null, students: { $sum: 1 } } }
                        ]);

                        let students = 0;
                        if (unit_students.length > 0) {
                            students = unit_students[0].students;
                        }

                        await OfferedUnit.findByIdAndUpdate({ _id: unit }, { students });
                    }
                }
                res.json({ success: 'The unit(s) have been registered...' })
            }
        }
    } catch (err) {
        console.log(err)
        res.json({ err: 'Failed to register unit(s)!' })
    }
}

//fetch registered course units
const fetchRegUnits = async (req, res) => {
    const { student } = req.params
    try {
        const units = await UnitReg.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "unitregs": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "unitregs.non_existing_field",
                        "from": "offeredunits",
                        "foreignField": "non_existing_field",
                        "as": "offeredunits"
                    }
                },
                {
                    "$unwind": {
                        "path": "$offeredunits",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "unitregs.non_existing_field",
                        "from": "units",
                        "foreignField": "non_existing_field",
                        "as": "units"
                    }
                },
                {
                    "$unwind": {
                        "path": "$units",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "unitregs.non_existing_field",
                        "from": "semesters",
                        "foreignField": "non_existing_field",
                        "as": "semesters"
                    }
                },
                {
                    "$unwind": {
                        "path": "$semesters",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "unitregs.non_existing_field",
                        "from": "users",
                        "foreignField": "non_existing_field",
                        "as": "users"
                    }
                },
                {
                    "$unwind": {
                        "path": "$users",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$match": {
                        "$and": [
                            {
                                "$expr": {
                                    "$eq": [
                                        "$unitregs.semester",
                                        "$semesters._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$unitregs.unit",
                                        "$offeredunits._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$offeredunits.unit",
                                        "$units._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$units.lecturer",
                                        "$users._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$semesters.student",
                                        mongoose.Types.ObjectId(student)
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$sort": {
                        "unitregs._id": -1
                    }
                },
                {
                    "$project": {
                        "unitregs._id": "$unitregs._id",
                        "semesters.session": "$semesters.session",
                        "offeredunits._id": "$offeredunits._id",
                        "offeredunits.period": "$offeredunits.period",
                        "units.code": "$units.code",
                        "units.name": "$units.name",
                        "units.session": "$units.session",
                        "users.title": "$users.title",
                        "users.fname": "$users.fname",
                        "users.lname": "$users.lname",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        )
        res.send(units)
    } catch (error) {
        console.log(error)
    }
}

//remove registered course unit
const removeRegUnit = async (req, res) => {
    const { units } = req.body
    try {
        for (let i = 0; i < units.length; i++) {
            const id = units[i]
            const { unit } = await UnitReg.findByIdAndDelete(id)

            const unit_students = await UnitReg.aggregate([
                { $match: { unit } },
                { $group: { _id: null, students: { $sum: 1 } } }
            ]);

            let students = 0;
            if (unit_students.length > 0) {
                students = unit_students[0].students;
            }

            await OfferedUnit.findByIdAndUpdate({ _id: unit }, { students });
        }
        res.json({ success: 'The unit(s) have been removed...' })
    } catch (err) {
        console.log(err)
        res.json({ err: 'Failed to delete unit(s)!' })
    }
}

module.exports = { addUnit, fetchUnits, deleteUnit, updateUnit, applyUnits, fetchOfferedUnits, removeOfferedUnit, regUnits, fetchRegUnits, removeRegUnit }