const LocalStrategy = require('passport-local');
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;


passport.use(new LocalStrategy(
    async(username, password, done) => {
        
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("myDB");
            if(await dbo.collection("myCollection").findOne({username: username, password: password}) != undefined){
                res.redirect('/home');
            }
            else{
              res.end('username or password is incorrect')
              //res.redirect('/login_error')
            }
          });
    }
))