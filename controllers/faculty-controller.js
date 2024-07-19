const Faculty = require('../models/faculty-model')

//add faculty
const addFaculty = async (req, res) => {
    const { code, name, description } = req.body

    try {
        const faculty = await Faculty.find({ code, name })
        if (faculty.length > 0) {
            res.status(201).json({
                err: `Faculty already exist`
            })
        } else {
            await Faculty.create({ code, name, description })
            res.status(201).json({
                success: `Faculty registration completed succesfully.`
            })
        }
    } catch (error) {
        console.log(error)
        res.status(201).json({
            err: 'Failed to register faculty!'
        })
    }
}

//fetch faculty
const fetchFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find().sort({ createdAt: -1 })
        res.status(201).send(faculty)
    } catch (error) {
        console.log(error)
    }
}


module.exports = { addFaculty, fetchFaculty }