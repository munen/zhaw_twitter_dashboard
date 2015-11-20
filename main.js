"use strict";

const
express = require('express'),
bodyParser = require('body-parser'),
morgan = require('morgan'),
app = express(),
Twitter = require('twitter'),
secrets = require('./secrets');

// Setup
app.use(morgan('dev'));
var jsonParser = bodyParser.json()
var client = new Twitter({
    consumer_key: secrets.consumer_key,
    consumer_secret: secrets.consumer_secret,
    access_token_key: secrets.access_token_key,
    access_token_secret: secrets.access_token_secret
});

// BEGIN FAYE
var http = require('http'),
    faye = require('faye');

var server = http.createServer(),
    bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

bayeux.attach(server);
server.listen(8000, function() {
    console.log("faye server ready, captain.");
})
// END FAYE

var track_keyword = function(keyword, id) {
    client.stream('statuses/filter', {track: keyword}, function(stream) {
        console.log("Starting to monitor keyword: '" + keyword);
        stream.on('data', function(tweet) {
            //tweet.text
            frequency = ++jobs[id].frequency;
            console.log(keyword, ": ", frequency);
            bayeux.getClient().publish('/job_statistics', {
                keyword:       keyword,
                frequency:  frequency
            });
        });

        stream.on('error', function(error) {
            console.log(error);
        });
    });
}

var jobs = [
    { keyword: "",
      frequency: 0 },
    { keyword: "",
      frequency: 0 }
]

app.put('/jobs/:id', jsonParser, function(req, res) {
    if (!req.body || (req.params.id > 2 || req.params.id < 1)) return res.sendStatus(400);

    var id = req.params.id - 1;
    var keyword = req.body.keyword;
    
    jobs[id].keyword = keyword;

    track_keyword(keyword, id);

    res.status(201).json({'job': id + 1});
})

app.listen(8080, function(){
    console.log("http server ready, captain.");
});






bayeux.getClient().subscribe('/job_statistics', function(msg) {
    console.log(msg);
});
