# SWR GraphQl Code Generator

### ⚠️ This Project is **under development**, and we strongly advise you to wait a couple of weeks to use this in **production applications**

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

<--- To Be Completed --->

High-Priority Tasks:

- ~~add support for mutations~~

- add support for fragments

- Complete this documentation.

- add a docusaurus page for the repo.

- add issue templates.

- add a better error-handling system.

- ~~release to NPM~~

- ~~added init command~~

- add an option to customize the EJS templates.

...

Repository Owners:

[Rasoul](https://github.com/rasoulm777) And [Amirreza](https://github.com/amirrezaDev1378)
