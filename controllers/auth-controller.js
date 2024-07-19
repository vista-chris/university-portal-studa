const User = require('../models/user-model');
const Student = require('../models/student-model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const request = require('request');

dotenv.config({ path: '../.env' });

//reCAPTCHA middleware
const reCAPTCHA = (req, res) => {
    const { token } = req.body
    if (token === undefined || token === '' || token === null) {
        return res.json({ err: "Something went wrong" });
    }
    const secretKey = process.env.GOOGLE_reCAPTCHA_SECURITY_KEY;

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + token + "&remoteip=" + req.connection.remoteAddress;

    request(verificationURL, async (error, response, body) => {
        body = JSON.parse(body);

        if (body.success !== undefined && !body.success) {
            return res.json({ err: "Failed captcha verification" });
        } else {
            return true;
        }
    });
}

const maxAge = 30 * 24 * 60 * 60;
const createUserToken = (id) => {
    return jwt.sign({ id }, process.env.USER_SECRET_KEY, {
        expiresIn: maxAge
    })
}

const createStudentToken = (id) => {
    return jwt.sign({ id }, process.env.STUDENT_SECRET_KEY, {
        expiresIn: maxAge
    })
}

//generate code
const generateCode = () => {
    let calc = Math.floor(Math.random() * 1000000)
    return calc
}

//sending mail
async function main(fname, email, link) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.GOOGLE_EMAIL,
            pass: process.env.GOOGLE_PASSWORD
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Support"<simonchris33@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Confirm your account", // Subject line
        // plain text body
        html: `
                  <table cellpadding="0" cellspacing="0" border="0" width="88%" style="width: 88% !important; min-width: 88%; max-width: 88%;">
                     <tr>
                        <td align="left" valign="top">
                        <div style="height: 15px; line-height: 33px; font-size: 31px;">&nbsp;</div>
                           <font style="font-size: 52px; line-height: 30px; font-weight: 300; letter-spacing: -1.5px;">
                              <span style="color: #1a1a1a; font-size: 24px; line-height: 60px; font-weight: 300; letter-spacing: -1.5px;">Hey ${fname},</span>
                           </font>
                           <div style="height: 15px; line-height: 33px; font-size: 31px;">&nbsp;</div>
                           <font color="#585858" style="font-size: 24px; line-height: 32px;">
                              <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #585858; font-size: 16px; line-height: 32px;">Please click the link below to set up your new password. The link expires after 15 minutes. If you did not authorise this activity, simply ignore this email.</span>
                           </font>
                           <div style="height: 20px; line-height: 20px; font-size: 18px;">&nbsp;</div>
                           <font color="#585858" style="font-size: 14px; line-height: 32px;">
                           ${link}
                           </font>
                           <div style="height: 15px; line-height: 33px; font-size: 31px;">&nbsp;</div>
                           <font color="#585858" style="font-size: 24px; line-height: 32px;">
                              <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #585858; font-size: 16px; line-height: 32px;">Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.</span>
                           </font>
                           <div style="height: 33px; line-height: 33px; font-size: 31px;">&nbsp;</div>
                           </table>
                           <font face="'Source Sans Pro', sans-serif" style="font-size: 36px; background-image:linear-gradient(310deg,#7928ca,#ff0080); background-clip: text; color: transparent; font-weight: bold;">Studa.</font>
                           <br>
                           <font face="'Source Sans Pro', sans-serif" style="font-size: 12px;">Copyright 2022 &copy; All rights reserved</font>
        `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}

//error handlers
const errorHandler = (err) => {
    let error = ''

    //existing email
    if (err.code === 11000) {
        error = 'The email already exists.'
        return error
    }

    //incorrect email
    if (err.message === 'incorrect_email') {
        error = 'The email is not registered. Please contact admin'
        return error
    }

    //incorrect password
    if (err.message === 'incorrect_password') {
        error = 'You entered a wrong password. Please try again.'
        return error
    }

    //validation errors
    if (err.message.includes('account validation failed')) {
        Object.values(err.errors).forEach(({
            properties
        }) => {
            error[properties.path] = properties.message
        })
    }
    return error
}

//user signup
const signup = async (req, res) => {
    const { title, fname, lname, email, gender, birthday, phone, address, category } = req.body
    const password = generateCode()

    try {
        const user = await User.create({ title, fname, lname, email, gender, birthday, phone, address, category, password })
        const { id } = user
        const secret = (process.env.SECRET_KEY + user.password)
        const payload = { email, id }
        const token = jwt.sign(payload, secret, { expiresIn: '15m' })
        const resetLink = `https://studa-university.herokuapp.com/reset/user/${id}/${token}`
        main(fname, email, resetLink)

        res.status(201).json({
            success: `A new user has beeen added succesfully.<br> An email with a reset link has been sent to the user's email`
        })
    } catch (error) {
        const err = errorHandler(error)
        res.status(201).json({
            err
        })
    }
}

//user signin
const signin = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    //reCAPTCHA verification
    reCAPTCHA(req, res);

    try {
        const user = await User.login(email, password);
        const token = createUserToken(user._id);
        if (rememberMe === true) {
            //expires after 30 days
            res.cookie('userjwt', token, { maxAge: 1000 * maxAge, httpOnly: true, secure: false })
        } else {
            //expires after 1 day
            res.cookie('userjwt', token, { maxAge: 1000 * 1 * 24 * 60 * 60, httpOnly: true, secure: false })
        }
        res.json({ user });
    } catch (error) {
        const err = errorHandler(error);
        res.json({ err });
    }

}

