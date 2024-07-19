const User = require('../models/user-model')

//fetch users
const fetchUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 })
        res.send(users)
    } catch (error) {
        console.log(error)
    }
}

//remove user
const deleteUser = async (req, res) => {
    const id = req.params.id

    try {
        await User.findByIdAndDelete(id)
        res.json({ success: 'The user has been deleted...' })
    } catch (err) {
        console.log(err)
        res.json({ err: 'Failed to delete user!' })
    }
}

//update user
const updateUser = async (req, res) => {
    const id = req.params.id
    const { title, fname, lname, email, gender, birthday, phone, address, category } = req.body

    try {
        await User.findByIdAndUpdate(id, { title, fname, lname, email, gender, birthday, phone, address, category })
        res.json({ success: 'The user details have been updated...' })
    } catch (err) {
        if (err.code === 11000) {
            res.json({ err: 'The email already exists...' })
        } else {
            console.log(err)
            res.json({ err: 'Failed to update user!' })
        }
    }
}

module.exports = { fetchUsers, deleteUser, updateUser }