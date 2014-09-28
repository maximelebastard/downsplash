/*
Unsplash scraper - By Maxime Lebastard
*/

var UNSPLASH_RSS_URL = 'https://unsplash.com/rss';

var request = require("request");
var fs = require('fs');
var FeedParser = require('feedparser');
var md5 = require('MD5');

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback );
    });
};

var scrape = function(){

    tray.icon = TRAY_ICON_SCRAPING;

    console.log('Scrape');
    var req = request(UNSPLASH_RSS_URL)
        , feedparser = new FeedParser();

    req.on('error', function (error) {
        console.log(error);
        alert(error);
    });

    req.on('response', function (res) {
        console.log('Response ' + res.statusCode);
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code (' + res.statusCode + ')'));

        stream.pipe(feedparser);
    });

    feedparser.on('readable', function() {
        var stream = this
            , item
            ,storageDir = localStorage.saveDir;


        var parsingError = function(){
            console.log('Parsing error');
        };

        // Read each RSS line
        while (item = stream.read()) {
            // Check if the image url is in the result
            if(typeof(item['rss:image']) != undefined)
            {
                if(typeof(item['rss:image']['url']) != undefined)
                {
                    if(typeof(item['rss:image']['url']['#']) != undefined)
                    {
                        // Get the image
                        var imgUrl = item['rss:image']['url']['#'];
                        var cleanImgUrl = imgUrl.substring(0, imgUrl.indexOf('?'));
                        console.log(cleanImgUrl);
                        var fileName = cleanImgUrl.substring(cleanImgUrl.lastIndexOf('/')+1);
                        console.log(fileName);
                        var storagePath = storageDir+'/'+fileName+'.tmp';
                        download(imgUrl, storagePath, function(){
                            // Make the MD5 of the image, and delete it if it already exists
                            var fileMD5;
                            fs.readFile(storagePath, function(err, buf) {
                                fileMD5 = md5(buf);
                                var newStoragePath = storageDir+'/'+fileMD5+'.jpg';
                                fs.exists(newStoragePath, function(exists){
                                   if(!exists){
                                       fs.rename(storagePath, newStoragePath, function(err){});
                                   }else{
                                       fs.unlink(storagePath, function(err){});
                                   }
                                });
                            });
                        });

                    }else{ parsingError(); }
                }else{ parsingError(); }
            }else{ parsingError(); }
        }

        tray.icon = TRAY_ICON;
    });
};