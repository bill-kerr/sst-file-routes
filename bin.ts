#!/usr/bin/env node

import path from "path";
import fs from "fs";
import { isHandlerFile } from "./handler";
import { createRoutesFile } from "./create-routes";

function normalizePath(filePath: string): string {
	try {
		return path.normalize(filePath).replace(/[\\]/g, "/");
	} catch {
		throw new Error(`Path ${filePath} is not a valid path.`);
	}
}

/**
 * @returns The path to the routes folder.
 */
function getRoutesDirPath() {
	const arg = process.argv[2];
	if (!arg || arg.length < 1) {
		throw new Error("No argument supplied for routes directory!");
	} else if (!isDirectory(arg)) {
		throw new Error(`Path ${arg} is not a directory.`);
	}

	return normalizePath(arg);
}

function isDirectory(targetPath: string): boolean {
	try {
		return fs.lstatSync(targetPath).isDirectory();
	} catch {
		return false;
	}
}

/**
 * Recursively returns all handler file paths in a given directory.
 */
function getHandlerFilePaths(baseDir: string, depth: number): string[] {
	const filePaths: string[] = [];
	const items = readDirectory(baseDir);

	for (const item of items) {
		if (isDirectory(path.join(baseDir, item))) {
			filePaths.push(...getHandlerFilePaths(path.join(baseDir, item), depth + 1));
		} else if (isHandlerFile(item) || (depth === 0 && item === "$default.ts")) {
			filePaths.push(normalizePath(path.join(baseDir, item)));
		}
	}

	return filePaths;
}

function writeFile(filePath: string, contents: string) {
	fs.writeFileSync(filePath, contents);
}

function readDirectory(location: string): string[] {
	return fs.readdirSync(location);
}

export function main() {
	const routesDirPath = getRoutesDirPath();
	const handlerFilePaths = getHandlerFilePaths(routesDirPath, 0);
	const fileContents = createRoutesFile(routesDirPath, handlerFilePaths);
	writeFile(path.join(routesDirPath, "routes.ts"), fileContents);
}

main();
