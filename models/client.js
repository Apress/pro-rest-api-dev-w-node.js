var mongoose = require("mongoose"),
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers"),
	_ = require("underscore")



module.exports = function(db) {
	var schema = require("../schemas/client.js")
	var modelDef = db.getModelFromSchema(schema)

	modelDef.schema.methods.toHAL = function() {
		var halObj = helpers.makeHAL(this.toJSON())
		return halObj
	}
	
	return mongoose.model(modelDef.name, modelDef.schema)
}