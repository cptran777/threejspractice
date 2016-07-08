var express = require('express');

var app = express();

app.use(express.static(__dirname + '/client'));


app.get('/', 
function(req, res) {
  res.render('index');
});

console.log('Server listening on 3000');
app.listen(3000);
