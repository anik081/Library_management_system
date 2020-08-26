var express = require('express');
var router = express.Router();
var Author = require('../models/author')

//all authors
router.get('/',async function (req,res){
  var searchOptions = {};
  if (req.query.name != null && req.query.name !== ''){
    searchOptions.name = new RegExp(req.query.name, 'i');
  }
  try{
    var authors = await Author.find(searchOptions);
    res.render('authors/index',{
      authors: authors,
      searchOptions: req.query
    });
  }catch{

    res.redirect('/');
  }

});

//new author
router.get('/new',function (req,res){
  res.render('authors/new',{ author : new Author()})
});
//create author
router.post('/', function (req, res){
  var author = new Author({
    name : req.body.name
  });
  author.save(function(err, newAuthor){
    if (err){
      res.render('authors/new',{
        author:author,
        errorMessage :'Error creating author'
      });
    }
    else{
      //res.redirect('authors/${newAuthor.id}')
      res.redirect('authors')
    }
  });

});

module.exports = router;
