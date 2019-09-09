let Sequelize = require("sequelize");

module.exports = function (sequelize, options, callback) {
    let Labels = sequelize.define('labels', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING
            }
        }
    );

    Labels.sync(options).then(function () {
        console.log('Success table labels');
        callback();
    });

    return Labels;
};