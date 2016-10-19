var mongoose = require("mongoose")
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers"),
	_ = require("underscore")



module.exports = function(db) {
	var schema = require("../schemas/author.js")
	var modelDef = db.getModelFromSchema(schema)

	modelDef.schema.plugin(jsonSelect, '-books')
	modelDef.schema.methods.toHAL = function() {
		var halObj = helpers.makeHAL(this.toJSON(),
									[{name: 'books', 'href': '/authors/' + this.id + '/books', 'title': 'Books'}])

		if(this.books.length > 0) {
			if(this.books[0].toString().length != 24) {
				halObj.addEmbed('books', _.map(this.books, function(e) { return e.toHAL() }))

			}
		}

		return halObj
	}
	

	return mongoose.model(modelDef.name, modelDef.schema)
}