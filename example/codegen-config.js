const fs = require("fs");

module.exports = {
	gqlGlob: "./**/*.gql",
	targetPath: "/generated/swr/",
	schema: async () => {
		return fs.readFileSync("graphql/schema.graphql").toString();
	},
};
