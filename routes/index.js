var express = require('express')
var router = express.Router()
var scrape = require('../lib/scrape')

var last_scrape = {
    date: null,
    data: null,
}

// helper to send response
function respondWithCachedData(res) {
    var table = last_scrape.data
        .match(/<table id="internet-detail-usage">[\s\S]+?<\/table>/)[0]
    var total = last_scrape.data
        .match(/<span class="total">([^<]+)<\/span>/)[1]

    res.render('index', {
        table: table,
        total: total,
        last_scrape: last_scrape.date,
    })
}


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(last_scrape.date)
    console.log(Date.now() - last_scrape.date)

    // return cached data if it's less than one hour old
    if ( last_scrape.data && (Date.now() - last_scrape.date < 1000*60*60) ) {
        console.log('returning cached data')
        return respondWithCachedData(res)
    }

    // else, scrape it and store it
    scrape(function(err, data) {
        if (err) return next(err)

        last_scrape.date = new Date();
        last_scrape.data = data;

        respondWithCachedData(res)
    });
});

module.exports = router;
