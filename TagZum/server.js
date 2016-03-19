// ReSharper disable NotAllPathsReturnValue
// ReSharper disable InconsistentNaming
// ReSharper disable UseOfImplicitGlobalInFunctionScope
(function() {
    var splitRegexp = /\s*[Ff]eat\.\s*|\s*[Ft]t\.\s*|\s*&\s*|\s*,\s*/;
    var html = npm.html;

    var nb = new npm.NB({ userAgent: 'TagZum/1.0.0 ( http://localhost:1337/ )' });

    var mainHandler = function(request, response) {
        var mainPage = html.page();
        mainPage.addTag(html.tag('form', { action: '/send' }, [
            html.tag('div', {}, 'Find out tags of:'),
            html.tag('input', { type: 'text', name: 'artist', value: 'Pink Is Punk & Benny Benassi feat. Bright Lights ' }),
            html.tag('input', { type: 'submit', value: 'Search' })
        ]));

        mainPage.addTag(html.tag('form', { action: '/vk' }, [
            html.tag('div', {}, 'Find out tags by VK:'),
            html.tag('input', { type: 'text', name: 'id' }),
            html.tag('input', { type: 'submit', value: 'Scan' })
        ]));

        npm.tools.writeHtmlEnd(response, mainPage.build());
    };

    var sendHandler = function(request, response, query) {
        var artists = {};
        var artistList = query.artist.trim().split(splitRegexp)
            .filter(function(element, position, array) { return array.indexOf(element) === position; });
        artistList.forEach(function(element) { artists[element] = { name: element }; });

        var totalArtists = artistList.length;
        artistList = null;
        if (totalArtists === 0) {
            var emptyPage = html.page();
            tags.addTag('h1', {}, 'Empty request');
            npm.tools.writeHtmlEnd(response, emptyPage.build());
            return;
        }

        var counter = totalArtists;
        var writeTagsPage = function() {
            var tagsPage = html.page();
            var artistList = html.tag('ul');
            artists.forEachProp(function(name, data) {
                var suitableArtistList = artistList
                    .addTag('li', {}, [name])
                    .addTag('ul');

                data.suitable.forEach(function(artist) {
                    var artistTagList = suitableArtistList
                        .addTag('li', {}, [artist.name])
                        .addTag('ul');

                    artist.tags.forEach(function(tag) {
                        artistTagList.addTag('li', {}, tag);
                    });
                });
            });

            tagsPage.addTag(artistList);
            npm.tools.writeHtmlEnd(response, tagsPage.build());
        };
        //Pink Is Punk & Benny Benassi feat. Bright Lights 
        var searchCallback = function(error, result) {
            var inputName = this;
            counter--;
            if (error || result.count === 0) {
                artists[inputName].suitable = [({ name: 'NotFound', tags: [] })];
                if (error) {
                    console.log(JSON.stringify(error));
                }
            } else {
                artists[inputName].suitable = result.artists
                    .filter(function(artist) {
                        return artist.score > 80;
                    }).map(function(artist) {
                        var tags;
                        if (artist.tags) {
                            tags = artist.tags.map(function(tag) {
                                return tag.name;
                            });
                        } else {
                            tags = ['NotFound'];
                        }
                        var name = artist.name;
                        if (artist.disambiguation) {
                            name += ' ' + artist.disambiguation;
                        } else if (artist.country) {
                            name += ' ' + artist.country;
                        }
                        return { name: name, tags: tags };
                    });
            }
            console.log(JSON.stringify(result));
            console.log(counter);
            console.log('~~~~~~~~~~~~~~~~~~~~');
            if (counter <= 0) {
                console.log('DONE!');
                console.log(JSON.stringify(artists));
                writeTagsPage();
            }
        };
        console.log(artists);
        artists.forEachProp(function(name) {
            setTimeout(function() {
                nb.search('artist', { artist: name }, searchCallback.bind(name));
            }, 100);
        });
    };

    var vkHandler = function() {

    }

    var port = process.env.port || 1337;
    var router = npm.routing();

    router.get('/', mainHandler);
    router.get('/send', sendHandler);
    router.get('/vk', vkHandler);

    function handleRequest(request, response) {
        var url = npm.url.parse(request.url, true);
        var handler = router.getHandle(request.method, url.pathname);
        if (handler.error) {
            npm.tools.writeError(response, handler.code);
        } else {
            handler(request, response, url.query);
        }
    };

    npm.http.createServer(handleRequest).listen(port);
})();
