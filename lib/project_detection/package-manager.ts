import * as path from "path";
import { fileExists } from "./fs-helpers";
import { PackageManager } from "./types";

export async function detectPackageManagers(repoPath: string): Promise<PackageManager[]> {
	const found: PackageManager[] = [];
	
	if (await fileExists(path.join(repoPath, "pnpm-lock.yaml"))) found.push("pnpm");
	if (await fileExists(path.join(repoPath, "yarn.lock"))) found.push("yarn");
	if (await fileExists(path.join(repoPath, "bun.lockb"))) found.push("bun");
	if (await fileExists(path.join(repoPath, "package-lock.json"))) found.push("npm");
	
	// If no lockfile found, default to npm
	if (found.length === 0) found.push("npm");
	
	return found;
}
