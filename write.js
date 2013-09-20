var bogan = require('boganipsum');
var solr  = require('solr-client').createClient();
require('microtime');
var Benchmark = require('benchmark');

var id = 0;

solr.autoCommit = true;

var benchmark = new Benchmark({
	name: 'write',
	defer: true,
	fn: runOne
});

function runOne(deferred) {
	var doc = {
		id:    ++id,
		name: bogan({paragraphs: 1, sentenceMin:1, sentenceMax: 1}),
		cat: 'cat1',
		cat: 'cat2'
	};
	solr.add(doc, function(err) {
		if (err) throw err;
		deferred.resolve();
	});
}

benchmark
.on('complete', function() {
	console.log('freq: %d ops / sec', this.hz);
	console.log('elapsed: %d secs', this.times.elapsed);
  console.log('mean: %d ms', this.stats.mean * 1000);
  console.log('variance: +- %d s', this.stats.variance * 1000);
  console.log('cycles: %d', this.stats.sample.length);
  console.log('count: %d', this.count);
})
.run({async: true, queued: true});