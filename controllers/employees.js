var BaseController = require("./basecontroller"),
	_ = require("underscore"),
  	swagger = require("swagger-node-restify")



function Employees() {
}

Employees.prototype = new BaseController()

module.exports = function(lib) {
  var controller = new Employees();

  controller.addAction({
  	'path': '/employees',
  	'method': 'GET',
  	'summary': 'Returns the list of employees across all stores',
  	'responseClass': 'Employee',
  	'nickname': 'getEmployees'
  }, function(req, res, next) {
  	lib.db.model('Employee').find().exec(function(err, list) {
  		if(err) return next(controller.RESTError('InternalServerError', err))
      controller.writeHAL(res, list)
  	})
  })


  controller.addAction({
  	'path': '/employees/{id}',
  	'method': 'GET',
  	'params': [swagger.pathParam('id','The id of the employee','string')],
  	'summary': 'Returns the data of an employee',
  	'responseClass': 'Employee',
  	'nickname': 'getEmployee'
  }, function(req, res, next) {
  	var id = req.params.id	
  	if(id) {
	  	lib.db.model('Employee').findOne({_id: id}).exec(function(err, empl) {
	  		if(err) return next(err)
	  		if(!empl) {
	  			return next(controller.RESTError('ResourceNotFoundError', 'Not found'))
	  		}
        controller.writeHAL(res, empl)
	  	})
		} else  {
			next(controller.RESTError('InvalidArgumentError', 'Invalid id'))
	  }
  })


  controller.addAction({
  	'path': '/employees',
  	'method': 'POST',
  	'params': [swagger.bodyParam('employee', 'The JSON data of the employee', 'string')],
  	'summary': 'Adds a new employee to the list',
  	'responseClass': 'Employee',
  	'nickname': 'newEmployee'
  }, function(req, res, next) {
  	var data = req.body
  	if(data) {
  		var newEmployee = lib.db.model('Employee')(data)
  		newEmployee.save(function(err, emp) {
		 		if(err) return next(controller.RESTError('InternalServerError', err))
		  	controller.writeHAL(res, emp)
  		})
  	} else {
  		next(controller.RESTError('InvalidArgumentError', 'No data received'))
  	}
  })

  controller.addAction({
  	'path': '/employees/{id}',
  	'method': 'PUT',
  	'summary': "UPDATES an employee's information",
  	'params': [swagger.pathParam('id','The id of the employee','string'), swagger.bodyParam('employee', 'The new information to update', 'string')],
  	'responseClass': 'Employee',
  	'nickname': 'updateEmployee'
  }, function(req, res, next) {
  	var data = req.body
  	var id = req.params.id
  	if(id) {
  		
  		lib.db.model("Employee").findOne({_id: id}).exec(function(err, emp) {
	 			if(err) return next(controller.RESTError('InternalServerError', err))
	  		emp = _.extend(emp, data)
	  		emp.save(function(err, employee) {
			 		if(err) return next(controller.RESTError('InternalServerError', err))
			 		controller.writeHAL(res, employee)
	  		})
  		})
  	} else {
  		next(controller.RESTError('InvalidArgumentError','Invalid id received'))
  	}
  })

  return controller
}