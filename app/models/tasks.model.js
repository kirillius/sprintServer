let Sequelize = require("sequelize");

module.exports = function (sequelize, options, callback) {
    let Tasks = sequelize.define('tasks', {
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
            deadline: {
                type: Sequelize.DATE
            }
        }
    );

    options.models.labels.hasMany(Tasks, {as: 'labels', foreignKey : 'labelId', onDelete: 'NO ACTION'});
    Tasks.belongsTo(options.models.labels, {as: 'label', foreignKey : 'labelId'});

    Tasks.sync(options).then(function () {
        console.log('Success table tasks');
        callback();
    });

    return Tasks;
};