const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/user-model');
const Student = require('./models/student-model');
const mpesaController = require('./controllers/mpesa-api-controller');

const app = express();

dotenv.config({ path: './.env' });

mongoose.connect(process.env.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(app.listen(process.env.PORT || 3000))
    .catch(console.error);

//view engine
app.set('view engine', 'ejs');
 
// For parsing application/json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middleware & static files
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(morgan('dev'));
app.use(cookieParser());


//check user middleware
const checkUser = (req, res, next) => {
    const token = req.cookies.userjwt;

    //check if web token exists & verified
    if (token) {
        jwt.verify(token, process.env.USER_SECRET_KEY, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next()
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
}

//check user middleware
const checkStudent = (req, res, next) => {
    const token = req.cookies.studentjwt;

    //check if web token exists & verified
    if (token) {
        jwt.verify(token, process.env.STUDENT_SECRET_KEY, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await Student.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
}

//user auth middleware
const requireAuth = (req, res, next) => {
    const token = req.cookies.userjwt;

    //check if web token exists & verified
    if (token) {
        jwt.verify(token, process.env.USER_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                res.redirect('/signin');
            } else {
                next();
            }
        })
    } else {
        res.redirect('/signin');
    }
}

//student auth middleware
const studentRequireAuth = (req, res, next) => {
    const token = req.cookies.studentjwt;

    //check if web token exists & verified
    if (token) {
        jwt.verify(token, process.env.STUDENT_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                next();
            }
        })
    } else {
        res.redirect('/login');
    }
}

// mpesa generate token middleware
const generateToken = async (req, res, next) => {
    const consumer = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_SECRET_KEY;

    const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");

    await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
            authorization: `Basic ${auth}`
        }
    })
        .then((result) => {
            console.log(result.data.access_token);
            token = result.data.access_token;
            next();
        })
        .catch((error) => {
            console.log(error.message);
            res.status(400).json(error.message);
        })
}

//routes
app.use('/', require('./routes/auth-route'));
app.use('/', require('./routes/setting-route'));
app.use('/', require('./routes/unit-route'));
app.use('/', require('./routes/attendance-route'));
app.use('/', require('./routes/course-route'));
app.use('/', require('./routes/fee-route'));
app.use('/user/', checkUser, requireAuth, require('./routes/user-route'));
app.use('/user/', checkUser, requireAuth, require('./routes/hall-route'));
app.use('/user/', checkUser, requireAuth, require('./routes/faculty-route'));
app.use('/user/', checkUser, requireAuth, require('./routes/student-route'));
app.use('/user/', checkUser, requireAuth, require('./routes/timetable-route'));
app.use('/user/', checkUser, requireAuth, require('./routes/fee-route'));
app.use('/user/', checkUser, requireAuth, require('./routes/pages-route'));

//student routes
app.use('/student/', checkStudent, studentRequireAuth, require('./routes/semester-route'));
app.use('/student/', checkStudent, studentRequireAuth, require('./routes/student-pages-route'));

//mpesa api routes
app.post('/lipa', generateToken, mpesaController.lipa);

//page not found
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' })
});