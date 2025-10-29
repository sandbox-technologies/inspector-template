import { promises as fs } from "fs";
import * as path from "path";

export async function fileExists(p: string): Promise<boolean> {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

export async function readJsonSafe<T = any>(p: string): Promise<T | undefined> {
	try {
		const buf = await fs.readFile(p, "utf8");
		return JSON.parse(buf) as T;
	} catch {
		return undefined;
	}
}

export async function readTextSafe(p: string): Promise<string | undefined> {
	try {
		return await fs.readFile(p, "utf8");
	} catch {
		return undefined;
	}
}

export async function listFilesRecursive(dir: string): Promise<string[]> {
	const out: string[] = [];
	async function walk(d: string) {
		let entries: any[] = [];
		try {
			entries = await fs.readdir(d, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			const full = path.join(d, entry.name);
			if (entry.isDirectory()) {
				// skip huge directories by convention
				if (["node_modules", ".git", "dist", "build", ".next"].includes(entry.name)) continue;
				await walk(full);
			} else {
				out.push(full);
			}
		}
	}
	await walk(dir);
	return out;
}

export function join(...parts: string[]): string {
	return path.join(...parts);
}

export function basename(p: string): string {
	return path.basename(p);
}


