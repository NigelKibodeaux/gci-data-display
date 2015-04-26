'use strict'

var request = require('request')
// require('request-debug')(request); // debuggin!
var async = require('async')

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


function getUsageData(callback) {
    request.get('https://apps.gci.com/um/service/cc:a4:62:67:e9:13', function(err, http, body) {
        var csrf_token = body.match(/name="_csrf" value="([^"]+)"/)
        if (csrf_token && csrf_token[1]) {
            login(csrf_token[1], function(err) {
                if (err) return callback(err);
                getUsageData(callback)
            }) // recursion!
        }
        else { // assume it's the page with the data
            callback(err, body)
        }
    })
}

module.exports = function (callback) {
    getUsageData(callback)
}
