let Sequelize = require("sequelize");

module.exports = function (sequelize, options, callback) {
    let TimesTasks = sequelize.define('timesTasks', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            timeBegin: {
                type: Sequelize.DATE
            },
            timeEnd: {
                type: Sequelize.DATE
            }
        }
    );

    TimesTasks.belongsTo(options.models.tasks, {as: 'task', foreignKey : 'taskId'});

    TimesTasks.sync(options).then(function () {
        console.log('Success table timesTasks');
        callback();
    });

    return TimesTasks;
};