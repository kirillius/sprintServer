module.exports = function(sequelize) {
    var controllers = [
        'tasks', 'labels', 'timesTasks'
    ];

    var result = {};
    controllers.forEach(function (controllerName) {
        result[controllerName] = require('./' + controllerName + '.controller')(sequelize);
    });

    return result;
};