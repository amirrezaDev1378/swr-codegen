export const isValidJson = (target: unknown) => {
	if (!target) return false;
	if (typeof target === "string") {
		try {
			JSON.parse(target);
			return true;
		} catch (e) {
			return false;
		}
	}

	if (typeof target === "object") {
		try {
			JSON.parse(JSON.stringify(target));
			return true;
		} catch (e) {
			return false;
		}
	}
	return false;
};

export const isValidUrl = (target: unknown) => {
	if (!target) return false;
	if (typeof target === "string") {
		try {
			new URL(target);
			return true;
		} catch (e) {
			return false;
		}
	}
	return false;
};
