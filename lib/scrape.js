'use strict'

var request = require('request')
// require('request-debug')(request); // debuggin!
var async = require('async')

// cache for scraped data
var last_scrape = {
    date: null,
    data: null,
}


// returns cached data if it's fresh enough of newly scraped data
function getData(age_limit, callback) {
    // return cached data if it's less than one hour old
    if ( last_scrape.data && (Date.now() - last_scrape.date < age_limit) ) {
        console.log('returning cached data')
        return callback(null, last_scrape)
    }

    // else, scrape it and store it
    console.log('scraping')
    scrapeUsageData(function(err, data) {
        if (err) return callback(err)

        last_scrape.date = new Date()
        last_scrape.data = data

        callback(null, last_scrape)
    });
}


// turn on cookies for all requests
var request = request.defaults({
    jar: true,
    followAllRedirects: true,
    headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36;'
    }
})

var indicateStep = (function() {
    var step = 1
    return function() {
        console.log('-----------> ', step++)
    }
})();

var login_tries = 0;

function login(csrf_token, callback) {
    if (login_tries)
        return callback( new Error('already tried logging in!') )
    else
        login_tries++ // increment infinite loop prevention counter

    request.post(
        'https://login.gci.com/',
        {
            form: {
                _csrf: csrf_token,
                username: process.env.UNAME,
                password: process.env.PASS,
                submit: 'Log In'
            },
        },
        function (err, httpResponse, body) {
            callback(err)
            login_tries = 0
        }
    )
}


function scrapeUsageData(callback) {
    var service_guid = process.env.GUID || 'cc:a4:62:67:e9:13'; // nigel's
    var url = 'https://apps.gci.com/um/service/' + service_guid;
    request.get(url, function(err, http, body) {
        var csrf_token = body.match(/name="_csrf" value="([^"]+)"/)

        // on the login page
        if (csrf_token && csrf_token[1]) {
            console.log('on the login page')

            login(csrf_token[1], function(err) {
                if (err) return callback(err)
                scrapeUsageData(callback)
            }) // recursion!
        }

        // on the data page
        else if (body.match(/id="internet-detail-usage"/)) {
            console.log('on the data page')

            callback(err, body)
        }

        // on some fucked up page
        else {
            console.log('on some fucked up page')

            request.get('https://apps.gci.com/um/logout', function(err, http, body) {
                scrapeUsageData(callback);
            })
        }
    })
}

module.exports = getData
