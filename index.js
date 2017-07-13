var express = require('express');
var path = require('path');
var History = require('./models/history');
var GoogleImages = require('google-images');

var client = new GoogleImages(process.env.CSE, process.env.API);
var app = express();

app.set('views', path.join(__dirname, '/views'));
app.engine('md', require('marked-engine').renderFile);
app.set('view engine', 'md');
app.set('port', (process.env.PORT || 5000));

var baseUrl = process.env.BASE_URL || 'localhost:' + app.get('port');

app.get('/', (req,res) => {
  res.render('index');
});

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

app.get('/api/search/:query', (req, res) => {
  var query = req.params.query;
  var page = req.query.page || 1;

  client.search(query, {page: page}).then(images => {
    var history = new History({
      "search": query,
      "timestamp": new Date().toLocaleString()
    });
    History.saveQuery(history, (err) => {
      if (err) console.log(err);
    })
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

app.listen(app.get('port'), () => {
  console.log('Server is running on port', app.get('port'));
});
