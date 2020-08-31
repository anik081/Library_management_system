var express = require('express');
var router = express.Router();
var Author = require('../models/author');
var Book = require('../models/book');


//all authors
router.get('/',async function (req,res){
  var searchOptions = {};
  if (req.query.name != null && req.query.name !== ''){
    searchOptions.name = new RegExp(req.query.name, 'i');
  }
  try{
    var authors = await Author.find(searchOptions).limit(10).exec();
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
router.post('/',async function (req, res){
  var author = new Author({
    name : req.body.name
  });
  try{
    var newAuthor = await author.save();
    res.redirect('/authors/${newAuthor.id}');
  }catch{
    res.render('authors/new',{
      author: author,
      errorMessage : 'Error creating author'
    });
  }


});
router.get('/:id',async function(req,res){
  try{
    var author = await Author.findById(req.params.id);
    var books =  await Book.find({author : author.id}).limit(6).exec();
    res.render('authors/show',{
      author : author,
      booksByAuthor : books
    });
  }catch{
      res.redirect('/');
  }
});
router.get('/:id/edit',async function(req,res){
  try{
    var author =await Author.findById(req.params.id);
    res.render('authors/edit',{ author : author});

  }catch{
    res.redirect('/authors');
  }

});
router.put('/:id',async function(req,res){
  let author
  try{
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  }catch{
    if (author == null){
      res.redirect('/');
    }else{
      res.render('authors/edit',{
        author: author,
        errorMessage : 'Error updating author'
      });
    }

  }

});
router.delete('/:id',async function(req,res){
  let author
  try{
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect('/authors');
  }catch{
    if (author == null){
      res.redirect('/');
    }else{
      res.redirect(`/authors/${author.id}`);
    }

  }
});
module.exports = router;
