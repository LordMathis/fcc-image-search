var express = require('express');
var path = require('path');
var GoogleImages = require('google-images');
var mongoose = require('mongoose');

var History = require('./models/history');

// Set up google image search
var client = new GoogleImages(process.env.CSE, process.env.API);

// Set up express
var app = express();
app.set('views', path.join(__dirname, '/views'));
app.engine('md', require('marked-engine').renderFile);
app.set('view engine', 'md');
app.set('port', (process.env.PORT || 5000));

// Set up mongoose
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/imgsearch';
mongoose.connect(mongoUrl, { useMongoClient: true });
mongoose.Promise = Promise;
var conn = mongoose.connection;

// Render index page
app.get('/', (req,res) => {
  res.render('index');
});

// Get latest search queries
app.get('/api/latest', (req, res) => {
  History.getLatest((err, data) => {
    if (err) console.log(err);

    res.json(data.map((image) => {
      return {
        "term": image.search,
        "timestamp": image.timestamp
      }
    }));
  });
});

// Search for an image and save the search query
app.get('/api/search/:query', (req, res) => {
  var query = req.params.query;
  var page = req.query.page || 1; // paginate

  // Search with google image search
  client.search(query, {page: page}).then(images => {

    // Create and save search query object
    var history = new History({
      "search": query,
      "timestamp": new Date().toLocaleString()
    });
    History.saveQuery(history, (err) => {
      if (err) console.log(err);
    })

    // Send search results
    res.json(images.map((image) => {
      return {
        "url": image.url,
        "description": image.description,
        "thumbnail": image.thumbnail.url,
        "parentPage": image.parentPage
      };
    }));
  });
});

conn.on('error', console.error.bind(console, 'connection error:'));

// Start the app once the connection to mongodb is established
conn.once('open', function() {
  app.listen(app.get('port'), () => {
    console.log('Server is running on port', app.get('port'));
  });
});
