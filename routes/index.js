var express = require('express');
var router = express.Router();
var scrape = require('../lib/scrape')

/* GET home page. */
router.get('/', function(req, res, next) {
    scrape(function(err, data) {
    // require('fs').readFile('./lib/GCI MyUsage.html', 'utf8', function(err, data) {
        if (err) return next(err)

        var table = data.match(/<table id="internet-detail-usage">[\s\S]+?<\/table>/)[0]
        var total = data.match(/<span class="total">([^<]+)<\/span>/)[1]

        res.render('index', { table: table, total: total })
    });
});

module.exports = router;
