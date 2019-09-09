let Sequelize = require("sequelize");

module.exports = function (sequelize, options, callback) {
    let Events = sequelize.define('events', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT
            },
            timeEvent: {
                type: Sequelize.DATE
            }
        }
    );

    Events.sync(options).then(function () {
        console.log('Success table events');
        callback();
    });

    return Events;
};