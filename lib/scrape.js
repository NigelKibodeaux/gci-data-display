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

        // on the login page
        if (csrf_token && csrf_token[1]) {
            console.log('on the login page')

            login(csrf_token[1], function(err) {
                if (err) return callback(err)
                getUsageData(callback)
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
                getUsageData(callback);
            })
        }
    })
}

module.exports = function (callback) {
    getUsageData(callback)
}
