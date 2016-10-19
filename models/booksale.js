var mongoose = require("mongoose"),
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers"),
	_ = require("underscore")




module.exports = function(db) {
	var schema = require("../schemas/booksale.js")
	var modelDef = db.getModelFromSchema(schema)

	modelDef.schema.plugin(jsonSelect, '-store -employee -client -books')
	modelDef.schema.methods.toHAL = function() {
		var halObj = helpers.makeHAL(this.toJSON())


		if(this.books.length > 0) {
			if(this.books[0].toString().length != 24) {
				halObj.addEmbed('books', _.map(this.books, function(b) { return b.toHAL() }))
			}
		}

		if(this.store.toString().length != 24) {
			halObj.addEmbed('store', this.store.toHAL())
		}

		if(this.employee.toString().length != 24) {
			halObj.addEmbed('employee', this.employee.toHAL())
		}

		if(this.client.toString().length != 24) {
			halObj.addEmbed('client', this.client.toHAL())
		}

		return halObj

	}
		

	return mongoose.model(modelDef.name, modelDef.schema)
}