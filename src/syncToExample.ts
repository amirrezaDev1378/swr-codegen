import * as util from "util";
import { exec } from "child_process";
import { name, version } from "../package.json";
import fs from "fs";
import path from "path";

const exampleProjectPath = path.join(process.cwd(), "../", "swr-codegen-examples").replaceAll("\\", "/");
const tgzFilePath = path.join(process.cwd(), `${name}-${version}.tgz`).replaceAll("\\", "/");
//

(async () => {
	const pExec = util.promisify(exec);
	if (!version || !name) return;

	console.info("npm pack");
	const { stdout, stderr } = await pExec("npm pack").then((e) => ({ stdout: e, stderr: null }));
	if (stderr) throw stderr;
	console.log(stdout);

	console.info("yarn run build");
	const { stdout: buildStdout, stderr: BuildStderr } = await pExec("yarn run build").catch((e) => e);
	if (BuildStderr) return console.error(BuildStderr);

	console.log(buildStdout);

	const tgzFile = fs.readFileSync(tgzFilePath);

	if (!tgzFile) throw new Error("Tgz File Not found.");

	console.info(`cd ${exampleProjectPath} && yarn remove swr-codegen`);
	const { stdout: rmOut, stderr: rmErr } = await pExec(
		`cd ${exampleProjectPath} && yarn remove swr-codegen  --ignore-warnings --silent`,
		{}
	).catch((e) => e);
	if (rmErr) console.error(rmErr);
	console.log(rmOut);

	console.log("removing yarn cache for swr-codegen");
	const { stdout: cacheOut, stderr: cacheErr } = await pExec(
		`cd ${exampleProjectPath} && yarn cache clean swr-codegen`,
		{}
	).catch((e) => e);

	console.info(`cd ${exampleProjectPath} && yarn add ${tgzFilePath}`);
	const { stdout: installOut, stderr: installErr } = await pExec(
		`cd ${exampleProjectPath} && yarn add ${tgzFilePath} --check-files --ignore-warnings --silent`,
		{}
	).catch((e) => e);
	if (installErr) console.error(installErr);

	console.log(installOut);

	if (fs.existsSync(tgzFilePath)) {
		console.log("Removing current build ...");
		fs.rmSync(tgzFilePath);
		console.log(`Removed ${tgzFilePath}`);
	}

	if (installErr) return;

	console.log("Done!");
})();
