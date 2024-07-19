const Hall = require('../models/hall-model');

//generate code
const generateCode = () => {
    let calc = Math.floor(Math.random() * 1000000);
    return calc;
}

//add Hall
const addHall = async (req, res) => {
    const { name, capacity, faculty } = req.body;
    const code = generateCode();

    try {
        const hall = await Hall.find({ name, faculty });
        if (hall.length > 0) {
            res.status(201).json({
                err: `Hall already exist`
            });
        } else {
            await Hall.create({ code, name, capacity, faculty });
            res.status(201).json({
                success: `Hall registration completed succesfully.`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(201).json({
            err: 'Failed to register hall!'
        });
    }
}

//update Hall
const updateHall = async (req, res) => {
    const {id, name, capacity, faculty } = req.body;

    try {
        const hall = await Hall.find({ name, capacity, faculty });
        if (hall.length > 0) {
            res.status(201).json({
                err: `Hall already exist`
            });
        } else {
            await Hall.findByIdAndUpdate(id, { name, capacity, faculty });
            res.status(201).json({
                success: `Hall updated succesfully.`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(201).json({
            err: 'Failed to update hall!'
        });
    }
}

//delete hall
const deleteHall = async (req, res) => {
    const hall = req.body;

    try {
        for (let i = 0; i < hall.length; i++) {
            const id = hall[i];
            await Hall.findByIdAndDelete(id).clone();
        }
        res.json({ success: 'Deleted hall(s) successfully' })
    } catch (error) {
        console.log(error);
        res.json({ err: 'Failed to delete hall(s)' });
    }
}

//fetch Hall
const fetchHall = async (req, res) => {
    try {
        const hall = await Hall.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "halls": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "halls.non_existing_field",
                        "from": "faculties",
                        "foreignField": "non_existing_field",
                        "as": "faculties"
                    }
                },
                {
                    "$unwind": {
                        "path": "$faculties",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$match": {
                        "$and": [
                            {
                                "$expr": {
                                    "$eq": [
                                        "$halls.faculty",
                                        "$faculties._id"
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$sort": {
                        "halls._id": -1
                    }
                },
                {
                    "$project": {
                        "halls._id": "$halls._id",
                        "halls.code": "$halls.code",
                        "halls.name": "$halls.name",
                        "halls.capacity": "$halls.capacity",
                        "halls.createdAt": "$halls.createdAt",
                        "halls.updatedAt": "$halls.updatedAt",
                        "faculties._id": "$faculties._id",
                        "faculties.code": "$faculties.code",
                        "faculties.name": "$faculties.name",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        );
        res.status(201).send(hall);
    } catch (error) {
        console.log(error);
    }
}


module.exports = { addHall, updateHall, deleteHall, fetchHall, }