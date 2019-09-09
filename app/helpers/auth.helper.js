/**
 * Created by Lavrentev on 14.03.2017.
 */
let _ = require('lodash');
let md5 = require('md5');
let Promise = require('bluebird');
let jwt = require('jsonwebtoken');
let moment = require('moment')
let async = require('async')

var AuthHelper = {
    checkAuth: function(req, passport) {
        return new Promise(function (resolve, reject) {
            if(!req.headers['Authorization'])
                return resolve(false)

            passport.authenticate('jwt', function(err, passportUser) {
                if(err)
                    return reject(err)

                if(!passportUser)
                    return resolve(false)

                if(passportUser)
                    return resolve(true)

                return resolve(false)
            })
        })
    },
    checkToken: function(passport, getUserId) {
        return function (req, res, next) {
            passport.authenticate('jwt', function(err, passportUser) {
                if(err || !passportUser)
                    if(getUserId)
                        res.locals.user = null
                    else
                        return res.status(401).send("Unauthorized");

                if(passportUser)
                    res.locals.user = passportUser

                next()
            })(req, res, next)
        }
    },
    registerOAuth: function(req) {
        return new Promise(function (resolve, reject) {
            var User = require('../models').user;
            var jwt = require('jsonwebtoken');
            var jwtsecret = "G598tjpa5IqzzBy6ZFti";

            var fieldBySocial = {
                "VK": "vkToken",
                "Facebook": "facebookToken",
                "Google": "googleToken"
            }
            var where = {
                uid: req.body.uid
            };
            //where[fieldBySocial[req.body.socialName]] = req.body.token;
			
			console.log("req.body")
					console.log(req.body)

            User.findOne({where: where})
                .then(function(user) {
                    if(user) {
                        let parseUser = JSON.parse(JSON.stringify(user));
                        let payload = {
                            token: req.body.token,
                            id: parseUser.id,
                            socialName: req.body.socialName,
                            uid: parseUser.uid
                        };
						
						user.update(_.pick(req.body, ['name', 'email']))
							.then(function() {
								User.findById(parseUser.id).then(function(updatedUser) {
									let parseUserUpdated = JSON.parse(JSON.stringify(updatedUser))
									let token = jwt.sign(payload, jwtsecret) //здесь создается JWT
									return resolve({token: token, newUser: false, user: parseUserUpdated});
								}).catch(function(err) {
									let token = jwt.sign(payload, jwtsecret) //здесь создается JWT
									return resolve({token: token, newUser: false, user: parseUser});
								})
							}).catch(function(err) {
									let token = jwt.sign(payload, jwtsecret) //здесь создается JWT
									return resolve({token: token, newUser: false, user: parseUser});
							})
                    }

                    var infoUser = _.pick(req.body, ['name', 'language', 'uid', 'email']);
                    infoUser[fieldBySocial[req.body.socialName]] = req.body.token;

                    User.create(infoUser)
                        .then(function(newUser) {
                            var parseUser = JSON.parse(JSON.stringify(newUser));
                            var payload = {
                                token: req.body.token,
                                id: parseUser.id,
                                socialName: req.body.socialName,
                                uid: parseUser.uid
                            };

                            var token = jwt.sign(payload, jwtsecret) //здесь создается JWT
                            AuthHelper.setDateLastLogin(parseUser.id)
                            resolve({token: token, newUser: true, user: parseUser})
                        }).catch(function(err) {
                        reject(err)
                    });
                });
        })
    },
    register: function(req) {
        return new Promise(function (resolve, reject) {
            var User = require('../models').user;
            User.findOne({where: {login: req.body.login}})
                .then(function(user) {
                    if(user)
                        return reject({status: 401, text: "Пользователь с таким логином уже существует"});

                    var infoUser = _.pick(req.body, ['name', 'login', 'language', 'email']);
                    infoUser.password = md5(req.body.password);

                    User.create(infoUser)
                        .then(function(newUser) {
                            var parseUser = JSON.parse(JSON.stringify(newUser));
                            var jwtsecret = "G598tjpa5IqzzBy6ZFti";
                            var payload = {
                                login: req.body.login,
                                id: parseUser.id
                            };

                            var token = jwt.sign(payload, jwtsecret) //здесь создается JWT
                            AuthHelper.setDateLastLogin(parseUser.id)
                            resolve({token: token, user: parseUser})
                        }).catch(function(err) {
                            reject(err)
                        });
                });
        })
    },
    findUser: function(login, password) {
        return new Promise(function (resolve, reject) {
            var User = require('../models').user;
            var Role = require('../models').role;
            var Permission = require('../models').permission;
            User.findOne({
                where: {login: login, password: md5(password)},
                include: [
                    {
                        model: Role,
                        as: 'roles',
                        include: [
                            {model: Permission, as: 'permissions'}
                        ]
                    }
                ]
            })
                .then(function(user) {
                    var parseUser = JSON.parse(JSON.stringify(user))
                    if(!parseUser)
                        return reject({err: "not found user"})

                    var permissionsUser = []
                    async.each(parseUser.roles, function (role, eachRole) {
                        if (role.permissions && role.permissions.length){
                            permissionsUser = permissionsUser.concat(_.map(role.permissions, function(permission) {
                                return permission.name || ''
                            }))
                        }
                        eachRole()
                    }, function() {
                        parseUser.permissions = permissionsUser;
                        parseUser.roles = _.map(parseUser.roles, function(role) {
                            return role.name
                        })
                        return resolve(parseUser)
                    });
                }).catch(function(err) {
                    return reject(err)
            });
        })
    },
    setDateLastLogin: function(userId) {
        var User = require('../models').user;
        User.findOne({
            where: {id: userId}
        })
            .then(function (user, err) {
                var parseUser = JSON.parse(JSON.stringify(user))
                if(!parseUser.dateLastLogin || !moment(parseUser.dateLastLogin).isSame(moment().startOf('day')))
                    user.update({dateLastLogin: moment().startOf('day').toDate()}).then(function() {
                        console.log("user updated")
                    }).catch(function(err) {
                        console.log(err)
                    });
            });
    },
	restorePassword: function(req, res) {
        res.status(200).json({ok: true})
        let User = require('../models').user;
        let CommonHelper = require('./common.helper')
        let md5 = require('md5');
        let where = {}

        if(!req.body.login && !req.body.email)
            return

        if(req.body.login)
            where.login = req.body.login

        if(req.body.email)
            where.email = req.body.email

        User.findOne({
            where: where
        })
            .then(function (user) {
                if(!user)
                    return;

                let parseUser = JSON.parse(JSON.stringify(user))
                let newPassword = CommonHelper.generateString()

                //запишем юзеру новый пароль и отправим его на почту юзеру
                async.parallel({
                    updateUser: function(callback) {
                        user.update({password: md5(newPassword)}).then(function() {
                            console.log("user updated")
                            callback(null, true)
                        }).catch(function(err) {
                            console.log(err)
                            callback(err, null)
                        });
                    },
                    sendPassword: function(callback) {
                        let text = "Здравствуйте. Вы запросили сброс пароля в приложении Face Reader Prof. Ваш новый пароль: "+newPassword;
                        CommonHelper.sendEmail("Face Reader Prof. Восстановление пароля", text, undefined, parseUser.email);
                        callback(null, true)
                    }
                }, function(err, results) {
                })
            });
    }
}

module.exports = AuthHelper