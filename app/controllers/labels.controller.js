let _ = require('lodash');
let Labels = require('../models').labels;
let async = require('async')

module.exports = function(sequelize) {
    return {
        getLabels: function(req, res) {
            Labels.findAll({
            }).then(function (labels, err) {
                res.status(200).json(labels);
            });
        },
        showLabels: function(req, res) {
            Labels.findOne({
                where: {id: req.params.id}
            })
                .then(function (labels, err) {
                    res.status(200).json(labels);
                });
        },
        createLabels: function(req, res) {
            Labels.create(_.pick(req.body, ['name']))
                .then(function (label) {
                    return Labels.findOne({
                        where: {id: label.id}
                    }).then(function(label) {
                        res.status(200).json(label)
                    })
                })
                .catch(function(err) {
                    console.log("err")
                    console.log(err)
                    res.status(500).json(err)
                });
        },
        updateLabels: function(req, res) {
            Labels.findOne({where: {id: req.params.id}}).then(function(label) {
                label.update(_.pick(req.body, ['name']))
                    .then(function(label) {
                        Labels.findOne({where: {id: label.id}}).then(function(label) {
                            res.status(200).json(label)
                        })
                    }).catch(function(err) {
                    res.status(500).json({error: err})
                });
            })
        },
        deleteLabels: function(req, res) {
            Labels.findOne({where: {id: req.params.id}}).then(function (label) {
                label.destroy({force: true})
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