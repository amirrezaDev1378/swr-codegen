import fs from "fs";
import ejs from "ejs";
import path from "path";
import GetOptions from "../utils/getOptions";
import Prettier from "./prettier";

const FETCHER_TYPES = ["axios", "fetch"];

type ProvidedFetcherType = {
	[key in "axios" | "fetch"]: string;
};

const PROVIDED_FETCHERS: ProvidedFetcherType = {
	axios: fs.readFileSync(path.join(__dirname, "../templates/axiosAdaptor.ejs"), { encoding: "utf-8" }).toString(),
	fetch: fs.readFileSync(path.join(__dirname, "../templates/fetchAdaptor.ejs"), { encoding: "utf-8" }).toString(),
};

interface FileType {
	filename: string;
	content: string;
}

const SaveFile = async (file: FileType) => {
	const prettyFile = await Prettier(file.content);
	fs.mkdirSync(path.join(path.dirname(file.filename)), { recursive: true });
	fs.writeFileSync(path.join(file.filename), prettyFile, { flag: "w+" });
};

const getFetcher = async (targetPath: string, fetcherType?: "axios" | "fetch", fetcherPath?: string) => {
	const { gatewayAddress } = GetOptions.getCachedOptions();
	if (fetcherPath) {
		const isFetcherAvailable = fs.existsSync(fetcherPath);
		if (!isFetcherAvailable) throw new Error(`Fetcher file not found in path:${fetcherPath}`);
		const fetcherContent = fs.readFileSync(fetcherPath, { encoding: "utf-8" }).toString();
		if (!fetcherContent) throw new Error("Failed to read fetcher content");

		return await SaveFile({ filename: path.join(targetPath, `swrFetcher.ts`), content: fetcherContent });
	}
	if (!fetcherType)
		throw new Error(
			"No fetcher type provided, when you use the provided fetcher you need to specify what type of fetcher do you want!"
		);
	if (!FETCHER_TYPES.includes(fetcherType)) throw new Error(`Fetcher type not supported: ${fetcherType}`);

	const fetcherTemplate = PROVIDED_FETCHERS[fetcherType];
	if (!fetcherTemplate) throw new Error("Internal Error: Fetcher template not found");

	const renderedFetcher = ejs.render(fetcherTemplate, { gatewayAddress });
	if (!renderedFetcher) throw new Error("Internal Error: Failed to render fetcher template");

	return await SaveFile({ filename: path.join(targetPath, `swrFetcher.ts`), content: renderedFetcher });
};
export default getFetcher;
