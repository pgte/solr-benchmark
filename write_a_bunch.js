var async = require('async');
var bogan = require('boganipsum');
var solr  = require('solr-client').createClient();
solr.autoCommit = true;

var MAX_DOCS = 100000;

var id = 0;

//var queue = async.queue(insert, 2);

//queue.drain = drain;
var queue = [];

for ( var i = 0 ; i < MAX_DOCS; i ++) {
	var cat = Math.floor(Math.random() * 10);
	var doc = {
		id:    ++id,
		name: bogan({paragraphs: 1, sentenceMin:1, sentenceMax: 1}),
		cat: 'cat' + cat
	};

	queue.push(doc);
}

console.log('pushed %d docs', MAX_DOCS);

function insert(doc, cb) {
	var doc =
	solr.add(doc, function(err) {
		if (err) throw err;
		cb();
	});
}

insert(queue, drain);

function drain(err) {
	if (err) throw err;
	console.log('finished');
}