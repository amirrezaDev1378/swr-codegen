import * as prettier from "prettier";

// ! This is only for ts file
const Prettier = async (source: string) => {
	return await prettier.format(source, {
		semi: true,
		singleQuote: false,
		trailingComma: "all",
		printWidth: 80,
		tabWidth: 2,
		useTabs: false,
		parser: "typescript",
		plugins: [require("prettier-plugin-organize-imports")],
	});
};

export default Prettier;
