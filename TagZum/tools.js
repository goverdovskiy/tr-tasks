// ReSharper disable once UseOfImplicitGlobalInFunctionScope
(function() {
    Object.defineProperty(Object.prototype, 'forEachProp', {
        value: function(action, arg) {
            for (var key in this) {
                action.call(this, key, this[key], arg);
            }
            return this;
        }
    });

    var me = {};

    me.types = {
        html: 'text/html',
        text: 'text/plain',
        css: 'text/css',
        jpg: 'image/jpg',
        js: 'text/javascript'
    }.forEachProp(function(typeName) {
        this[typeName] += ';charset=utf-8';
    });

    me.getFileHandler = function(path, type) {
        return function(request, response) {
            npm.path.exists(path, function(success) {
                if (success) {
                    npm.fs.readFile(path, function(error, content) {
                        if (!error) {
                            me.writeEnd(response, 200, { 'Content-Type': type }, content);
                        } else {
                            npm.tools.writeError(response);
                        }
                    });
                } else {
                    npm.tools.writeError(response, 404);
                }
            });
        };
    };

    me.writeEnd = function(response, code, headers, content) {
        response.writeHead(code, headers);
        response.end(content);
    };

    me.writeHtmlEnd = function(response, content) {
        me.writeEnd(response, 200, { 'Content-Type': npm.tools.types.html }, content);
    };

    me.writeError = function(response, code) {
        code = typeof code === 'number' ? code : 500;
        me.writeEnd(response, code, { 'Content-Type': this.types.text }, npm.http.STATUS_CODES[code]);
    };

    module.exports = me;
})();