var mongoose = require('mongoose');
var Book = require('./book');
var authorSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  }
});

authorSchema.pre('remove', function(next){
  Book.find({author : this.id},function(err, books){
    if(err){
      next(err);
    }else if(books.length > 0){
      next(new Error('This author has book still'));
    }
    else{
      next();
    }
  });
});

module.exports = mongoose.model('Author' ,authorSchema);
