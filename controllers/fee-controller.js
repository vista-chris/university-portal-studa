const { default: mongoose } = require('mongoose');
const { Structure, Academic, Accomodation } = require('../models/fee-model');

//add Structure
const addStructure = async (req, res) => {
    const { course, session, academics, accomodation } = req.body;

    try {
        const structure = await Structure.find({ course, session });
        if (structure.length < 1) {
            await Structure.create({ course, session, academics, accomodation });
            res.status(201).json({ success: `A new fee structure has beeen added succesfully.` });
        } else {
            res.json({ err: 'Fee structure alredy exist!' });
        }
    } catch (error) {
        console.log(error);
        res.json({ err: 'Failed to add fee structure!' });
    }
}

//fetch Structures
const fetchStructures = async (req, res) => {
    try {
        const structures = await Structure.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "structures": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "structures.non_existing_field",
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
                                        "$structures.course",
                                        "$courses._id"
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$sort": {
                        "structures._id": -1
                    }
                },
                {
                    "$project": {
                        "structures._id": "$structures._id",
                        "structures.course": "$structures.course",
                        "structures.session": "$structures.session",
                        "structures.academics": "$structures.academics",
                        "structures.accomodation": "$structures.accomodation",
                        "structures.updatedAt": "$structures.updatedAt",
                        "courses._id": "$courses._id",
                        "courses.code": "$courses.code",
                        "courses.name": "$courses.name",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        );
        res.send(structures);
    } catch (error) {
        console.log(error);
    }
}

//remove Structure
const deleteStructure = async (req, res) => {
    const structures = req.body;

    try {
        structures.forEach(async id => {
            await Structure.findByIdAndDelete(id);
        })
        res.json({ success: 'The Structure(s) have been deleted...' });
    } catch (err) {
        console.log(err);
        res.json({ err: 'Failed to delete Structure(s)!' });
    }
}

//update Structure
const updateStructure = async (req, res) => {
    const id = req.params.id;
    const { course, session, academics, accomodation } = req.body;
    try {
        await Structure.findByIdAndUpdate(id, { course, session, academics, accomodation });
        res.json({ success: 'The Structure details have been updated...' });
    } catch (err) {
        console.log(err);
        res.json({ err: 'Failed to update Structure!' });
    }
}

//fetch statements
const fetchFeeStatements = async (req, res) => {
    const { student } = req.params
    try {
        const statements = await Academic.aggregate(
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
                        "academics.payable": "$academics.payable",
                        "academics.paid": "$academics.paid",
                        "academics.balance": "$academics.balance",
                        "academics.excess": "$academics.excess",
                        "academics.createdAt": "$academics.createdAt",
                        "semesters._id": "$semesters._id",
                        "semesters.session": "$semesters.session",
                        "semesters.period": "$semesters.period",
                        "semesters.student": "$semesters.student",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        );
        res.send(statements);
    } catch (error) {
        console.log(error);
    }
}

//fetch accomodation statements
const fetchAccomodationStatements = async (req, res) => {
    const { student } = req.params
    try {
        const statements = await Accomodation.aggregate(
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
                            }
                        ]
                    }
                },
                {
                    "$sort": {
                        "accomodations._id": -1
                    }
                },
                {
                    "$project": {
                        "accomodations._id": "$accomodations._id",
                        "accomodations.payable": "$accomodations.payable",
                        "accomodations.paid": "$accomodations.paid",
                        "accomodations.balance": "$accomodations.balance",
                        "accomodations.excess": "$accomodations.excess",
                        "accomodations.createdAt": "$accomodations.createdAt",
                        "semesters._id": "$semesters._id",
                        "semesters.session": "$semesters.session",
                        "semesters.period": "$semesters.period",
                        "semesters.student": "$semesters.student",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        );
        res.send(statements);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { addStructure, fetchStructures, deleteStructure, updateStructure, fetchFeeStatements, fetchAccomodationStatements }