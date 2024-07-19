const Timetable = require('../models/timetable-model')
const Hall = require('../models/hall-model');

//generate timetable
const generateTimetable = async (req, res) => {
    const { units } = req.body
    let timestamp = [
        { 'day': 'Monday', 'start': '08:00 AM', 'end': '11:00 AM' },
        { 'day': 'Monday', 'start': '11:00 AM', 'end': '02:00 PM' },
        { 'day': 'Monday', 'start': '02:00 PM', 'end': '05:00 PM' },
        { 'day': 'Tuesday', 'start': '08:00 AM', 'end': '11:00 AM' },
        { 'day': 'Tuesday', 'start': '11:00 AM', 'end': '02:00 PM' },
        { 'day': 'Tuesday', 'start': '02:00 PM', 'end': '05:00 PM' },
        { 'day': 'Wednesday', 'start': '08:00 AM', 'end': '11:00 AM' },
        { 'day': 'Wednesday', 'start': '11:00 AM', 'end': '02:00 PM' },
        { 'day': 'Wednesday', 'start': '02:00 PM', 'end': '05:00 PM' },
        { 'day': 'Thursday', 'start': '08:00 AM', 'end': '11:00 AM' },
        { 'day': 'Thursday', 'start': '11:00 AM', 'end': '02:00 PM' },
        { 'day': 'Thursday', 'start': '02:00 PM', 'end': '05:00 PM' },
        { 'day': 'Friday', 'start': '08:00 AM', 'end': '11:00 AM' },
        { 'day': 'Friday', 'start': '11:00 AM', 'end': '02:00 PM' },
        { 'day': 'Friday', 'start': '02:00 PM', 'end': '05:00 PM' },
    ]

    try {
        for (let i = 0; i < units.length; i++) {
            const { unit, lecturer, course, faculty, session, students } = units[i];

            let capacity = await Hall.find({ faculty }).clone();
            capacity = capacity.sort(() => Math.random() - 0.5);
            timestamp = timestamp.sort(() => Math.random() - 0.5);

            await Timetable.find({ unit }, async (err, doc) => {
                if (doc.length < 1) {
                    for (let i = 0; i < timestamp.length; i++) {
                        const { day, start, end } = timestamp[i];
                        const timetable = await Timetable.find({ course, session, day, start, end }).clone();
                        if (timetable.length < 1) {
                            const user = await Timetable.find({ lecturer, day, start, end }).clone();
                            if (user.length < 1) {
                                for (let i = 0; i < capacity.length; i++) {
                                    const hall = capacity[i]._id;
                                    const hall_capacity = capacity[i].capacity;
                                    const hallCheck = await Timetable.find({ hall, day, start, end });
                                    if (Number(hallCheck.length) < 1 && Number(students) <= Number(hall_capacity)) {
                                        await Timetable.create({ unit, course, lecturer, session, hall, day, start, end });
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }).clone()
        }
        res.json({ success: 'Timetable generated successfully!' })
    } catch (error) {
        console.log(error)
        res.json({ err: 'Failed to generate timetable. An error occured. Please try again!' })
    }
}

//delete timetable
const deleteTimetable = async (req, res) => {
    try {
        await Timetable.deleteMany()
        res.json({ success: 'Succefully removed timetable from database!' })
    } catch (error) {
        console.log(error)
        res.json({ err: 'Failed to remove timetable. An error occured. Please try again.' })
    }
}

//fetch timetable
const fetchTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "timetables": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "timetables.non_existing_field",
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
                        "localField": "timetables.non_existing_field",
                        "from": "halls",
                        "foreignField": "non_existing_field",
                        "as": "halls"
                    }
                },
                {
                    "$unwind": {
                        "path": "$halls",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$lookup": {
                        "localField": "timetables.non_existing_field",
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
                        "localField": "timetables.non_existing_field",
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
                        "localField": "timetables.non_existing_field",
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
                                        "$timetables.unit",
                                        "$offeredunits._id"
                                    ]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": [
                                        "$timetables.hall",
                                        "$halls._id"
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
                    "$project": {
                        "timetables._id": "$timetables._id",
                        "timetables.day": "$timetables.day",
                        "timetables.start": "$timetables.start",
                        "timetables.end": "$timetables.end",
                        "offeredunits._id": "$offeredunits._id",
                        "offeredunits.period": "$offeredunits.period",
                        "halls.name": "$halls.name",
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
        res.send(timetable)
    } catch (error) {
        console.log(error)
    }
}


module.exports = { generateTimetable, deleteTimetable, fetchTimetable }