//student signin
const login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    //reCAPTCHA verification
    reCAPTCHA(req, res);

    try {
        const student = await Student.login(email, password);

        const token = createStudentToken(student._id);

        if (rememberMe === true) {
            //expires after 30 days
            res.cookie('studentjwt', token, { maxAge: 1000 * maxAge, httpOnly: true, secure: false });
        } else {
            //expires after 1 day
            res.cookie('studentjwt', token, { maxAge: 1000 * 1 * 24 * 60 * 60, httpOnly: true, secure: false });
        }
        res.json({ student });

    } catch (error) {
        const err = errorHandler(error);
        res.json({ err });
    }
}

const logout = (req, res) => {
    res.cookie('studentjwt', '', { maxAge: 1 });
    res.cookie('userjwt', '', { maxAge: 1 });
    res.redirect('back');
}

const forgotUserPassword = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findEmail(email);
        const { id, fname, password } = user;
        const secret = (process.env.SECRET_KEY + password);
        const payload = { email, id }
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });
        const resetLink = `https://studa-university.herokuapp.com/reset/user/${id}/${token}`;
        main(fname, email, resetLink);
        res.status(201).json({ success: 'Your password reset link has been sent. Please check your email' });
    } catch (error) {
        const err = errorHandler(error);
        res.status(201).json({ err });
    }
}

const forgotStudentPassword = async (req, res) => {
    const { email } = req.body

    try {
        const student = await Student.findEmail(email)
        const { id, fname, password } = student
        const secret = (process.env.SECRET_KEY + password)
        const payload = { email, id }
        const token = jwt.sign(payload, secret, { expiresIn: '15m' })
        const resetLink = `https://studa-university.herokuapp.com/reset/student/${id}/${token}`
        main(fname, email, resetLink)
        res.status(201).json({ success: 'Your password reset link has been sent. Please check your email' })
    } catch (error) {
        const err = errorHandler(error)
        res.status(201).json({ err })
    }
}

const resetUser = async (req, res) => {
    const { id, token } = req.params

    await User.findById(id)
        .then((data) => {
            if (data) {
                const { email, password } = data
                const secret = (process.env.SECRET_KEY + password)
                try {
                    jwt.verify(token, secret)
                    res.render('reset-password', { title: 'Reset password', email })
                } catch (error) {
                    res.send(error.message)
                }
            } else {
                res.send('Invalid id!')
            }
        }).catch((error) => {
            res.send(error.message)
        })
}

const resetStudent = async (req, res) => {
    const { id, token } = req.params

    await Student.findById(id)
        .then((data) => {
            if (data) {
                const { email, password } = data
                const secret = (process.env.SECRET_KEY + password)
                try {
                    jwt.verify(token, secret)
                    res.render('reset-password', { title: 'Set your password', email })
                } catch (error) {
                    res.send(error.message)
                }
            } else {
                res.send('Invalid id!')
            }
        }).catch((error) => {
            res.send(error.message)
        })
}

const resetUserPassword = async (req, res) => {
    const { id, token } = req.params
    let { newPassword } = req.body

    const salt = await bcrypt.genSalt()
    newPassword = await bcrypt.hash(newPassword, salt)

    await User.findById(id)
        .then(async (data) => {
            if (data) {
                const { id, password } = data
                const secret = (process.env.SECRET_KEY + password)

                if (jwt.verify(token, secret)) {
                    await User.findByIdAndUpdate(id, { password: newPassword }, { new: true })
                        .then(res.send('success'))
                        .catch((error) => { res.send(error.message) })
                } else {
                    res.send('jwt expired!')
                }
            } else {
                res.send('Invalid id!')
            }
        }).catch((error) => {
            res.send(error.message)
        })
}

const resetStudentPassword = async (req, res) => {
    const { id, token } = req.params
    let { newPassword } = req.body

    const salt = await bcrypt.genSalt()
    newPassword = await bcrypt.hash(newPassword, salt)

    await Student.findById(id)
        .then(async (data) => {
            if (data) {
                const { id, password } = data
                const secret = (process.env.SECRET_KEY + password)

                if (jwt.verify(token, secret)) {
                    await Student.findByIdAndUpdate(id, { password: newPassword }, { new: true })
                        .then(res.send('success'))
                        .catch((error) => { res.send(error.message) })
                } else {
                    res.send('jwt expired!')
                }
            } else {
                res.send('Invalid id!')
            }
        }).catch((error) => {
            res.send(error.message)
        })
}

const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body

    try {
        //const user = await 
    } catch (error) {
        res.json({ error })
    }
}

const addStudent = async (req, res) => {
    const { fname, mname, lname, email, gender, birthday, phone, address, category, course } = req.body
    const password = generateCode()
    const adm = `${generateCode()}`

    try {
        const student = await Student.create({ adm, fname, mname, lname, email, gender, birthday, phone, address, category, course, password })
        const { id } = student
        const secret = (process.env.SECRET_KEY + student.password)
        const payload = { email, id }
        const token = jwt.sign(payload, secret, { expiresIn: '15m' })
        const resetLink = `https://studa-university.herokuapp.com/reset/student/${id}/${token}`
        main(fname, email, resetLink)

        res.status(201).json({
            success: `A new student has beeen added succesfully.<br> An email with a reset link has been sent to the student's email`
        })
    } catch (error) {
        console.log(error)
        const err = errorHandler(error)
        res.json({ err })
    }
}

module.exports = { signup, signin, login, logout, forgotUserPassword, forgotStudentPassword, resetUser, resetStudent, resetUserPassword, resetStudentPassword, updatePassword, addStudent }