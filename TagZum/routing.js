// ReSharper disable UseOfImplicitGlobalInFunctionScope
// ReSharper disable NotAllPathsReturnValue
(function() {
    module.exports = function() {
        var me = {};
        var handlers = { GET: {}, POST: {} };

        me.get = function(url, handler) {
            handlers.GET[url] = handler;
        };

        me.post = function(url, handler) {
            handlers.POST[url] = handler;
        };
        
        me.getHandle = function(method, path) {
            var methodHandlers = handlers[method];
            if (typeof methodHandlers === 'undefined') {
                return { error: true, code: 501 };
            }
            var handler = methodHandlers[path];
            if (typeof handler === 'undefined') {
                return { error: true, code: 404 };
            }
            return handler;
        }

        me.getFile = function(url, type) {
            me.get(url, npm.tools.getFileWriter('.' + url, type));
        };

        return me;
    };
})();