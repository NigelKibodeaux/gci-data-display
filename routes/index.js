var express = require('express')
var router = express.Router()
var scrape = require('../lib/scrape')


// renders the damn page
function renderPage(age_limit, req, res, next) {
    scrape(age_limit, function(err, data) {
        if (err) return next(err);

        var table = data.data
            .match(/<table id="internet-detail-usage">[\s\S]+?<\/table>/)[0]
        var total = data.data
            .match(/<span class="total">([^<]+)<\/span>/)[1]

        res.render('index', {
            table: table,
            total: total,
            last_scrape_date: data.date,
        })
    })
}


// same function for GET and POST but they are cached differently
router.get('/', renderPage.bind(null, 1000*60*60)) // cache for one hour
router.post('/', renderPage.bind(null, 1000*60)) // cache for one minute

module.exports = router;
