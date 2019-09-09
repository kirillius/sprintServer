var _ = require('lodash');

module.exports = {
    'general': {
        database: {
            user: 'kirillius',
            name: 'sprintApp',
            dialect: 'postgres',
            port: 5432
        }
    },
    'production': {
        database: {
            user: 'e2Server',
            password: 'fwVkLi9cCLwEKURL7xws',
            server: 'localhost',
            dialect: 'postgres',
            port: 5432
        }
    },
    'test': {
        database: {
            user: 'e2User',
            password: 'kirillius1991',
            server: '185.158.153.107',
            dialect: 'mssql',
            port: 1433
        }
    },
    'development': {
        database: {
            user: 'kirillius',
            password: 'kirillius1991',
            server: '127.0.0.1',
            dialect: 'mssql',
            port: 1433
        }
    },
    'getCurrentConfig': function(app){
        var defaultEnvironment = 'development';

        if(!app)
            app = {};
        return _.merge({}, this.general, this[app.get('env') || defaultEnvironment]);
    }
};