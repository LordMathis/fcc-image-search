var mongoose = require('mongoose');

var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/imgsearch';
mongoose.connect(mongoUrl, { useMongoClient: true });
mongoose.Promise = Promise;

var db = mongoose.connection;

// User Schema
var HistorySchema = mongoose.Schema({
	search: {
		type: String
	},
	timestamp: {
		type: String
	},
});

var History = module.exports = mongoose.model('History', HistorySchema);

module.exports.saveQuery = function(query, callback){
	query.save(callback);
}

module.exports.getLatest = function(callback){
	History.find({}).sort({'_id': 1}).limit(10).exec(callback);
}
