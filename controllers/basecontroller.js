var _ = require("underscore"),
	restify = require("restify"),
	colors = require("colors"),
	halson = require("halson"),
	lib = require("../lib/index")

function BaseController() {
	this.actions = []
	this.server = null
}

BaseController.prototype.setUpActions = function(app, sw) {
	this.server = app
	_.each(this.actions, function(act) {
		var method = act['spec']['method']
		console.log("Setting up auto-doc for (", method, ") - ", act['spec']['nickname'])
		sw['add' + method](act)
		app[method.toLowerCase()](act['spec']['path'], act['action'])
	})
}

BaseController.prototype.addAction = function(spec, fn) {
	var newAct = {
		'spec': spec,
		action: fn
	}
	this.actions.push(newAct)
}

BaseController.prototype.RESTError = function(type, msg) {
	if(restify[type]) {
		return new restify[type](msg.toString())
	} else {
		console.log("Type " + type + " of error not found".red)
	}
}

/**
Takes care of calling the "toHAL" method on every resource before writing it 
back to the client
*/
BaseController.prototype.writeHAL = function(res, obj) {
	if(Array.isArray(obj)) {
		var newArr = []
      _.each(obj, function(item, k) {
        item = item.toHAL()
        newArr.push(item)
      })
      obj = halson(newArr) //lib.helpers.makeHAL(newArr)
	} else {
		if(obj && obj.toHAL)
			obj = obj.toHAL()
	}
	if(!obj) {
		obj = {}
	}
  	res.json(obj) 
}

/**
Returns a HAL object, using the attributes passed.
@data Is the JSON data
@links(optional) An array of links objects ({name, href, title(optional)})
@embed(optional) A list of embedded JSON objects with the form: ({name, data})
BaseController.prototype.toHAL = function(data, links, embed) {
	var obj = halson(data)

	if(links && links.length > 0) {
		_.each(links, function(lnk) {
			obj.addLink(lnk.name, {
				href: lnk.href,
				title: lnk.title || ''
			})
		})
	}

	if(embed && embed.length > 0) {
		_.each(embed, function (item) {
			obj.addEmbed(item.name, item.data)
		})
	}

	return obj
}


*/
module.exports = BaseController