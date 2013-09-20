var bogan     = require('boganipsum');
var solr      = require('solr-client').createClient();
var microtime = require('microtime');
var async     = require('async');
var summary   = require('summary');
require('http').globalAgent.defaultMaxSockets = Infinity;

solr.autoCommit = true;

var concurrency = Number(process.argv[2]) || 5;
console.log('concurrency: %d', concurrency);

var count = Number(process.argv[3]) || 10000;
console.log('count: %d', count);

var start = microtime.now();

var queue = async.queue(runOne, concurrency);
queue.drain = drain;
for (var i = 0 ; i < count; i ++) {
  queue.push(i);
}

var samples = [];

var id = 0;

var terms = bogan().replace(/\./g, '').split(' ').map(function(s) {
	return s.toLowerCase();
}).filter(function(s) {
	return s.length > 3;
});
console.log('Using %d search terms', terms.length);

var searches = 0;

function runOne(_, cb) {
	var start = microtime.now();
	searches ++;
	id ++;
	var term = terms[id % (terms.length)];
	var term2 = terms[(id + 1) % (terms.length)];
	//console.log('term:', term);
	var query = {
		name: term + ' OR ' + term2,
		cat: 'cat' + Math.floor(Math.random() * 10)
	};
	var query = solr.createQuery().q(query).start(0).rows(10);

	solr.search(query, function(err, results) {
		var end = microtime.now();
		var elapsed = end - start;
		samples.push(elapsed);
		if (err) throw err;
		// console.log('results:', results.response.numFound);
		cb();
	});
}

function drain() {
	var end = microtime.now();
	var elapsed = (end - start) / 1e3;
	var freq = count / elapsed;
	console.log('elapsed: %d ms', elapsed);
	console.log('freq: %d ops / sec', freq * 1e3);
	var s = summary(samples);
	console.log('mean: %d ms', s.mean() / 1e3);
	console.log('stddev: +- %d ms', s.sd() / 1e3);
	console.log('max: %d ms', s.max() / 1e3);
	console.log('min: %d ms', s.min() / 1e3);
};