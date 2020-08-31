if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

var express = require('express');
var app = express();
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var indexController = require('./controllers/indexController');
var authorController = require('./controllers/authorsController');
var bookController = require('./controllers/booksController');

app.set('view engine','ejs');
app.set('views',__dirname + '/views');
app.set('layout','layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb' , extended: false}));
app.use(methodOverride('_method'));

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
app.use('/books', bookController);

app.listen(process.env.PORT ||  3000);
