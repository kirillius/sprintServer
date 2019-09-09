let _ = require('lodash');
let TimesTasks = require('../models').timesTasks;
let Tasks = require('../models').tasks;
let async = require('async')
let moment = require('moment')

module.exports = function(sequelize) {
    return {
        startStopTask: function(req, res) {
            TimesTasks.findOne({
                where: {taskId: req.query.taskId, timeBegin: {$ne: null}, timeEnd: {$eq: null}}
            })
                .then(function (timesTask, err) {
                    if(!timesTask) {
                        if(!req.query.start)
                            return res.status(500).json({err: "not found task"})

                        let timesTaskCreate = {
                            timeBegin: moment().toDate(),
                            taskId: req.query.taskId
                        }
                        TimesTasks.create(timesTaskCreate)
                            .then(function (timesTask) {
                                res.status(200).json({started: true})
                            })
                            .catch(function(err) {
                                res.status(500).json(err)
                            });
                    }
                    else {
                        let timesTaskUpdate = _.clone(timesTask)
                        if(req.query.start)
                            timesTaskUpdate.dateBegin = moment().toDate()
                        else
                            timesTaskUpdate.dateEnd = moment().toDate()

                        timesTask.update(timesTaskUpdate)
                            .then(function(timesTask) {
                                res.status(200).json({updated: true})
                            }).catch(function(err) {
                            res.status(500).json({error: err})
                        });
                    }
                }).catch(function(err) {
                    res.status(500).json({error: err})
                });
        },
        getStatusTask: function(req, res) {
            TimesTasks.findOne({
                where: {taskId: req.query.taskId, timeBegin: {$ne: null}, timeEnd: {$eq: null}}
            })
                .then(function (timesTask, err) {
                    if(timesTask)
                        res.status(200).json({status: "taskStarted"})
                    else
                        res.status(200).json({status: "taskStoped"})
                }).catch(function(err) {
                    res.status(500).json({error: err})
                });
        }
    }
};