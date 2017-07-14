var mongoose = require('mongoose');

// History Schema
var HistorySchema = mongoose.Schema({
	search: {
		type: String
	},
	timestamp: {
		type: String
	},
});

var History = module.exports = mongoose.model('History', HistorySchema);

// Save function
module.exports.saveQuery = function(query, callback){
	query.save(callback);
}

// Get latest search queries
module.exports.getLatest = function(callback){
	History.find({}).sort({'_id': 1}).limit(10).exec(callback);
}
