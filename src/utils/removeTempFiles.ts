import fs from "fs";
import path from "path";

const deleteFile = (filePath: string) => {
	const rootPath = path.join(__dirname, "../../", filePath);
	const exist = fs.existsSync(rootPath);
	if (!exist)
		return console.warn(`Failed To Remove Temp Files , ${rootPath} does not exist.
    Please open a new issue at github
    `);
	return fs.rmSync(rootPath, {
		recursive: true,
		force: true,
		maxRetries: 3,
		retryDelay: 400,
	});
};

const removeTempFiles = async (): Promise<boolean> => {
	// I did not delete the temp folder because I want to catch any issues that might occur with certain files
	const tempFiles = ["temp/schema.graphql", "temp/config.ts", "temp/types"];
	try {
		for (const tempFile of tempFiles) {
			deleteFile(tempFile);
		}
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

export default removeTempFiles;
