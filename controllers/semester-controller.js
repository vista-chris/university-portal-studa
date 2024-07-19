const { default: mongoose } = require('mongoose');
const Semester = require('../models/semester-model');
const { Structure, Academic, Accomodation } = require('../models/fee-model');

//reg semester
const regSemester = async (req, res) => {
    const { session, period, hostel, student, course } = req.body

    try {
        let semester = await Semester.find({ "$or": [{ "$and": [{ session }, { student }] }, { "$and": [{ period }, { student }] }] });
        if (semester.length > 0) {
            res.json({ err: `Semester registration already exist<br>Either the period or session already exist.` });
        } else {
            const structure = await Structure.find({ course, session });
            if (structure.length === 1) {
                semester = await Semester.create({ session, period, hostel, student });

                semester = semester._id;
                let balance = payable = structure[0].academics;
                let paid = excess = 0;

                let statements = await Academic.aggregate(
                    [
                        {
                            "$project": {
                                "_id": 0,
                                "academics": "$$ROOT"
                            }
                        },
                        {
                            "$lookup": {
                                "localField": "academics.non_existing_field",
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
                            "$match": {
                                "$and": [
                                    {
                                        "$expr": {
                                            "$eq": [
                                                "$academics.semester",
                                                "$semesters._id"
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
                                    },
                                    {
                                        "$expr": {
                                            "$ne": [
                                                "$academics.excess",
                                                Number(0)
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "$sort": {
                                "academics._id": -1
                            }
                        },
                        {
                            "$project": {
                                "academics._id": "$academics._id",
                                "academics.excess": "$academics.excess",
                                "semesters._id": "$semesters._id",
                                "semesters.session": "$semesters.session",
                                "semesters.period": "$semesters.period",
                                "_id": 0
                            }
                        }
                    ],
                    {
                        "allowDiskUse": true
                    }
                );

                if (statements.length === 1) {
                    excessFee = statements.academics.excess;
                    if (excessFee >= payable) {
                        paid = payable;
                        balance = 0;
                        excess = excessFee - payable;
                    } else {
                        paid = excessFee;
                        balance = payable - paid;
                    }
                }

                await Academic.create({ semester, payable, paid, balance, excess });

                if (hostel === true) {
                    balance = payable = structure[0].accomodation;

                    statements = await Accomodation.aggregate(
                        [
                            {
                                "$project": {
                                    "_id": 0,
                                    "accomodations": "$$ROOT"
                                }
                            },
                            {
                                "$lookup": {
                                    "localField": "accomodations.non_existing_field",
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
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$eq": [
                                                    "$accomodations.semester",
                                                    "$semesters._id"
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
                                        },
                                        {
                                            "$expr": {
                                                "$ne": [
                                                    "$accomodations.excess",
                                                    Number(0)
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "$project": {
                                    "accomodations._id": "$accomodations._id",
                                    "accomodations.excess": "$accomodations.excess",
                                    "semesters._id": "$semesters._id",
                                    "semesters.session": "$semesters.session",
                                    "semesters.period": "$semesters.period",
                                    "_id": 0
                                }
                            }
                        ],
                        {
                            "allowDiskUse": true
                        }
                    );

                    if (statements.length === 1) {
                        excessFee = statements.accomodations.excess;
                        if (excessFee >= payable) {
                            paid = payable;
                            balance = 0;
                            excess = excessFee - payable;
                        } else {
                            paid = excessFee;
                            balance = payable - paid;
                            excess = 0;
                        }
                    }

                    await Accomodation.create({ semester, payable, paid, balance, excess });
                }
                res.status(201).json({ success: `Semester registration completed succesfully.` });
            } else {
                res.json({ err: 'Failed to register semester. An error occured on the accounting system!' });
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ err: 'Failed to register semester!' });
    }
}

//fetch reg semesters
const fetchRegSemester = async (req, res) => {
    const { student } = req.params
    try {
        const semesters = await Semester.find({ student })
        res.send(semesters)
    } catch (error) {
        console.log(error)
    }
}

module.exports = { regSemester, fetchRegSemester }