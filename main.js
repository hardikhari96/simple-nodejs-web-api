var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
const path = require('path');
var app = express();

app.set('port', port = process.env.PORT || 80);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    console.log(req.session.user, "session data");
    console.log(req.cookies.user_sid, "cookies data ")
    next();
});

app.use('/', express.static('public'))

// middleware function to check for logged-in users
var auth = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 'loggedin': false, 'message': 'You are not logged in' }));
    }
};

//check only login vie api request if needed
app.get('/checklogin', auth, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'loggedin': true, 'message': 'You Are logged in' }));
});

app.get('/loginhere', (req, res) => {
    req.session.user = 12314787121;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'loggedin': true, 'message': 'You logged in' }));
});


// route for user logout 
app.get('/logouthere', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.end(JSON.stringify({ 'loggedin': false, 'message': 'logged out successfully' }));
    } else {
        res.end(JSON.stringify({ 'loggedin': true, 'message': 'Loggedout error' }));
    }
});

app.use(function(req, res, next) {
    res.status(404).end(JSON.stringify({ 'success': false, 'loggedin': false, 'error': 404 }));
});
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));