export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

export type FrameworkSignal = {
	name: string;
	signals: string[]; // what we found (deps, configs, etc)
};

export type SetupCommands = {
	install: string; // Command to install dependencies
	dev: string; // Command to start dev environment
	setup: string; // Combined command to run in fresh environment (install && dev)
	build?: string; // Command to build the project
};

export type DetectResult = {
	packagePath: string;
	frameworks: FrameworkSignal[]; // all detected frameworks
	packageManagers: PackageManager[]; // all found lockfiles
	name: string;
	description?: string;
	commands: SetupCommands;
	monorepo?: { isMonorepo: boolean; candidates?: DetectResult[] };
};

export type PackageJson = {
	name?: string;
	description?: string;
	private?: boolean;
	version?: string;
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	engines?: { node?: string };
	workspaces?: string[] | { packages?: string[] };
	main?: string;
};


