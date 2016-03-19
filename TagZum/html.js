// ReSharper disable UseOfImplicitGlobalInFunctionScope
(function() {
    var tag2Html = function(tag) {
        var tagType = typeof tag;
        if (tagType === 'string' || tagType === 'number') {
            return tag;
        }

        if (tag === undefined || tag === null) {
            return '';
        }

        var result = '<' + tag.name;
        if (typeof tag.attr !== 'undefined' && tag.attr !== null) {
            tag.attr.forEachProp(function(key, value) {
                result += npm.util.format(' %s=\'%s\'', key, value);
            });
        }

        result += '>';
        if (Array.isArray(tag.inner)) {
            for (var index in tag.inner) {
                result += '\n' + tag2Html(tag.inner[index]);
            }
        } else {
            result += '\n' + tag2Html(tag.inner);
        }

        return npm.util.format('%s</%s>', result, tag.name);
    };

    var newTag = function(name, attr, inner) {
        var tag = { name: name || 'div', attr: attr || {}, inner: inner || [] };
        tag.addTag = function(name, attr, inner) {
            var innerTag = newTag(name, attr, inner);
            tag.inner.push(innerTag);
            return innerTag;
        };
        return tag;
    };

    var newPage = function() {
        var page = {};
        var root = newTag('html');
        root.addTag('head');
        root.addTag('body');

        page.build = function() {
            return tag2Html(root);
        };

        page.addTag = function(tag, isFile) {
            var index = isFile ? 0 : 1; //head or body
            root.inner[index].inner.push(tag);
            return tag;
        };

        return page;
    };

    var html = module.exports = {};
    html.tag = newTag;
    html.page = newPage;
})();