//including express
var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.exports = app;

var url = "mongodb+srv://vikram:robinhood@cluster0-arcoz.mongodb.net/";

var donor_schema = new mongoose.Schema({
    email: String,
    password: String
});

var donor = mongoose.model('donor', donor_schema);

var donee_schema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
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


app.get('/fname-view', function (req, res) {
    udb.view('userViews', 'fName-view', { include_docs: false, key: req.query.name }, function (err, data) {
        if (!err) {
            console.log(data); res.send(data.rows[0].value)
        }
    })
console.log(__dirname);
});

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



//Routes
//Blank
app.get('/', function (req, res) {
    serveStaticFile(res, '/home.html', 'html', 200);
});

app.post('/login',function(req,res){
    var x = req.body.email;
    var p = req.body.password;

    donor.find({
        email: x,
    }).then(res1 => {
        var o = JSON.parse(JSON.stringify(res1[0]));
        
        if(o.password == p)
            res.redirect('/accountpage');
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
app.post('/account',function(req,res){
    var x = req.body.email;
    var p = req.body.password;

    var obj = new donor({ email: x, password: p});
    obj.save(function(err,res){
        if (err) return console.log(err);
        console.log("Document Inserted");
    })
    res.redirect('/submitted');
});
app.post('/register',function(req,res){
    var n = req.body.Name;
    var e = req.body.Email;
    var m = req.body.Message;
    var obj = new donee({ name: n, email: e, message: m });
    obj.save(function(err,res){
        if (err) console.log(err);
        console.log("Document Inserted");
    })
    res.redirect('/submitted');
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
