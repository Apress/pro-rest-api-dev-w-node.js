

module.exports = function(db) {
	return {
		"Book": require("./book")(db),
		"Booksale": require("./booksale")(db),
		"ClientReview": require("./clientreview")(db),
		"Client": require("./client")(db),
		"Employee": require("./employee")(db),
		"Store": require("./store")(db),
		"Author": require("./author")(db)
	}
}