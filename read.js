var bogan = require('boganipsum');
var solr  = require('solr-client').createClient();
require('microtime');
var Benchmark = require('benchmark');

require('http').globalAgent.defaultMaxSockets = Infinity;

var id = 0;

solr.autoCommit = true;

var benchmark = new Benchmark({
	name: 'write',
	defer: true,
	fn: runOne
});

var terms = bogan().replace(/\./g, '').split(' ').map(function(s) {
	return s.toLowerCase();
}).filter(function(s) {
	return s.length > 3;
});

console.log('Using %d search terms', terms.length);

var searches = 0;

function runOne(deferred) {
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
		if (err) throw err;
		// console.log('results:', results.response.numFound);
		deferred.resolve();
	});
}

benchmark
.on('complete', function() {
	console.log('\nResults:\n');
	console.log('performed searches:', searches);
	console.log('freq: %d ops / sec', this.hz);
	console.log('elapsed: %d secs', this.times.elapsed);
  console.log('mean: %d ms', this.stats.mean * 1000);
  console.log('variance: +- %d s', this.stats.variance * 1000);
  console.log('cycles: %d', this.stats.sample.length);
  console.log('count: %d', this.count);
})
.run({async: true, queued: true});