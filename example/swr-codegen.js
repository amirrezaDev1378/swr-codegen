const fs = require("fs");

module.exports = {
	gqlGlob: "example/**/*.gql",
	targetPath: "/example/generated/swr/",
	schema: async () => {
		return fs.readFileSync("example/graphql/schema.graphql").toString();
	},
};
