if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

var express = require('express');
var app = express();
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');

var indexController = require('./controllers/indexController');
var authorController = require('./controllers/authorsController');

app.set('view engine','ejs');
app.set('views',__dirname + '/views');
app.set('layout','layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb' , extended: false}));

var mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
var db = mongoose.connection;
db.on('error' , function(error){
  console.error(error);
});
db.once('open', function (){
  console.log('connected to mongoose');
});

app.use('/', indexController);
app.use('/authors', authorController);


app.listen(process.env.PORT ||  3000);
