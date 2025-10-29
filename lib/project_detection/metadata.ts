import * as path from "path";
import { PackageJson } from "./types";
import { readTextSafe } from "./fs-helpers";

export async function getProjectMetadata(
	repoPath: string,
	pkg?: PackageJson
): Promise<{ name: string; description?: string }> {
	// Name: package.json name (without scope) > folder name
	let name = pkg?.name || path.basename(repoPath);
	if (name.startsWith("@") && name.includes("/")) {
		name = name.split("/")[1];
	}

	// Description: package.json description > first README paragraph
	let description = pkg?.description;
	
	if (!description) {
		const readmeFiles = ["README.md", "readme.md", "README", "README.txt"];
		for (const file of readmeFiles) {
			const content = await readTextSafe(path.join(repoPath, file));
			if (content) {
				// Get first paragraph after headers
				const lines = content.split("\n");
				for (const line of lines) {
					const trimmed = line.trim();
					if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("![")) {
						description = trimmed.slice(0, 200);
						break;
					}
				}
				break;
			}
		}
	}

	return { name, description };
}
