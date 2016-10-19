var mongoose = require("mongoose"),
	jsonSelect = require("mongoose-json-select"),
	_ = require("underscore"),
	helpers = require("../lib/helpers")	



module.exports = function(db) {
	var schema = require("../schemas/store.js")
	var modelDef = db.getModelFromSchema(schema)

	modelDef.schema.plugin(jsonSelect, '-employees')
	modelDef.schema.methods.toHAL = function() {
		var halObj = helpers.makeHAL(this.toJSON(), 
						[{name: 'books', href: '/stores/' + this.id + '/books', title: 'Books'},
      					 {name: 'booksales', href: '/stores/' + this.id + '/booksales', title: 'Book Sales'}])
		if(this.employees.length > 0) {
			if(this.employees[0].toString().length != 24) {
				halObj.addEmbed('employees', _.map(this.employees, function(e) { return e.toHAL() }))
			}
		}
		return halObj
	}

	var model = mongoose.model(modelDef.name, modelDef.schema)

	return model
}