import * as path from "path";
import { promises as fs } from "fs";
import { readJsonSafe, fileExists } from "./fs-helpers";
import { PackageJson } from "./types";

export async function isMonorepoRoot(repoPath: string, pkg?: PackageJson): Promise<boolean> {
	if (!pkg) pkg = await readJsonSafe<PackageJson>(path.join(repoPath, "package.json"));
	if (!pkg) return false;
	if (pkg.workspaces) return true;
	if (await fileExists(path.join(repoPath, "pnpm-workspace.yaml"))) return true;
	if (await fileExists(path.join(repoPath, "nx.json"))) return true;
	if (await fileExists(path.join(repoPath, "turbo.json"))) return true;
	if (await fileExists(path.join(repoPath, "lerna.json"))) return true;
	return false;
}

export async function getWorkspaceGlobs(repoPath: string, pkg?: PackageJson): Promise<string[]> {
	if (!pkg) pkg = await readJsonSafe<PackageJson>(path.join(repoPath, "package.json"));
	let globs: string[] = [];
	if (pkg?.workspaces) {
		if (Array.isArray(pkg.workspaces)) globs = pkg.workspaces;
		else if (pkg.workspaces?.packages) globs = pkg.workspaces.packages;
	}
	// try pnpm-workspace.yaml basic parse
	if (!globs.length && (await fileExists(path.join(repoPath, "pnpm-workspace.yaml")))) {
		try {
			const txt = await fs.readFile(path.join(repoPath, "pnpm-workspace.yaml"), "utf8");
			const m = /packages\s*:\s*([\s\S]*)/m.exec(txt);
			if (m) {
				const lines = m[1]
					.split(/\n/)
					.map((l) => l.trim())
					.filter((l) => l.startsWith("- "))
					.map((l) => l.replace(/^-\s+/, ""));
				globs = lines;
			}
		} catch (error) {
			console.error("Error parsing pnpm-workspace.yaml", error);
		}
	}
	// common defaults if still empty
	if (!globs.length) globs = ["apps/*", "packages/*", "examples/*"];
	return globs;
}

export async function expandGlobs(repoPath: string, globs: string[]): Promise<string[]> {
	// extremely small globber supporting simple */ segment
	const dirs = await fs.readdir(repoPath, { withFileTypes: true });
	const out: string[] = [];
	for (const g of globs) {
		const parts = g.split("/");
		if (parts.length === 2 && parts[1] === "*") {
			const base = path.join(repoPath, parts[0]);
			try {
				const subs = await fs.readdir(base, { withFileTypes: true });
				for (const s of subs) if (s.isDirectory()) out.push(path.join(base, s.name));
			} catch (error) {
				console.error("Error reading directory", error);
			}
		} else {
			const abs = path.join(repoPath, g);
			if (await fileExists(abs)) out.push(abs);
		}
	}
	// also include top-level dirs for cases like "apps/**"
	for (const d of dirs) {
		if (!d.isDirectory()) continue;
		const name = d.name;
		if (["apps", "packages", "examples"].includes(name)) {
			try {
				const subs = await fs.readdir(path.join(repoPath, name), { withFileTypes: true });
				for (const s of subs) if (s.isDirectory()) out.push(path.join(repoPath, name, s.name));
			} catch (error) {
				console.error("Error reading directory", error);
			}
		}
	}
	return Array.from(new Set(out));
}


