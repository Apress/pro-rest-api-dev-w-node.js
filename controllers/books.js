var BaseController = require("./basecontroller"),
  _ = require("underscore"),
  swagger = require("swagger-node-restify")



function Books() {
}

Books.prototype = new BaseController()

module.exports = function(lib) {
  var controller = new Books();


  /**
    Helper function for the POST action
    */
  function mergeStores(list1, list2) {
    var stores1 = {}
    var stores2 = {}
    _.each(list1, function(st) {
      if(st.store)
        stores1[st.store] = st.copies
    })
    _.each(list2, function(st) {
      if(st.store)
        stores2[st.store] = st.copies
    })
    var stores = _.extend(stores1, stores2)
    return _.map(stores, function(v, k) {
      return {store: k, copies: v}
    })
  }


  controller.addAction({
        'path': '/books',
        'method': 'GET',
        'summary': 'Returns the list of books',
        "params": [ swagger.queryParam('q', 'Search term', 'string'), swagger.queryParam('genre','Filter by genre', 'string')],
        'responseClass': 'Book',
        'nickname': 'getBooks'
      }, function(req, res, next) {

        var criteria = {}
        if(req.params.q) {
          var expr = new RegExp('.*' + req.params.q + '.*')
          criteria.$or = [
            {title: expr},
            {isbn_code: expr},
            {description: expr}
          ]
        }
        if(req.params.genre) {
          criteria.genre = req.params.genre
        }

        lib.db.model('Book')
          .find(criteria)
          .populate('stores.store')
          .exec(function(err, books) {
          if(err) return next(err)
          controller.writeHAL(res, books)
        })
      })

   controller.addAction({
        'path': '/books/{id}',
        'method': 'GET',
        'params': [ swagger.pathParam('id', 'The Id of the book','int') ],
        'summary': 'Returns the full data of a book',
        'nickname': 'getBook'
      }, function(req, res, next) {
        var id = req.params.id
        if(id) {
          lib.db.model("Book")
            .findOne({_id: id})
            .populate('authors')
            .populate('stores')
            .populate('reviews')
            .exec(function(err, book) {
              if(err) return next(controller.RESTError('InternalServerError', err))
              if(!book) {
                return next(controller.RESTError('ResourceNotFoundError', 'Book not found'))
              }
              controller.writeHAL(res, book)
            })
        } else {
          next(controller.RESTError('InvalidArgumentError', 'Missing book id'))
        }
      })

  controller.addAction({
        'path': '/books',
        'method': 'POST',
        'params': [ swagger.bodyParam('book', 'JSON representation of the new book','string') ],
        'summary': 'Adds a new book into the collectoin',
        'nickname': 'newBook'
      }, function(req, res, next) {
        var bookData = req.body 
        if(bookData) {
          isbn = bookData.isbn_code
          lib.db.model("Book")
            .findOne({isbn_code: isbn})
            .exec(function(err, bookModel) {
              if(!bookModel) {
                bookModel = lib.db.model("Book")(bookData)
              } else {
                bookModel.stores = mergeStores(bookModel.stores, bookData.stores) 
              }
              bookModel.save(function(err, book) {
                  if(err) return next(controller.RESTError('InternalServerError', err))
                  controller.writeHAL(res, book)
                })
            })
          
        } else {
          next(controller.RESTError('InvalidArgumentError', 'Missing content of book'))
        }
      })

  controller.addAction({
        'path': '/books/{id}/authors',
        'method': 'GET',
        'params': [ swagger.pathParam('id', 'The Id of the book','int') ],
        'summary': 'Returns the list of authors of one specific book',
        'nickname': 'getBooksAuthors'
      }, function(req, res, next) {
        var id = req.params.id
        if(id) {
          lib.db.model("Book")
            .findOne({_id: id})
            .populate('authors')
            .exec(function(err, book) {
              if(err) return next(controller.RESTError('InternalServerError', err))
              if(!book) {
                return next(controller.RESTError('ResourceNotFoundError', 'Book not found'))
              }
              controller.writeHAL(res, book.authors)
            })
        } else {
          next(controller.RESTError('InvalidArgumentError', 'Missing book id'))
        }
      })
  controller.addAction({
        'path': '/books/{id}/reviews',
        'method': 'GET',
        'params': [ swagger.pathParam('id', 'The Id of the book','int') ],
        'summary': 'Returns the list of reviews of one specific book',
        'nickname': 'getBooksReviews'
      }, function(req, res,next) {
        var id = req.params.id
        if(id) {
          lib.db.model("Book")
            .findOne({_id: id})
            .populate('reviews')
            .exec(function(err, book) {
              if(err) return next(controller.RESTError('InternalServerError', err))
              if(!book) {
                return next(controller.RESTError('ResourceNotFoundError', 'Book not found'))
              }
              controller.writeHAL(res, book.reviews)
            })
        } else {
          next(controller.RESTError('InvalidArgumentError', 'Missing book id'))
        }
      })
  
  controller.addAction({
        'path': '/books/{id}',
        'method': 'PUT',
        'params': [ swagger.pathParam('id', 'The Id of the book to update','string'),
                   swagger.bodyParam('book', 'The data to change on the book', 'string') ],
        'summary': 'Updates the information of one specific book',
        'nickname': 'updateBook'
      }, function(req, res, next) {
          var data = req.body
          var id = req.params.id
          if(id) {
            
            lib.db.model("Book").findOne({_id: id}).exec(function(err, book) {
            if(err) return next(controller.RESTError('InternalServerError', err))
              if(!book) return next(controller.RESTError('ResourceNotFoundError', 'Book not found'))
              book = _.extend(book, data)
              book.save(function(err, data) {
              if(err) return next(controller.RESTError('InternalServerError', err))
               controller.writeHAL(res, data.toJSON())
              })
            })
          } else {
            next(controller.RESTError('InvalidArgumentError', 'Invalid id received'))
          }
      })
  return controller
}
