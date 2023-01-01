var express = require('express');
var path = require('path');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session');  // session middleware
//const { Passport } = require("passport");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const connectEnsureLogin = require('connect-ensure-login'); //authorization


//const db = require('./db');
//const user = require('./userModel')


var app = express();

var substring;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Configure Sessions Middleware
app.use(session({
  secret: 'some secret',
  cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

//var MongoClient = require('mongodb').MongoClient;
var dbURL = "mongodb://127.0.0.1:27017";
var db;

// Initialize connection once
const connect = MongoClient.connect(dbURL, function(err, client) {
  if(err) return console.error(err);

  db = client.db('myDB');
  // the Mongo driver recommends starting the server here 
  // because most apps *should* fail to start if they have no DB.
  // If yours is the exception, move the server startup elsewhere. 
});

passport.use("local-signup",
  new LocalStrategy(
    async function(username, password, done){
        const x = await db.collection("myCollection").findOne({username: username});
        if(x) console.log("why")

        await db.collection("myCollection").findOne({username: username}, function(err, user){
          if(err) return done(err)
          
          if(username === "" || password === "" || user) return done(null, false, {message: 'Username and Password cannot be empty'})

          if(!user) { 

          const myObj = {
            username: username, 
            password: password,
            wantToGoList: [String]
           };
            db.collection("myCollection").insertOne(myObj,function(err, res) {  
             if (err) throw err;  
              console.log("1 record inserted");
               // db.close();  
              }); 
            //res.redirect('/reg_suc')
            return done(null, myObj)
          }
        })
       
    }
  )
)

passport.use("local-login",
  new LocalStrategy(
  async function(username, password, done) {
      if(username === "admin" && password === "admin") return done(null, {username: "admin", password: "admin"})
      var collection = "myCollection"
      await db.collection("myCollection").findOne({username: username, password: password}, function(err, user){
      // if there is an error
      if (err) { return done(err); }
      // if user doesn't exist
      if (!user) { return done(null, false, { message: 'User not found.' }); }
      // if the password isn't correct
      // if (!user.verifyPassword(password)) { return done(null, false, {   
      // message: 'Invalid password.' }); }
      // if the user is properly authenticated
      return done(null, user);
    });
}
)
)

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//GET ejs
app.get('/registration', function(req, res){
   res.render('registration');
});

app.get('/', function(req, res){  
   res.render('login');
});

app.get('/home', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
   res.render('home');
});

app.get('/annapurna', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
  res.render('annapurna');
});

app.get('/bali', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
  res.render('bali');
});

app.get('/cities', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => { 
  res.render('cities');
});

app.get('/hiking', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
   res.render('hiking');
});

app.get('/inca', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
   res.render('inca');
});

app.get('/islands', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
   res.render('islands');
});

app.get('/paris', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
   res.render('paris');
});

app.get('/rome', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
   res.render('rome');
});

app.get('/santorini', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
   res.render('santorini');
});

const destination = ["Inca Trail to Machu Picchu", "Annapurna Circuit", "Paris", "Rome", "Bali Island", "Santorini Island"];

app.get('/searchresults', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
  var Destinations = "Destinations:"
  var notfound = ""
  var searchresults = [];
  var sub = req.query.value1.toLowerCase();
  var links = [];
  for(let i = 0; i < destination.length; i++){
    dest = destination[i].toLowerCase();
    console.log(dest)
    console.log(sub)
    if(dest.includes(sub)){
      if(dest ==="inca trail to machu picchu") searchresults.push([destination[i],"/inca"]);
      else if(dest === "annapurna circuit") searchresults.push([destination[i], "/annapurna"])
      else if(dest === "paris") searchresults.push([destination[i], "/paris"])
      else if(dest === "rome") searchresults.push([destination[i], "/rome"])
      else if(dest === "bali island") searchresults.push([destination[i], "/bali"])
      else if(dest === "santorini island") searchresults.push([destination[i], "/santorini"])
    }
  }
  if(searchresults.length === 0){
     notfound = "Not Found";
     Destinations = ""
  }
     res.render('searchresults', {
    searchresults: searchresults,
    not_found: notfound,
    Destinations: Destinations,
   });
});

