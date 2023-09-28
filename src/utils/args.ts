const extractArgs = () => {
	const args = process.argv.slice(2);
	const argsObj: any = {};
	args.forEach((arg) => {
		const [key, value] = arg.trim().split("=");
		argsObj[key] = value;
	});
	return argsObj;
};

export default extractArgs;
