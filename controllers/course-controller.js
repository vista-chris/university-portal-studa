const Course = require('../models/course-model')

//add course
const addCourse = async (req, res) => {
    const { code, name, description, type, faculty, status } = req.body

    try {
        await Course.create({ code, name, description, type, faculty, status })
        res.status(201).json({
            success: `A new course has beeen added succesfully.`
        })
    } catch (error) {
        console.log(error)
        res.status(201).json({
            err: 'Failed to add course!'
        })
    }
}

//fetch courses
const fetchCourses = async (req, res) => {
    try {
        const courses = await Course.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "courses": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "courses.non_existing_field",
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
                                        "$courses.faculty",
                                        "$faculties._id"
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$sort": {
                        "courses._id": -1
                    }
                },
                {
                    "$project": {
                        "courses._id": "$courses._id",
                        "courses.code": "$courses.code",
                        "courses.name": "$courses.name",
                        "courses.description": "$courses.description",
                        "courses.type": "$courses.type",
                        "courses.status": "$courses.status",
                        "courses.createdAt": "$courses.createdAt",
                        "faculties._id": "$faculties._id",
                        "faculties.code": "$faculties.code",
                        "faculties.name": "$faculties.name",
                        "faculties.description": "$faculties.description",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        );
        res.send(courses)
    } catch (error) {
        console.log(error)
    }
}

//remove course
const deleteCourse = async (req, res) => {
    const courses = req.body

    try {
        courses.forEach(async id => {
            await Course.findByIdAndDelete(id)
        })
        res.json({ success: 'The course(s) have been deleted...' })
    } catch (err) {
        console.log(err)
        res.json({ err: 'Failed to delete course(s)!' })
    }
}

//update course
const updateCourse = async (req, res) => {
    const id = req.params.id
    const { code, name, description, type, faculty, status } = req.body
    try {
        await Course.findByIdAndUpdate(id, { code, name, description, type, faculty, status })
        res.json({ success: 'The course details have been updated...' })
    } catch (err) {
        if (err.code === 11000) {
            res.json({ err: 'The course already exists...' })
        } else {
            console.log(err)
            res.json({ err: 'Failed to update course!' })
        }
    }
}

module.exports = { addCourse, fetchCourses, deleteCourse, updateCourse }