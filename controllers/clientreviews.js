var BaseController = require("./basecontroller"),
	_ = require("underscore"),
  	swagger = require("swagger-node-restify")



function ClientReviews() {
}

ClientReviews.prototype = new BaseController()

module.exports = function(lib) {
  var controller = new ClientReviews();

  controller.addAction({
  	'path': '/clientreviews',
  	'method': 'POST',
  	'summary': 'Adds a new client review to a book',
  	'params': [swagger.bodyParam('review', 'The JSON representation of the review',  'string')],
  	'responseClass': 'ClientReview',
  	'nickname': 'addClientReview'
  }, function (req, res, next) {
  	var body = req.body
  	if(body) {

  		var newReview = lib.db.model('ClientReview')(body)
  		newReview.save(function (err, rev) {
  			if(err) return next(controller.RESTError('InternalServerError', err))
  			controller.writeHAL(res, rev)
  		})
  	}
  })

  return controller
}