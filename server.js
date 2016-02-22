var express = require('express');
var mysql = require('mysql');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var Sequelize = require('sequelize');
var bcrypt = require('bcryptjs');

var sequelize = new Sequelize('rcb_authentication_db', 'root');

var PORT = process.env.NODE_ENV || 8000;

var app = express();

var passport = require('passport');
var passportLocal = require('passport-local');

app.use(require('express-session')({
    secret: 'deborah 4e5d5f13sd2f4s5df3835qa',
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 14
    },
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

//passport use methed as callback when being authenticated
passport.use(new passportLocal.Strategy(function(username, password, done) {
    //check password in db
    User.findOne({
        where: {
            username: email
        }
    }).then(function(user) {
        //check password against hash
        if (user) {
            bcrypt.compare(password, user.dataValues.password, function(err, user) {
                if (user) {
                    //if password is correct authenticate the user with cookie
                    done(null, {
                        id: username,
                        username: username
                    });
                } else {
                    done(null, null);
                }
            });
        } else {
            done(null, null);
        }
    });
}));

//change the object used to authenticate to a smaller token, and protects the server from attacks
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    done(null, {
        id: id,
        username: id
    })
});


//Initializing Handlebars
app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
  extended: false
}));


// Defining Student Table
var Student = sequelize.define('Student', {
  email: {
    type: Sequelize.STRING,
    unique:true,
    validate: {
      len: {
          args: [5,40],
      },
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    validate: {
      len: {
        args: [8,20],
        msg: "your password must contain at least 8 characters"
      }
    }
  }
}, {
  hooks: {
      beforeCreate: function(input){
        input.password = bcrypt.hashSync(input.password, 10);
      }
    }
});


var Teacher = sequelize.define('Teacher', {
  email: {
    type: Sequelize.STRING,
    unique:true,
    allowNull: false,
    validate: {
      len: {
          args: [5,40],
      },
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8,20],
        msg: "your password must contain at least 8 characters"
      }
    }
  },
  role:{
    type: Sequelize.STRING
  }
}, {
  hooks: {
      beforeCreate: function(input){
        input.password = bcrypt.hashSync(input.password, 10);
      }
    }
});

Teacher.hasMany(Student);

app.post('/register/student', function(req, res) {
    Student.create(req.body).then(function(user) {
        res.redirect('/?msg=' + 'you are registered');
    }).catch(function(err) {
        console.log(err);
        res.redirect('/?msg=' + err.message);
    });
})

app.post('/register/teacher', function(req, res) {
    Teacher.create(req.body).then(function(user) {
        res.redirect('/?msg=' + 'you are registered');
    }).catch(function(err) {
        console.log(err);
        res.redirect('/?msg=' + err.message);
    });
})

app.get('/', function(req, res){
  res.render('home', {
    msg: req.query.msg
  });
});

app.get('/login', function(req, res) {
    res.render('login');
});

sequelize.sync().then(function(){
app.listen (PORT, function(){
  console.log("Listening at %s", PORT);
});
});