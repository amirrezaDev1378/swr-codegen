import * as util from "util";
import { exec } from "child_process";
import { name, version } from "../package.json";
import fs from "fs";
import path from "path";

const exampleProjectPath = path.join(process.cwd(), "../", "swr-codegen-examples").replaceAll("\\", "/");
const tgzFilePath = path.join(process.cwd(), `${name}-v${version}.tgz`).replaceAll("\\", "/");

(async () => {
	const pExec = util.promisify(exec);
	if (!version || !name) return;

	if (fs.existsSync(tgzFilePath)) {
		console.log("Removing current build ...");
		fs.rmSync(tgzFilePath);
		console.log(`Removed ${tgzFilePath}`);
	}

	console.info("yarn pack");
	const { stdout, stderr } = await pExec("yarn pack");
	if (stderr) throw stderr;
	console.log(stdout);

	console.info("yarn run build");
	const { stdout: buildStdout, stderr: BuildStderr } = await pExec("yarn run build").catch((e) => e);
	if (BuildStderr) return console.error(BuildStderr);

	console.log(buildStdout);

	const tgzFile = fs.readFileSync(tgzFilePath);

	if (!tgzFile) throw new Error("Tgz File Not found.");

	console.info(`cd ${exampleProjectPath} && yarn remove ${tgzFilePath}`);
	const { stdout: rmOut, stderr: rmErr } = await pExec(
		`cd ${exampleProjectPath} && yarn remove ${tgzFilePath}  --ignore-warnings --silent`,
		{}
	).catch((e) => e);
	if (rmErr) console.error(rmErr);
	console.log(rmOut);

	console.info(`cd ${exampleProjectPath} && yarn add ${tgzFilePath}`);

	const { stdout: installOut, stderr: installErr } = await pExec(
		`cd ${exampleProjectPath} && yarn add ${tgzFilePath} --force --ignore-warnings --silent`,
		{}
	).catch((e) => e);
	if (installErr) console.error(installErr);

	console.log(installOut);

	if (installErr) return;
	console.log("Done!");
})();