app.get('/wanttogo', connectEnsureLogin.ensureLoggedIn('/'), (req, res) => {
  db.collection('myCollection').findOne({username: req.user.username}, function(err, user){
    var destinations = user.wantToGoList;
    res.render('wanttogo', {
      destinations: destinations
    });
  })
});

app.get('/reg_suc', function(req, res){
  res.render('reg_suc');
});

app.get('/loginError', function(req, res){
  res.render('loginError')
})

app.get('/regError', function(req, res){
  res.render('regError')
})


app.use(passport.initialize());
app.use(passport.session());




app.post('/search', function(req, res){

  var newsubstring = req.body.Search;
  var url =  '/searchresults?value1=' + newsubstring
  res.redirect(url);
});



const url = "mongodb://127.0.0.1:27017";

//Login

app.post('/',
  passport.authenticate('local-login', { failureRedirect: '/loginError' }),
  function(req, res, next){
    res.redirect('/home')
  }
  );


//Register

app.post('/register',
  passport.authenticate('local-signup', { failureRedirect: '/regError' }),
  (req, res, next) => {
  // sign up
  res.redirect('/reg_suc')
  }
  );

  //Bali
  app.post('/addtowantbali',
  async function(req, res) {

      db.collection("myCollection").findOne({username: req.user.username}, function(err, user){
        if(err) res.send('Error')
        
        if(user.wantToGoList.includes('Bali Island')) res.end('Destination already in Want-To-Go-List')
        
       
        else{
          db.collection("myCollection").updateMany({username: req.user.username},
          {$addToSet: {"wantToGoList": "Bali Island"}})
          res.redirect('/home')
        }
      })
  }
  )

  //Annapurna
  app.post('/addtowantannapurna',
  async function(req, res) {

      db.collection("myCollection").findOne({username: req.user.username}, function(err, user){
        if(err) res.send('Error')
        
        if(user.wantToGoList.includes('Annapurna Circuit')) res.end('Destination already in Want-To-Go-List')
        
       
        else{
          db.collection("myCollection").updateMany({username: req.user.username},
          {$addToSet: {"wantToGoList": "Annapurna Circuit"}})
          res.redirect('/home')
        }
      })
  }
  )

  //Inca
  app.post('/addtowantinca',
  async function(req, res) {

      db.collection("myCollection").findOne({username: req.user.username}, function(err, user){
        if(err) res.send('Error')
        
        if(user.wantToGoList.includes('Inca Trail to Machu Picchu')) res.end('Destination already in Want-To-Go-List')
        
       
        else{
          db.collection("myCollection").updateMany({username: req.user.username},
          {$addToSet: {"wantToGoList": "Inca Trail to Machu Picchu"}})
          res.redirect('/home')
        }
      })
  }
  )

  //Paris
  app.post('/addtowantparis',
  async function(req, res) {

      db.collection("myCollection").findOne({username: req.user.username}, function(err, user){
        if(err) res.send('Error')
        
        if(user.wantToGoList.includes('Paris')) res.end('Destination already in Want-To-Go-List')
        
       
        else{
          db.collection("myCollection").updateMany({username: req.user.username},
          {$addToSet: {"wantToGoList": "Paris"}})
          res.redirect('/home')
        }
      })
  }
  )

  //Rome
  app.post('/addtowantrome',
  async function(req, res) {

      db.collection("myCollection").findOne({username: req.user.username}, function(err, user){
        if(err) res.send('Error')
        
        if(user.wantToGoList.includes('Rome')) res.end('Destination already in Want-To-Go-List')
        
       
        else{
          db.collection("myCollection").updateMany({username: req.user.username},
          {$addToSet: {"wantToGoList": "Rome"}})
          res.redirect('/home')
        }
      })
  }
  )

  //Santorini
  app.post('/addtowantsantorini',
  async function(req, res) {

      db.collection("myCollection").findOne({username: req.user.username}, function(err, user){
        if(err) res.send('Error')
        
        if(user.wantToGoList.includes('Santorini Island')) res.end('Destination already in Want-To-Go-List')
        
       
        else{
          db.collection("myCollection").updateMany({username: req.user.username},
          {$addToSet: {"wantToGoList": "Santorini Island"}})
          res.redirect('/home')
        }
      })
  }
  )
  const PORT = process.env.PORT || 3030;

  // your code
  
  app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
  });