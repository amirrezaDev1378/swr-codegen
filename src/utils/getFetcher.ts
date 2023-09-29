import fs from "fs";
import ejs from "ejs";

const FETCHER_TYPES = ["axios", "fetch"];

type ProvidedFetcherType = {
	[key in "axios" | "fetch"]: string;
};

const PROVIDED_FETCHERS: ProvidedFetcherType = {
	axios: fs.readFileSync("../templates/axiosAdaptor.ejs", { encoding: "utf-8" }).toString(),
	fetch: fs.readFileSync("../templates/fetchAdaptor.ejs", { encoding: "utf-8" }).toString(),
};
const getFetcher = async (targetPath: string, fetcherType?: "axios" | "fetch", fetcherPath?: string) => {
	if (fetcherPath) {
		const isFetcherAvailable = fs.existsSync(fetcherPath);
		if (!isFetcherAvailable) throw new Error(`Fetcher file not found in path:${fetcherPath}`);
		const fetcherContent = fs.readFileSync(fetcherPath, { encoding: "utf-8" }).toString();
		if (!fetcherContent) throw new Error("Failed to read fetcher content");
		return fs.writeFileSync(`${targetPath}/swrFetcher.ts`, fetcherContent, { flag: "w+", encoding: "utf-8" });
	}
	if (!fetcherType)
		throw new Error(
			"No fetcher type provided, when you use the provided fetcher you need to specify what type of fetcher do you want!"
		);
	if (!FETCHER_TYPES.includes(fetcherType)) throw new Error(`Fetcher type not supported: ${fetcherType}`);

	const fetcherTemplate = PROVIDED_FETCHERS[fetcherType];
	if (!fetcherTemplate) throw new Error("Internal Error: Fetcher template not found");

	const renderedFetcher = ejs.render(fetcherTemplate, {});
	if (!renderedFetcher) throw new Error("Internal Error: Failed to render fetcher template");

	return fs.writeFileSync(`${targetPath}/swrFetcher.ts`, renderedFetcher, { flag: "w+", encoding: "utf-8" });
};
