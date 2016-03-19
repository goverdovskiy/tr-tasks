// ReSharper disable UseOfImplicitGlobalInFunctionScope
(function() {
    global.npm = {};

    var refs = ['http', 'fs', 'path', 'url', 'util'];
    refs.forEach(function(module) { npm[module] = require(module); });
    
    npm.NB = require('nodebrainz');
    
    npm.html = require('./html');
    npm.routing = require('./routing');
    npm.tools = require('./tools');

    require('./server');
})();
