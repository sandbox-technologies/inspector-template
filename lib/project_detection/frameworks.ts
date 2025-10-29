import { PackageJson, FrameworkSignal } from "./types";
import { fileExists } from "./fs-helpers";
import * as path from "path";

type FrameworkRule = {
	name: string;
	depSignals?: string[];
	configFiles?: string[];
};

const FRAMEWORK_RULES: FrameworkRule[] = [
	{
		name: "Next.js",
		depSignals: ["next"],
		configFiles: ["next.config.js", "next.config.ts", "next.config.mjs", "next.config.cjs"],
	},
	{
		name: "Vite",
		depSignals: ["vite"],
		configFiles: ["vite.config.ts", "vite.config.js", "vite.config.mjs", "vite.config.cjs"],
	},
	{
		name: "React",
		depSignals: ["react", "react-dom"],
	},
	{
		name: "Vue",
		depSignals: ["vue"],
		configFiles: ["vue.config.js"],
	},
	{
		name: "Svelte",
		depSignals: ["svelte"],
		configFiles: ["svelte.config.js", "svelte.config.ts"],
	},
	{
		name: "Create React App",
		depSignals: ["react-scripts"],
	},
	{
		name: "Remix",
		depSignals: ["@remix-run/react", "@remix-run/dev", "@remix-run/node"],
		configFiles: ["remix.config.js", "remix.config.ts"],
	},
	{
		name: "Gatsby",
		depSignals: ["gatsby"],
		configFiles: ["gatsby-config.js", "gatsby-config.ts"],
	},
	{
		name: "Nuxt",
		depSignals: ["nuxt", "nuxt3"],
		configFiles: ["nuxt.config.js", "nuxt.config.ts"],
	},
	{
		name: "Angular",
		depSignals: ["@angular/core"],
		configFiles: ["angular.json"],
	},
	{
		name: "SvelteKit",
		depSignals: ["@sveltejs/kit"],
		configFiles: ["svelte.config.js", "svelte.config.ts"],
	},
	{
		name: "Astro",
		depSignals: ["astro"],
		configFiles: ["astro.config.js", "astro.config.ts", "astro.config.mjs"],
	},
	{
		name: "Expo",
		depSignals: ["expo"],
		configFiles: ["app.json", "app.config.js"],
	},
	{
		name: "Electron",
		depSignals: ["electron"],
	},
	{
		name: "TypeScript",
		configFiles: ["tsconfig.json"],
	},
	{
		name: "Tailwind CSS",
		depSignals: ["tailwindcss"],
		configFiles: ["tailwind.config.js", "tailwind.config.ts"],
	},
];

function getDependencies(pkg: PackageJson | undefined): Set<string> {
	if (!pkg) return new Set();
	return new Set([
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.devDependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
		...Object.keys(pkg.optionalDependencies || {}),
	]);
}

export async function detectFrameworks(
	repoPath: string,
	pkg: PackageJson | undefined
): Promise<FrameworkSignal[]> {
	const deps = getDependencies(pkg);
	const found: FrameworkSignal[] = [];

	for (const rule of FRAMEWORK_RULES) {
		const signals: string[] = [];

		// Check dependencies
		if (rule.depSignals) {
			for (const dep of rule.depSignals) {
				if (deps.has(dep)) {
					signals.push(`dep: ${dep}`);
				}
			}
		}

		// Check config files
		if (rule.configFiles) {
			for (const file of rule.configFiles) {
				if (await fileExists(path.join(repoPath, file))) {
					signals.push(`config: ${file}`);
				}
			}
		}

		if (signals.length > 0) {
			found.push({ name: rule.name, signals });
		}
	}

	return found;
}


