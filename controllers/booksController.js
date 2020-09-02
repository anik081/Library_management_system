var express = require('express');
var router = express.Router();
var Book = require('../models/book');
var Author = require('../models/author');
var path = require('path');
var uploadPath = path.join('public',Book.coverImageBasePath);
var multer = require('multer');
var imageMimeTypes = ['images/jpeg','images/png','images/gif'];
var fs = require('fs');
var storage = multer.diskStorage({
  destination : uploadPath,
  filename : function(req,file,callback){
    callback(null,  file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage,
  limits: {fileSize : 10000000}
});

//all authors
router.get('/',async function (req,res){
  let query = Book.find();
  if (req.query.title != null && req.query.title != ''){
    query = query.regex('title', new RegExp(req.query.title, 'i'));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
    query = query.lte('publishDate', req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
    query = query.gte('publishDate', req.query.publishedAfter);
  }
  try {
    var books =await query.exec();
    res.render('books/index', {
      books : books,
      searchOptions : req.query

    });

  }catch{
    res.redirect('/');
  }

});

//new author
router.get('/new',async function (req,res){

  renderNewPage(res, new Book());

});


//create author
router.post('/',upload.single('cover'), async function (req, res){
  var filename =   req.file != null ? req.file.filename : null;
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount:req.body.pageCount,
    description : req.body.description,
    coverImageName : filename
  });

  try{
    var newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  }catch{
    if( book.coverImageName != null){
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book , true);
  }

});





//show book
router.get('/:id', async function(req, res){
  try{
    var book = await Book.findById(req.params.id).populate('author').exec();


    res.render('books/show',{book : book});
  }catch{
    res.redirect('/');
  }
});


//edit books
router.get('/:id/edit',async function (req,res){

  try{
    var book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  }catch{
    res.redirect('/');
  }

});
//update author
router.put('/:id', upload.single('cover'), async function (req, res){
  let book;

  try{
    book =await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate =new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if(req.file.filename != null && req.file.filename !== ''){
      removeBookCover(book.coverImageName);
      var filename =   req.file != null ? req.file.filename : null;
      book.coverImageName = filename;
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  }catch{
    if(book != null){
      renderEditPage(res, book , true);
    }
    else{
        res.redirect('/');
    }

  }


});

//delete books
router.delete('/:id', async function(req, res){
  let book;
  try{
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect('/books');
  }
  catch{
    if(book != null ){
      res.render('books/show',{
        book: book,
        errorMessage : 'Could not remove book'
      });
    }
    else{
      res.redirect('/');
    }
  }
});

async function renderNewPage(res, book, hasError = false){
  renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false){
  renderFormPage(res, book, 'edit', hasError);
}
async function renderFormPage(res, book,form, hasError = false){
  try {
    var  authors = await Author.find({});
    var params ={
      authors : authors,
      book : book
    }
    if (hasError){
      if(form == 'edit'){
        params.errorMessage = 'Error updating books';
      }
      else{
        params.errorMessage = 'Error creating books';
      }

    }
    res.render(`books/${form}`,params);
  } catch{
    res.send('/books');
  }
}

function removeBookCover(fileName){
  fs.unlink(path.join(uploadPath,fileName), function(err){
    if(err){
      console.log(err);
    }
  });
}

module.exports = router;
