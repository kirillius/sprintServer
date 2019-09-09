var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var AuthHelper = require('./auth.helper')
var Promise = require('bluebird');
var request = require('request');

module.exports = {
    prepareResponse: function(res){
        return function(result) {
            res.status(200).json(result);
        }
    },
    errorResponse: function (res) {
        return function(error) {
            console.log("err: ");
            console.log(error);

            res.status(500).json(error);
        }
    },
    generateMainPage : function(passport) {
        return function (req, res, next) {
            AuthHelper.checkAuth(req, passport).then(function(result) {
                //if(result)
                    res.sendfile('./public/main.html');
                //else
                    //res.sendfile('./public/auth.html');
            }).catch(function(err) {
                res.status(500).json(err)
            })

            //res.sendfile(path.resolve('../public/auth.html'));
            //res.sendfile(path.resolve('./public/main.html'));
        }
    },
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
	generateString:function() {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 6; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    sendRequest: function(url, params) {
        return new Promise(function (resolve, reject) {
            request.post({
                url:     url,
                json: JSON.stringify(params)
            }, function(error, response, body){
                if(error)
                    return reject(error);

                resolve(body);
            });
        })
    }
};