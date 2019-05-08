//including express
var express = require('express');
var app = express();
var path = require('path');

var cons = require('consolidate');

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');


var mongoose = require('mongoose');
mongoose.exports = app;

var CryptoJS = require("crypto-js");


var url = "mongodb+srv://vik:vikPassword@cluster0-arcoz.mongodb.net/WishingWell?retryWrites=true";

var donor_schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    creditcard: String
});

var donor = mongoose.model('donor', donor_schema);

var donee_schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    itemReq: []
});

var donee = mongoose.model('donee', donee_schema);


mongoose.connect(url, function(err, db) {
    if (err) console.log(err);
    console.log("Mongoose connected!");
});



//Middleware
var fs = require('fs');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 4040);
app.use(express.static(__dirname));

//routing function and error handling 
function serveStaticFile(res, path, contentType, responseCode) {
    if (!responseCode) responseCode = 200;
    fs.readFile(__dirname + path, function (err, data) {
        if (err) {
            res.writeHead(500, { 'Content-Tye': 'text/plain' });
            res.end('500 - Internal Error');
        }
        else {
            res.writeHead(responseCode, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function hashPW(password){
    var passhash = CryptoJS.MD5(password);
    return passhash;
}
    

//Routes
//Blank
app.get('/', function (req, res) {
    serveStaticFile(res, '/home.html', 'html', 200);
});

app.post('/login',function(req,res){
    var x = req.body.email;
    var p = hashPW(req.body.password);

    donor.find({
        email: x,
    }).then(res1 => {
        var obj = JSON.parse(JSON.stringify(res1[0]));
        console.log(obj);
        const name = obj.name;
        console.log(name);
        if(obj.password == p)
            res.render('account', {name: name, prog: "width:90%"});
            // res.redirect('/accountpage');
        else 
            res.redirect('/incorrectlogin');
    }).catch(err => {
        
        console.log(err);
        // res.redirect('/home');
    });
    donee.find({
        email: x,
    }).then(res1 => {
        var obj = JSON.parse(JSON.stringify(res1[0]));
        console.log(obj);
        const name = obj.name;
        console.log(name);
        if(obj.password == p)
            res.render('donee', {name: name, items: obj.itemReq});
            // res.redirect('/accountpage');
        else 
            res.redirect('/incorrectlogin');
    }).catch(err => {
        
        console.log(err);
        res.redirect('/home');
    });
});
//login
app.get('/login', function (req, res) {
    serveStaticFile(res, '/loginpage.html', 'html', 200);
});
//homepage
app.get('/home', function (req, res) {
    serveStaticFile(res, '/home.html', 'html', 200);
});

app.get('/subscribe', function (req, res) {
    serveStaticFile(res, '/subscribe.html', 'html', 200);
});

app.post('/register',function(req,res){

    var obj = new donee({ name: req.body.Name, email: req.body.Email, password: hashPW("qwer"), itemReq: [{item: req.body.itemReq, progress: 0}] });
    obj.save(function(err,res){
        if (err) console.log(err);
        console.log("Document Inserted");
    })
    res.redirect('/submitted');
});
app.post('/signup',function(req,res){
    console.log(req.body);
    var doc = {name: req.body.name, email: req.body.email, creditcard: req.body.creditcard, password: hashPW(req.body.password)};
    console.log(doc);
    var obj = new donor(doc);
    obj.save(function(err,res){
        if (err) console.log(err);
        console.log("Document Inserted");
    })
    res.redirect('/submitted');
});

app.post('/addItem', function(req,res){
    console.log({item: req.body.item, progress: 0});
    donee.findOneAndUpdate({email:req.body.email},{$push: {itemReq: [{item: req.body.item, progress: 0}]}}).then(resp =>{
        console.log(resp);
        console.log('-----------------------------------------------------')
        // console.log(JSON.parse(JSON.stringify(resp[0])));
        console.log('-----------------------------------------------------')


        res.render('donee1', {name: resp.name, items: resp.itemReq});
    }).catch(err => {
        console.log(err);
    });
});

app.get('/accountpage',function(req,res){
    serveStaticFile(res, '/account.html', 'html', 200);
});
app.get('/submitted',function(req,res){
    serveStaticFile(res, '/submitted.html', 'html', 200);
});
app.get('/incorrectlogin',function(req,res){
    serveStaticFile(res, '/incorrectlogin.html', 'html', 200);
});





// custom 404 page
app.use(function (req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});
// custom 500 page
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

//hosting the server and listing to the defined port
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});
