var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
const path = require('path');
var app = express();

app.set('port', 9000);
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
    next();
});


// middleware function to check for logged-in users
var auth = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 'loggedin': false, 'message': 'You are not logged in' }));
    }
};

// route for Home-Page
app.get('/', (req, res) => {
    var indexPg = path.join(__dirname, "/public/index.html");
    res.sendFile(indexPg);

});
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