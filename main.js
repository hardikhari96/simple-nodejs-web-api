var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
const path = require('path');
var app = express();
// For image upload
var multer = require('multer');

var fs = require("fs");


app.set('port', port = process.env.PORT || 8080);
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

app.use(function(req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  next();
});
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    //console.log(req.session.user, "session data");
    //console.log(req.cookies.user_sid, "cookies data ")
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
    res.end(JSON.stringify({ 'loggedin': true, 'message': 'You Are logged in','user':req.session.user }));
});

app.get('/loginhere', (req, res) => {
    req.session.user = 'hari';
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'loggedin': true, 'message': 'You logged in','user':req.session.user}));
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


// for image upload

var upload = multer({ dest: '/tmp/' });
var multerMiddleware = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'test', maxCount: 1 },{ name: 'other', maxCount: 1 }]);

function uploadfile(files,name,dest,callback){
	
	if(Object.keys(files).indexOf(name) >= 0){
		// console.log(Object.keys(files));
		// console.log(Object.keys(files).indexOf(name));
		// console.log(Object.keys(files).indexOf(name) >= 0);
		if (!fs.existsSync(dest)){
				fs.mkdirSync(dest);
			}
			var to = dest +'/' + files[name][0].filename + path.extname(files[name][0].originalname);
			
			try {
				 fs.rename(files[name][0].path,to, function(err,example) {
					if (err) {
						callback(err,null);
						console.log(err,'response')
					} else {
						callback(err,to);
					}
				}); 
				return to;
			} catch (err) {
				return false
			}	
	}else{
		return false;
	}
	

}
const removeDir = function(path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(function(filename) {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
          removeDir(path + "/" + filename)
        } else {
          fs.unlinkSync(path + "/" + filename)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
  } else {
    //console.log("Directory path not found.")
  }
}

app.post('/uploadfilehere', [auth,multerMiddleware], function(req, res) {
 

  // create root folder 
	var uploads = 'uploads';
	
	if (!fs.existsSync(uploads)){
		fs.mkdirSync(uploads);
	}
	
	//create user folder

	var newdir = 'uploads/'+req.body.folder;
	
	// remove existing
	
	removeDir(newdir)

	
	// upload file name `file`
	var thiii = uploadfile(req.files,'file',newdir,function(err,response){
		//console.log(response,'response') 
	});
	var thiii2 = uploadfile(req.files,'test',newdir,function(err,response){
		//console.log(response,'response') 
	});
	var thiii3 = uploadfile(req.files,'other',newdir,function(err,response){
		//console.log(response,'response') 
	});
	
	thiii  == false? thiii  = false : thiii ='http://localhost:8080/'+thiii,
	thiii2 == false? thiii2 = false : thiii2  ='http://localhost:8080/'+thiii2,
	thiii3 == false? thiii3 = false : thiii3 ='http://localhost:8080/'+thiii3
	
	res.json({
			message: 'File uploaded successfully',
			thiii : thiii,
			thiii2 : thiii2,
			thiii3 : thiii3
		});
	
	
});

app.use('/uploads',auth,express.static('uploads'));


app.use(function(req, res, next) {
    res.status(404).end(JSON.stringify({ 'success': false, 'loggedin': false, 'error': 404 }));
});
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));