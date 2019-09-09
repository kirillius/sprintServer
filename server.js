// Входная точка backend приложения
var express = require("express"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    methodOverride = require("method-override"),
    request = require("request"),
    session = require("express-session"),
    passport = require("passport"),
    Sequelize = require("sequelize"),
    jwt = require('jwt-express');

var app = express();
var config = require('./app/config').getCurrentConfig(app);

app.locals.root_dir = __dirname ;
app.locals.app_dir = __dirname + '/app';
app.locals.public_dir = __dirname + '/public';

// Указание на frontend папку как публичную, подключение вспомогательных модулей в express.js
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(jwt.init('G598tjpa5IqzzBy6ZFti'));

app.use(session({
    secret: 'G598tjpa5IqzzBy6ZFti',
    resave: true,
    saveUninitialized: true
}));

require("./app/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Старт express.js приложения, установка на определенный порт
var server = app.listen(process.env.PORT || 2900, function () {
    var port = server.address().port;
    console.log("App now running on port " + port);
});

console.log(config)
var sequelize = new Sequelize(config.database.name, config.database.user, config.database.password, {
    host: config.database.server,
    dialect: config.database.dialect,

    pool: {
        max: 100,
        min: 0,
        idle: 20000,
        acquire: 120000
    },
    dialectOptions:{
        "port": config.database.port
    }
});

sequelize
    .authenticate()
    .then(function(err) {
        console.log('DB success connection');
        // force true for recreate database tables
        require('./app/models').init(sequelize, {force: false}, function(){
            console.log('Models created success, created init data');
            //require('./app/initData/index')(function() {
                //console.log('All init data created');
                require('./app/routes')(app, passport);
            //});
        });
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });

process.on('uncaughtException', function (err) {
    console.log('uncaughtException', err);
});

module.exports = app;
