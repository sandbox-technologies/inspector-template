import * as path from "path";
import { readJsonSafe } from "./fs-helpers";
import { DetectResult, PackageJson } from "./types";
import { detectFrameworks } from "./frameworks";
import { detectPackageManagers } from "./package-manager";
import { generateSetupCommands } from "./scripts";
import { getProjectMetadata } from "./metadata";
import { expandGlobs, getWorkspaceGlobs, isMonorepoRoot } from "./monorepo";

export async function detect(repoPath: string): Promise<DetectResult> {
	const pkgPath = path.join(repoPath, "package.json");
	const pkg = await readJsonSafe<PackageJson>(pkgPath);

	// Detect all the things
	const frameworks = await detectFrameworks(repoPath, pkg);
	const packageManagers = await detectPackageManagers(repoPath);
	const commands = generateSetupCommands(pkg, packageManagers);
	const { name, description } = await getProjectMetadata(repoPath, pkg);

	// Monorepo handling
	const mono = await isMonorepoRoot(repoPath, pkg);
	if (mono) {
		const globs = await getWorkspaceGlobs(repoPath, pkg);
		const dirs = await expandGlobs(repoPath, globs);
		const candidates: DetectResult[] = [];
		
		for (const d of dirs) {
			const childPkg = await readJsonSafe<PackageJson>(path.join(d, "package.json"));
			if (!childPkg) continue;
			
			// Include packages that have any dev script or any framework detected
			const childDetection = await detectSingle(d);
			if (childDetection.frameworks.length > 0 || childDetection.commands.dev !== 'echo "No dev script found. Check package.json for available scripts."') {
				candidates.push(childDetection);
			}
		}
		
		return {
			packagePath: repoPath,
			frameworks,
			packageManagers,
			name,
			description,
			commands,
			monorepo: { isMonorepo: true, candidates },
		};
	}

	return {
		packagePath: repoPath,
		frameworks,
		packageManagers,
		name,
		description,
		commands,
	};
}

async function detectSingle(repoPath: string): Promise<DetectResult> {
	const pkgPath = path.join(repoPath, "package.json");
	const pkg = await readJsonSafe<PackageJson>(pkgPath);
	
	const frameworks = await detectFrameworks(repoPath, pkg);
	const packageManagers = await detectPackageManagers(repoPath);
	const commands = generateSetupCommands(pkg, packageManagers);
	const { name, description } = await getProjectMetadata(repoPath, pkg);
	
	return {
		packagePath: repoPath,
		frameworks,
		packageManagers,
		name,
		description,
		commands,
	};
}

export * from "./types";


