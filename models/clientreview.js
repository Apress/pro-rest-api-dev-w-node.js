var mongoose = require("mongoose"),
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers"),
	_ = require("underscore")



module.exports = function(db) {
	var schema = require("../schemas/clientreview.js")
	var modelDef = db.getModelFromSchema(schema)

	modelDef.schema.methods.toHAL = function() {
		var halObj = helpers.makeHAL(this.toJSON())
		return halObj
	}

	modelDef.schema.post('save', function(doc, next) {
		db.model('Book').update({_id: doc.book}, {$addToSet: {reviews: this.id}}, function(err) {
			next(err)
		})
	})
	
	return mongoose.model(modelDef.name, modelDef.schema)
}