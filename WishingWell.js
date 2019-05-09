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
    creditcard: String,
    donations: []
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
    var donees;
    var dList;
    var count;
    var flag = 0;
    donee.find({}).then(function (res1) {
        console.log(res1);
        donees = res1;
        console.log(donees);
        
    var r1 = Math.floor((Math.random() * count));
    var r2 = Math.floor((Math.random() * 1));

    var r3 = Math.floor((Math.random() * count));
    var r4 = Math.floor((Math.random() * 1));
    console.log(donees[r1]);
    console.log(donees[r3]);
        dList = {
            n1: donees[r1].name, 
            i1: donees[r1].itemReq[0].item, 
            p1: donees[r1].itemReq[0].progress, 
            n2: donees[r3].name, 
            i2: donees[r3].itemReq[0].item, 
            p2: donees[r3].itemReq[0].progress}; 
    }).catch(err => console.log(err));

    donee.countDocuments({}, function (err, c) {
        count = c;
        console.log(count);

    });


    console.log(donees);

    console.log(dList);
    donor.find({
        email: x,
    }).then(res1 => {
        console.log(res1);
        var obj = JSON.parse(JSON.stringify(res1[0]));
        console.log(obj);

        const name = obj.name;
        if(obj.password == p){
            res.render('account', {name: name, dList: dList});
            flag = 1;
        }
            
        else 
            res.redirect('/incorrectlogin');
    }).catch(err => {
        console.log(err);
    });
    if (flag == 0){
        donee.find({
            email: x,
        }).then(res1 => {
            var obj = JSON.parse(JSON.stringify(res1[0]));
            console.log(obj);
            const name = obj.name;
            console.log(name);
            if(obj.password == p)
                res.render('donee', {name: name, items: obj.itemReq});
            else 
                res.redirect('/incorrectlogin');
        }).catch(err => {
            
            console.log(err);
            res.redirect('/home');
        });
    }
    
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
app.get('/search', function (req, res) {
    serveStaticFile(res, '/search.html', 'html', 200);
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
    var doc = {name: req.body.name, email: req.body.email, creditcard: req.body.creditcard, password: hashPW(req.body.password), donations: []};
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

        res.render('donee1', {name: resp.name, items: resp.itemReq});
    }).catch(err => {
        console.log(err);
    });
});

function func(it, req) {
    donee.findOneAndUpdate({name:req.body.name},{itemReq:it}).then(resp =>{
        console.log(resp);
        // res.render('account1', {name: resp.name, items: resp.itemReq});
    }).catch(err => {
        console.log(err);
    });
    return true;
}

app.post('/donation', function(req,res){
    var it;
    donee.find({
        name: req.body.name,
    }).then(res1 => {
        console.log(res1);
        var obj = JSON.parse(JSON.stringify(res1[0]));
        console.log(obj);
        it = obj.itemReq;
        for (var i = 0; i < it.length; i++) {
            //Do something

            if(String(req.body.item) == String(it[i].item)){
                it[i].progress = Number(it[i].progress) + Number(req.body.percent);
                console.log(it[i].progress);
            }
        }
        console.log(it);


        setTimeout(function(){
            donee.findOneAndUpdate({name:req.body.name},{itemReq:it}).then(resp =>{
                console.log(resp);
            }).catch(err => {
                console.log(err);
            });
        }, 200);

        setTimeout(function(){
            console.log(req.body.email);
            donor.findOneAndUpdate({name:req.body.email},{$push: {donations: [{donee: req.body.name, progress: req.body.percent}]}}).then(resp =>{
                console.log(resp);
                res.render('account1', {name: resp.name, items: resp.donations});
            }).catch(err => {
                console.log(err);
            });
        }, 600);

    }).catch(err => {
        
        console.log(err);
        res.redirect('/home');
    });


});

function f(y, x){
    return donee.findOneAndUpdate({name:x},{itemReq:y});
}

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
    serveStaticFile(res, '/404page.html', 'html', 404);
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
