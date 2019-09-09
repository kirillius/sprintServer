/**
 * Created by Lavrentev on 07.12.2016.
 */
module.exports = function(passport) {
    var LocalStrategy = require('passport-local').Strategy;
    var JwtStrategy = require('passport-jwt').Strategy; // авторизация через JWT
    var ExtractJwt = require('passport-jwt').ExtractJwt; // авторизация через JWT
    var jwt = require('jsonwebtoken');
    var helpers = require('./helpers');

    var jwtsecret = "G598tjpa5IqzzBy6ZFti";
    var jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
        secretOrKey: jwtsecret
    };

    passport.use(new JwtStrategy(jwtOptions, function (payload, callback) {
            helpers.auth.setDateLastLogin(payload.id)
            callback(null, payload)
        })
    );

    passport.use(new LocalStrategy({
        usernameField: 'login',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, login, password, callback) {
        helpers.auth.findUser(login, password).then(function(user) {
            if(!user)
                return callback({text: "Логин или пароль указаны неверно", status: 401}, null)

            var parseUser = JSON.parse(JSON.stringify(user));
            var payload = {
                login: login,
                id: parseUser.id
            };

            var token = jwt.sign(payload, jwtsecret) //здесь создается JWT
            helpers.auth.setDateLastLogin(parseUser.id)
            callback(null, {token: token, user: parseUser});
        })
    }));
}
