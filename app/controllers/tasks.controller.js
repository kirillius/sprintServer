let _ = require('lodash');
let Tasks = require('../models').tasks;
let Labels = require('../models').labels;
let async = require('async')

module.exports = function(sequelize) {
    return {
        getTasks: function(req, res) {
            Tasks.findAll({
            }).then(function (attributes, err) {
                res.status(200).json(attributes);
            });
        },
        showTasks: function(req, res) {
            Tasks.findOne({
                where: {id: req.params.id},
                include: [
                    {model: Labels, as: 'label', foreignKey: 'labelId'}
                ]
            })
                .then(function (parameter, err) {
                    res.status(200).json(parameter);
                });
        },
        createTasks: function(req, res) {
            Tasks.create(_.pick(req.body, ['name', 'description', 'deadline', 'labelId']))
                .then(function (task) {
                    return Tasks.findOne({
                        where: {id: task.id},
                        include: [{model: Labels, as: 'label', foreignKey: 'labelId'}]
                    }).then(function(task) {
                        res.status(200).json(task)
                    })
                })
                .catch(function(err) {
                    res.status(500).json(err)
                });
        },
        updateTasks: function(req, res) {
            Tasks.findOne({
                where: {id: req.params.id}
            }).then(function(task) {
                task.update(_.pick(req.body, ['name', 'description', 'deadline', 'labelId']))
                    .then(function(task) {
                        Tasks.findOne({
                            where: {id: task.id},
                            include: [
                                {model: Labels, as: 'label', foreignKey: 'labelId'}
                            ]
                        }).then(function(task) {
                            res.status(200).json(task)
                        })
                    }).catch(function(err) {
                    res.status(500).json({error: err})
                });
            })
        },
        deleteTasks: function(req, res) {
            Tasks.findOne({where: {id: req.params.id}}).then(function (task) {
                task.destroy({force: true})
                    .then(function() {
                        res.status(200).json({deleted: true})
                    })
                    .catch(function(err) {
                        res.status(500).json(err)
                    });
            });
        }
    }
};