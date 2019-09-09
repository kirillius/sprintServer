let _ = require('lodash');

module.exports = function(app, passport){

    let controllers = require('./controllers')();
    let helpers = require('./helpers');

    //Define all routes
    defineRestResource('tasks');
    //defineRestResource('events');
    defineRestResource('labels');

    app.post('/login', function(req, res, next) {
        passport.authenticate('local', function(err, passportUser) {
            if(err) {
                return res.status(err.status ? err.status : 500).json(err)
            }

            res.json(passportUser);
        })(req, res, next)
    });

    app.post('/register', function(req, res, next) {
        helpers.auth.register(req).then(function(user) {
            res.json(user);
    }).catch(function(err) {
            res.status(err.status ? err.status : 500).json(err)
        })
    });

    app.post('/loginOAuth', function(req, res) {
        helpers.auth.registerOAuth(req).then(function(token) {
            res.json(token);
        }).catch(function(err) {
            res.status(500).json(err)
        })
    });

    app.get('/api/checkToken', helpers.auth.checkToken(passport), function(req, res) {
        res.status(200).json({"ok": true});
    });

    //app.get("/api/pdf_report", helpers.auth.checkToken(passport, true), controllers.report.generatePDFReport);
    app.get('/api/startStopTask', controllers.timesTasks.startStopTask);
    app.get('/api/getStatusTask', controllers.timesTasks.getStatusTask);
    app.get("/*", helpers.common.generateMainPage(passport));

    function defineRestResource(modelName){
        let UpperFirstName = _.upperFirst(modelName);

        let controller = controllers[modelName];
        
        app.get("/api/" + modelName, controller['get' + UpperFirstName]); //helpers.auth.checkToken(passport)
        app.get("/api/" + modelName + "/:id", controller['show' + UpperFirstName]); //helpers.auth.checkToken(passport, true)

        if(controller['create' + UpperFirstName])
            app.post("/api/" + modelName, controller['create' + UpperFirstName]);

        if(controller['update' + UpperFirstName])
            app.put("/api/" + modelName + "/:id", controller['update' + UpperFirstName]);

        if(controller['delete' + UpperFirstName])
            app.delete("/api/" + modelName + "/:id", controller['delete' + UpperFirstName]);

        console.log('rest routes for resource ' + modelName + ' is defined');
    }
};