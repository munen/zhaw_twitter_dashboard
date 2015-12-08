"use strict";

var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    app = express(),
    Twitter = require('twitter'),
    secrets = require('./secrets');

app.use(express.static(__dirname + '/public'));

// Setup
app.use(morgan('dev'));
var jsonParser = bodyParser.json();
var twitter_client = new Twitter({
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
});
// END FAYE

// Twitter limits non-paying customers to two concurrent connections
var jobs = [{ keyword: "",
              frequency: 0,
              stream: undefined },
            { keyword: "",
              frequency: 0,
              stream: undefined }];

var start_tracking = function(keyword, id) {
    twitter_client.stream('statuses/filter', {track: keyword}, function(stream) {
        console.log("Starting to monitor keyword: '" + keyword + "' with id '" + (id +1) + "'");
        jobs[id].stream = stream;
        stream.on('data', function(tweet) {
            //tweet.text
            var frequency = ++jobs[id].frequency;
            bayeux.getClient().publish(`/job_statistics/${id+1}`, {
                keyword     : keyword,
                screen_name : tweet.user.screen_name,
                tweet_id    : tweet.id_str,
                frequency   : frequency,
                text        : tweet.text,
                time        : new Date()
            });
        });

        stream.on('error', function(error) {
            // Possible reasons:
            //  * Exceeded connection limit for user
            //  * Easy there, Turbo. Too many requests recently. Enhance your calm.
            console.log("ERROR: ");
            console.log(error.source);
        });
    });
};

var track_keyword = function(keyword, id) {
    // Safeguard: If there's already a monitoring job with the same
    // id, kill the old stream
    // https://github.com/desmondmorris/node-twitter/blob/master/lib/twitter.js#L214
    if(jobs[id].stream) {
        console.log("Destroying the old stream on a used socket");
        jobs[id].stream.destroy();
        setTimeout(start_tracking, 5000, keyword, id);
    }
    start_tracking(keyword, id);
};



app.put('/keyword_monitor_jobs/:id', jsonParser, function(req, res) {
    if (!req.body || (req.params.id > 2 || req.params.id < 1)) return res.sendStatus(400);

    var id = req.params.id - 1;
    var keyword = req.body.keyword;
    
    jobs[id].keyword = keyword;

    track_keyword(keyword, id);

    res.status(201).json({'job': id + 1});
});

app.get('/twitter_users/:username', function(req, res) {
    var screen_name = req.params.username;
    twitter_client.get("/users/show", { screen_name: screen_name }, function(error, tweets, response) {
        console.log(typeof response);

        //res.status(200).json({'follower_count': JSON.parse(response).followers_count});
        res.status(200).json(JSON.parse(response.body));
    });
});

app.listen(8080, function(){
    console.log("http server ready, captain.");
});

bayeux.getClient().subscribe('/job_statistics', function(msg) {
    console.log(msg);
});
