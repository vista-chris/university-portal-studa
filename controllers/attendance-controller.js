const { AttendanceRecord, AttendanceDetail } = require('../models/attendance-model')
const Semester = require('../models/semester-model')
const QRCode = require('qrcode')
const mongoose = require('mongoose')

//generate code
const generateCode = () => {
    let calc = Math.floor(Math.random() * 1000000)
    return calc
}

//attendance qrcode
const attendanceQRCode = async (req, res) => {
    const { unit, period } = req.body
    const createdAt = new Date().toLocaleDateString()
    const code = generateCode()

    try {
        let qrcode = ''
        let attendance = await AttendanceRecord.find({ unit, period })
        attendance = attendance.filter((el) => {
            let date = new Date(el.createdAt).toLocaleDateString()
            return date == createdAt
        })
        if (attendance.length > 0) {
            qrcode = attendance[0].code
        } else {
            attendance = await AttendanceRecord.create({ unit, period, code })
            const students = await Semester.aggregate(
                [
                    {
                        "$project": {
                            "_id": 0,
                            "semesters": "$$ROOT"
                        }
                    },
                    {
                        "$lookup": {
                            "localField": "semesters.non_existing_field",
                            "from": "unitregs",
                            "foreignField": "non_existing_field",
                            "as": "unitregs"
                        }
                    },
                    {
                        "$unwind": {
                            "path": "$unitregs",
                            "preserveNullAndEmptyArrays": false
                        }
                    },
                    {
                        "$match": {
                            "$and": [
                                {
                                    "$expr": {
                                        "$eq": [
                                            "$semesters._id",
                                            "$unitregs.semester"
                                        ]
                                    }
                                },
                                {
                                    "$expr": {
                                        "$eq": [
                                            "$unitregs.unit",
                                            mongoose.Types.ObjectId(unit)
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "$project": {
                            "semesters.student": "$semesters.student",
                            "_id": 0
                        }
                    }
                ],
                {
                    "allowDiskUse": true
                }
            )
            for (let i = 0; i < students.length; i++) {
                const student = students[i].semesters.student
                await AttendanceDetail.create({ attendance: attendance._id, student, status: 0 })
            }
            qrcode = attendance.code
        }
        QRCode.toDataURL(qrcode, (err, url) => {
            console.log(url)
            res.send(url)
        })

    } catch (error) {
        console.log(error)
    }
}

//atendance qrscanner
const attendanceQRScanner = async (req, res) => {
    const { student, code, unit } = req.body
    const createdAt = new Date().toLocaleDateString()

    await AttendanceRecord.find({ unit, code }, async (err, docs) => {
        const result = docs.filter((el) => {
            let date = new Date(el.createdAt).toLocaleDateString()
            return date == createdAt
        })
        if (result.length > 0) {
            const attendance = result[0]._id.toString()
            const status = 1

            await AttendanceDetail.find({ attendance, student }, async (err, doc) => {
                if (doc.length > 0) {
                    await AttendanceDetail.findOneAndUpdate({ attendance, student }, { status }).clone()
                } else {
                    await AttendanceDetail.create({ attendance, student, status: 1 })
                }
            }).clone()
            res.json({ success: 'Attendance verification passed. You were marked as present' })
        } else {
            res.json({ err: 'Invalid/Expired QR Code!' })
        }
    }).clone()


}

//fetch attendance
const attendanceRecords = async (req, res) => {
    try {
        const attendance = await AttendanceRecord.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "attendancerecords": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "attendancerecords.non_existing_field",
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
                        "localField": "attendancerecords.non_existing_field",
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
                        "localField": "attendancerecords.non_existing_field",
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
                        "localField": "attendancerecords.non_existing_field",
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
                                        "$attendancerecords.unit",
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
                        "attendancerecords._id": -1
                    }
                },
                {
                    "$project": {
                        "attendancerecords._id": "$attendancerecords._id",
                        "attendancerecords.code": "$attendancerecords.code",
                        "attendancerecords.createdAt": "$attendancerecords.createdAt",
                        "offeredunits._id": "$offeredunits._id",
                        "offeredunits.period": "$offeredunits.period",
                        "courses.code": "$courses.code",
                        "units._id": "$units._id",
                        "units.code": "$units.code",
                        "units.name": "$units.name",
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
        res.send(attendance)
    } catch (error) {
        console.log(error)
    }
}

//remove attendance
const deleteAttendance = async (req, res) => {
    const { attendance } = req.body

    try {
        for (let i = 0; i < attendance.length; i++) {
            const id = attendance[i]
            await AttendanceRecord.findByIdAndDelete(id)
            await AttendanceDetail.deleteMany({ attendance: id })
        }
        res.json({ success: 'The attendance(s) have been deleted...' })
    } catch (err) {
        console.log(err)
        res.json({ err: 'Failed to delete attendance(s)!' })
    }
}


//fetch attendance details
const attendanceDetails = async (req, res) => {
    try {
        const attendance = await AttendanceDetail.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "attendancedetails": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "attendancedetails.non_existing_field",
                        "from": "attendancerecords",
                        "foreignField": "non_existing_field",
                        "as": "attendancerecords"
                    }
                },
                {
                    "$unwind": {
                        "path": "$attendancerecords",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "attendancedetails.non_existing_field",
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
                        "localField": "attendancedetails.non_existing_field",
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
                        "localField": "attendancedetails.non_existing_field",
                        "from": "students",
                        "foreignField": "non_existing_field",
                        "as": "students"
                    }
                },
                {
                    "$unwind": {
                        "path": "$students",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "attendancedetails.non_existing_field",
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
                                        "$attendancedetails.attendance",
                                        "$attendancerecords._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$attendancedetails.student",
                                        "$students._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$attendancerecords.unit",
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
                                        "$offeredunits.lecturer",
                                        "$users._id"
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$sort": {
                        "attendancedetails._id": -1
                    }
                },
                {
                    "$project": {
                        "attendancedetails._id": "$attendancedetails._id",
                        "attendancedetails.status": "$attendancedetails.status",
                        "attendancerecords.createdAt": "$attendancerecords.createdAt",
                        "offeredunits._id": "$offeredunits._id",
                        "offeredunits.period": "$offeredunits.period",
                        "students._id": "$students._id",
                        "students.adm": "$students.adm",
                        "students.fname": "$students.fname",
                        "students.mname": "$students.mname",
                        "students.lname": "$students.lname",
                        "students.email": "$students.email",
                        "students.gender": "$students.gender",
                        "units._id": "$units._id",
                        "units.code": "$units.code",
                        "units.name": "$units.name",
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
        res.send(attendance)
    } catch (error) {
        console.log(error)
    }
}

//fetch unit attendance details
const unitAttendance = async (req, res) => {
    const { id } = req.params
    try {
        const attendance = await AttendanceDetail.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "attendancedetails": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "attendancedetails.non_existing_field",
                        "from": "students",
                        "foreignField": "non_existing_field",
                        "as": "students"
                    }
                },
                {
                    "$unwind": {
                        "path": "$students",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "attendancedetails.non_existing_field",
                        "from": "attendancerecords",
                        "foreignField": "non_existing_field",
                        "as": "attendancerecords"
                    }
                },
                {
                    "$unwind": {
                        "path": "$attendancerecords",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$match": {
                        "$and": [
                            {
                                "$expr": {
                                    "$eq": [
                                        "$attendancedetails.attendance",
                                        mongoose.Types.ObjectId(id)
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$attendancerecords._id",
                                        mongoose.Types.ObjectId(id)
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$attendancedetails.student",
                                        "$students._id"
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$project": {
                        "students._id": "$students._id",
                        "students.adm": "$students.adm",
                        "students.fname": "$students.fname",
                        "students.mname": "$students.mname",
                        "students.lname": "$students.lname",
                        "students.email": "$students.email",
                        "students.gender": "$students.gender",
                        "students.category": "$students.category",
                        "attendancerecords.unit": "$attendancerecords.unit",
                        "attendancerecords.createdAt": "$attendancerecords.createdAt",
                        "attendancedetails.status": "$attendancedetails.status"
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        )
        res.send(attendance)
    } catch (error) {
        console.log(error)
    }
}

module.exports = { attendanceQRCode, attendanceQRScanner, attendanceRecords, deleteAttendance, attendanceDetails, unitAttendance }