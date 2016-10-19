var tv4 = require("tv4"),
	formats = require("tv4-formats"),
	schemas = require("../request_schemas/")


module.exports = {
	validateRequest: validate
}


function validate (req) {
	var res = {valid: true}
	tv4.addFormat(formats)
	var schemaKey = req.route ? req.route.path.toString().replace("/", "") : ''
	var actionKey = req.route.name
	if(schemas[schemaKey])	{
		var mySchema = schemas[schemaKey][actionKey]
		var data = null
		if(mySchema) {
			switch(mySchema.validate) {
				case 'params':
					data = req.params
				break
			}
			res = tv4.validateMultiple(data, mySchema.schema)
		}
	}

	return res
}


