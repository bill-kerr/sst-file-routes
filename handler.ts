function getSlashCount(str: string): number {
	let count = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === "/") {
			count++;
		}
	}
	return count;
}

const handlerFileNames = new Set([
	"get.ts",
	"post.ts",
	"patch.ts",
	"options.ts",
	"delete.ts",
	"put.ts",
] as const);
type HandlerFileName = typeof handlerFileNames extends Set<infer R> ? R : never;

export function isHandlerFile(fileName: string): fileName is HandlerFileName {
	return handlerFileNames.has(fileName as HandlerFileName);
}

const handlerMethods = new Set(["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"] as const);
export type HandlerMethod = typeof handlerMethods extends Set<infer R> ? R : never;

function isHandlerMethod(method: string): method is HandlerMethod {
	return handlerMethods.has(method as HandlerMethod);
}

export class Handler {
	public readonly filePath: string;
	public readonly handlerPath: string;
	public readonly params: string[] = [];
	public readonly method: HandlerMethod;
	public readonly isDefaultHandler: boolean;

	private readonly rootPath: string;

	constructor(filePath: string, rootPath: string) {
		this.filePath = filePath;
		this.rootPath = rootPath;
		this.isDefaultHandler = filePath.endsWith("$default.ts");

		/**
		 * Set the handler path.
		 */
		this.handlerPath = this.filePath.slice(0, this.filePath.length - 3).concat(".handler");

		/**
		 * Set the handler method.
		 */
		const method = this.handlerPath
			.slice(this.handlerPath.lastIndexOf("/") + 1, this.handlerPath.length - 8)
			.toUpperCase();
		if (!isHandlerMethod(method) && this.isDefaultHandler) {
			// Doesn't matter what this is, it won't be used.
			this.method = "GET";
		} else if (isHandlerMethod(method)) {
			this.method = method;
		} else {
			throw new Error(`Invalid handler file method: ${method}`);
		}

		/**
		 * Parse out handler path parameters.
		 */
		const matches = this.handlerPath.matchAll(/{(.*?)}/g);
		const used = new Set<string>();

		for (const match of matches) {
			if (used.has(match[1])) {
				throw new Error(
					`A path parameter appeared twice in a handler path. Parameter: ${match[1]} Path: ${this.handlerPath}`,
				);
			}
			this.params.push(match[1]);
			used.add(match[1]);
		}
	}

	public pathString(): string {
		if (this.isDefaultHandler) {
			return "$default";
		}

		const urlPath = this.handlerPath.replace(this.rootPath, "");
		const lastSlashPosition = urlPath.lastIndexOf("/");
		const slashCount = getSlashCount(urlPath);
		const sliceOffset = slashCount === 1 ? 1 : 0;
		return `${this.method} ${urlPath.slice(urlPath.indexOf("/"), lastSlashPosition + sliceOffset)}`;
	}
}
