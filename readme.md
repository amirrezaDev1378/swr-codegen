# SWR GraphQl Code Generator

### A powerful code generator that Generate SWR hooks from GraphQL queries & mutations A Powerfull Code Generator For SWR

[![npm version](https://badge.fury.io/js/swr-codegen.svg)](https://badge.fury.io/js/swr-codegen)
[![npm downloads](https://img.shields.io/npm/dm/swr-codegen.svg)](https://www.npmjs.com/package/swr-codegen)

# Table Of Contents

<!-- TOC -->

- [How to Use](#how-to-use)

<!-- TOC -->

## How to Use

Installing The Package:

⚠️ This package does not support global installation anymore,

you can install it in your project using:

    npm i swr-codegen -d

Adding config file inside your project:

1. create a javascript file anywhere in your project e.g. `codegen-config.js`

2. add your configs:

you can use the init command : `swr-codegen --init`
to create a config file with default configs, or you can create a config file manually:

```js
const fs = require("fs");

module.exports = {
	gqlGlob: "./**/*.gql",
	targetPath: "/generated/swr/",
	schema: async () => {
		return fs.readFileSync("graphql/schema.graphql").toString();
	},
};
```

3. (optional) Add a codegen command to your package.json:

```json

"scripts": {
  ...
  "codegen": "swr-codegen --configPath=./codegen-config.js"
}

```

That's it! run `npm run codegen` (or `swr-codegen configPath=./codegen-config.js`)

High-Priority Tasks:

- add a better error-handling system.

- add an option to customize the EJS templates.

- adding path normalizer

Repository Owners:

[Rasoul](https://github.com/rasoulm777) And [Amirreza](https://github.com/amirrezaDev1378)
