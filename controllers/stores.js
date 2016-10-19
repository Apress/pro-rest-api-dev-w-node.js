var BaseController = require("./basecontroller"),
	_ = require("underscore"),
  	swagger = require("swagger-node-restify")



function Stores() {
}

Stores.prototype = new BaseController()

module.exports = function(lib) {
  var controller = new Stores();

  controller.addAction({
  	'path': '/stores',
  	'method': 'GET',
  	'summary': 'Returns the list of stores ',
    'params': [swagger.queryParam('state', 'Filter the list of stores by state', 'string')],
  	'responseClass': 'Store',
  	'nickname': 'getStores'
  }, function (req, res, next) {
    var criteria = {}
    if(req.params.state) {
      criteria.state = new RegExp(req.params.state,'i')
    }
  	lib.db.model('Store')
      .find(criteria)
      .exec(function(err, list) {
  		if(err) return next(controller.RESTError('InternalServerError', err))
      controller.writeHAL(res, list)
  	})
  })


  controller.addAction({
  	'path': '/stores/{id}',
  	'method': 'GET',
  	'params': [swagger.pathParam('id','The id of the store','string')],
  	'summary': 'Returns the data of a store',
  	'responseClass': 'Store',
  	'nickname': 'getStore'
  }, function(req, res, next) {
    var id = req.params.id  
    if(id) {
      lib.db.model('Store')
        .findOne({_id: id})
        .populate('employees')
        .exec(function(err, data) {
        if(err) return next(controller.RESTError('InternalServerError', err))
        if(!data) return next(controller.RESTError('ResourceNotFoundError', 'Store not found'))

        controller.writeHAL(res, data)
      })
    } else  {
      next(controller.RESTError('InvalidArgumentError', 'Invalid id'))
    }  
  })

  controller.addAction({
    'path': '/stores/{id}/books',
    'method': 'GET',
    'params': [swagger.pathParam('id','The id of the store','string'), 
               swagger.queryParam('q', 'Search parameter for the books', 'string'),
               swagger.queryParam('genre', 'Filter results by genre', 'string')],
    'summary': 'Returns the list of books of a store',
    'responseClass': 'Book',
    'nickname': 'getStoresBooks'
  }, function (req, res, next) {
    var id = req.params.id  
    if(id) { 

      var criteria = {stores: id}
      if(req.params.q) {
        var expr = new RegExp('.*' + req.params.q + '.*', 'i')
        criteria.$or = [
          {title: expr},
          {isbn_code: expr},
          {description: expr}
        ]
      }
      if(req.params.genre) {
        criteria.genre = req.params.genre
      }

      //even though this is the stores controller, we deal directly with books here
      lib.db.model('Book')
        .find(criteria)
        .populate('authors')
        .exec(function(err, data) {
          if(err) return next(controller.RESTError('InternalServerError', err))
          controller.writeHAL(res, data)
        })
    } else  {
      next(controller.RESTError('InvalidArgumentError', 'Invalid id'))
    }  
  })

  controller.addAction({
    'path': '/stores/{id}/employees',
    'method': 'GET',
    'params': [swagger.pathParam('id','The id of the store','string')],
    'summary': 'Returns the list of employees working on a store',
    'responseClass': 'Employee',
    'nickname': 'getStoresEmployees'
  }, function (req, res, next) {
    var id = req.params.id  
    if(id) { 
      lib.db.model('Store')
        .findOne({_id: id})
        .populate('employees')
        .exec(function(err, data) {
          if(err) return next(controller.RESTError('InternalServerError', err))
          if(!data) {
            return next(controller.RESTError('ResourceNotFoundError', 'Store not found'))
          }
          console.log(data)
          controller.writeHAL(res, data.employees)
        })
    } else  {
      next(controller.RESTError('InvalidArgumentError', 'Invalid id'))
    }  
  })

  controller.addAction({
    'path': '/stores/{id}/booksales',
    'method': 'GET',
    'params': [swagger.pathParam('id','The id of the store','string')],
    'summary': 'Returns the list of booksales done on a store',
    'responseClass': 'BookSale',
    'nickname': 'getStoresBookSales'
  }, function (req, res, next) {
    var id = req.params.id  
    if(id) { 
      //even though this is the stores controller, we deal directly with booksales here
      lib.db.model('Booksale')
        .find({store: id})
        .populate('client')
        .populate('employee')
        .populate('books')
        .exec(function(err, data) {
          if(err) return next(controller.RESTError('InternalServerError', err))
          controller.writeHAL(res, data)
        })
    } else  {
      next(controller.RESTError('InvalidArgumentError', 'Invalid id'))
    }  
  })

  controller.addAction({
  	'path': '/stores',
  	'method': 'POST',
  	'summary': 'Adds a new store to the list',
    'params': [swagger.bodyParam('store', 'The JSON data of the store', 'string')],
  	'responseClass': 'Store',
  	'nickname': 'newStore'
  }, function (req, res, next) {
  	var data = req.body
  	if(data) {
  		var newStore = lib.db.model('Store')(data)
  		newStore.save(function(err, store) {
	 		  if(err) return next(controller.RESTError('InternalServerError', err))
	  		controller.writeHAL(res, store) 			
  		})
  	} else {
  		next(controller.RESTError('InvalidArgumentError', 'No data received'))
  	}
  })

  controller.addAction({
  	'path': '/stores/{id}',
  	'method': 'PUT',
  	'summary': "UPDATES a store's information",
  	'params': [swagger.pathParam('id','The id of the store','string'), swagger.bodyParam('store', 'The new information to update', 'string')],
  	'responseClass': 'Store',
  	'nickname': 'updateStore'
  }, function (req, res, next) {
  	var data = req.body
  	var id = req.params.id
  	if(id) {
  		
  		lib.db.model("Store").findOne({_id: id}).exec(function(err, store) {
	 		if(err) return next(controller.RESTError('InternalServerError', err))
        if(!store) return next(controller.RESTError('ResourceNotFoundError', 'Store not found'))
	  		store = _.extend(store, data)
	  		store.save(function(err, data) {
		 		if(err) return next(controller.RESTError('InternalServerError', err))
		 		 res.json(controller.toHAL(data))	
	  		})
  		})
  	} else {
  		next(controller.RESTError('InvalidArgumentError', 'Invalid id received'))
  	}
  })

  return controller
}