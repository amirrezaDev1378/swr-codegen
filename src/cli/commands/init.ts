import prompts from "prompts";
import fs from "fs";
import path from "path";
import ejs from "ejs";

const SaveFile = async (file: { filename: string; content: any }) => {
	const exists = fs.existsSync(path.join(process.cwd(), path.dirname(file.filename)));
	if (!exists) {
		fs.mkdirSync(path.join(process.cwd(), path.dirname(file.filename)), { recursive: true });
	}
	fs.writeFileSync(path.join(process.cwd(), file.filename), file.content, { flag: "w+" });
};
const getInitOptions = async () => {
	const options = await prompts(
		[
			{
				type: "text",
				name: "configFileName",
				message: "What would you like to name the config file ?",
				initial: "swr-codegen.config.js",
				validate: (v) => {
					if (typeof v !== "string") return "Invalid value type";
					return v.trim().endsWith(".js") ? true : "Config file must be a .js file";
				},
			},
			{
				type: "confirm",
				name: "addScript",
				message: "Would you like to add a script to package.json ?",
				initial: true,
			},
			{
				type: "confirm",
				name: "gatewayAddress",
				message: "what is your gateway address ?",
				initial: "https://graphqlzero.almansi.me/api",
				hint: "this is the address of your graphql server"
			},
			{
				type: "text",
				name: "gqlGlob",
				message: "What is the glob for your gql files ?",
				initial: "/**/*.gql",
				hint: "this should be globby pattern, read more at https://github.com/isaacs/minimatch#usage",
			},
			{
				type: "text",
				name: "targetPath",
				message: "Where would you like to generate the code ?",
				initial: "./src/generated/swr",
			},
			{
				type: "select",
				name: "schemaType",
				message: "How would you like to address your schema ?",
				choices: [
					{ title: "URL", value: "url" },
					{ title: "File", value: "file" },
					{ title: "Custom Function", value: "function" },
				],
			},
			{
				type: (prev) => (prev === "url" ? "text" : null),
				name: "schemaUrl",
				message: "What is the url of your schema ?",
				initial: "http://localhost:4000/graphql",
			},
			{
				type: (prev) => (prev === "file" ? "text" : null),
				name: "schemaFile",
				message: "What is the path to your schema file ?",
				initial: "./schema.graphql",
			},
		],
		{
			onCancel: () => {
				console.log("🚨 Command cancelled");
				process.exit(1);
			},
		}
	);
	return options;
};

const saveConfigFile = async (
	filename: string,
	templateConfig: {
		gqlGlob: string;
		targetPath: string;
		schema: string;
	}
) => {
	const { targetPath, schema, gqlGlob } = templateConfig;
	try {
		const configFileTemplate = fs.readFileSync(path.join(__dirname, "../../templates/configFile.ejs")).toString();
		const configFile = ejs.render(configFileTemplate, {
			gqlGlob,
			targetPath,
			schema,
		});
		await SaveFile({ filename, content: configFile });
		console.log(`🎉 Config file generated!`);
	} catch (e) {
		console.log(`🚨 Error generating config file: ${(e as any)?.message || e}`);
		process.exit(1);
	}
};

const updatePackageJson = async (configName: string) => {
	console.log("🤗 Adding script to your package.json");
	try {
		const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")).toString());
		packageJson.scripts = {
			...packageJson.scripts,
			codegen: `swr-codegen --configPath=${configName}`,
		};
		await SaveFile({ filename: "package.json", content: JSON.stringify(packageJson, null, 2) });
		console.log("🎉 Script added to your package.json");
	} catch (e) {
		console.log(`🚨 Error adding script to package.json: ${(e as any)?.message || e}`);
		process.exit(1);
	}
};
const InitCommand = async () => {
	const { targetPath, gqlGlob, addScript, configFileName, schemaFile, schemaType, schemaUrl, gatewayAddress } = await getInitOptions();
	console.log(`😎 Generating your config file...`);
	const schema: string = (() => {
		if (schemaType === "file") return `\"${schemaFile}\"`;
		if (schemaType === "url") return `\"${schemaUrl}\"`;
		return `
async () => {
return fs.readFileSync("graphql/schema.graphql").toString();
},`.trim();
	})();

	await saveConfigFile(configFileName, { schema, gqlGlob, targetPath });
	if (addScript) {
		await updatePackageJson(configFileName);
	}
	console.log(`🎉 Script finished successfully!`);
	process.exit(0);
};

export default InitCommand;
