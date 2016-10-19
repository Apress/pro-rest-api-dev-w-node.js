var restify = require("restify"),
	colors = require("colors"),
	lib = require("./lib"),
	swagger = require("swagger-node-restify"),
	config = lib.config

var server = restify.createServer(lib.config.server)

server.use(restify.queryParser())
server.use(restify.bodyParser())

restify.defaultResponseHeaders = function(data) {
  this.header('Access-Control-Allow-Origin', '*')
}

///Middleware to check for valid api key sent
server.use(function(req, res, next) {
	//We move forward if we're dealing with the swagger-ui or a valid key
	if(req.url.indexOf("swagger-ui") != -1 || lib.helpers.validateKey(req.headers.hmacdata || '', req.params.api_key, lib)) {
		next()
	} else {
		res.send(401, { error: true, msg: 'Invalid api key sent'})
	}
})

/**
Validate each request, as long as there is a schema for it
*/
server.use(function(req, res, next) {
	var results = lib.schemaValidator.validateRequest(req)
	if(results.valid) {
		next()
	} else {
		res.send(400, results)
	}
})

//the swagger-ui is inside the "swagger-ui" folder
server.get(/^\/swagger-ui(\/.*)?/, restify.serveStatic({
 	directory: __dirname + '/',
 	default: 'index.html'
 }))


swagger.addModels(lib.schemas)
swagger.setAppHandler(server)
lib.helpers.setupRoutes(server, swagger, lib)

swagger.configureSwaggerPaths("", "/api-docs", "") //we remove the {format} part of the paths, to
swagger.configure('http://localhost:9000', '0.1')


server.listen(config.server.port, function() {
	console.log("Server started succesfully...".green)	
	lib.db.connect(function(err) {
		if(err) console.log("Error trying to connect to database: ".red, err.red)
		else console.log("Database service successfully started".green)
	})
})