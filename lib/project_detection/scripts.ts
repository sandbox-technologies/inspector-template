import { PackageJson, PackageManager, SetupCommands } from "./types";

export function generateSetupCommands(
	pkg: PackageJson | undefined,
	packageManagers: PackageManager[]
): SetupCommands {
	const scripts = pkg?.scripts || {};
	const pm = packageManagers[0] || "npm"; // Use first found package manager
	
	// Generate install command
	let installCmd = pm === "yarn" ? "yarn" : `${pm} install`;
	
	// Check for postinstall or prepare scripts that might need to run
	const setupSteps: string[] = [installCmd];
	if (scripts.postinstall) {
		setupSteps.push(`${pm} run postinstall`);
	} else if (scripts.prepare) {
		setupSteps.push(`${pm} run prepare`);
	}
	
	// Combine setup steps
	installCmd = setupSteps.join(" && ");
	
	// Find dev script
	let devCmd = "";
	const devScriptNames = ["dev", "develop", "start", "serve"];
	for (const name of devScriptNames) {
		if (scripts[name]) {
			devCmd = `${pm} run ${name}`;
			break;
		}
	}
	
	// If no standard dev script found, check for framework-specific ones
	if (!devCmd) {
		for (const [name] of Object.entries(scripts)) {
			if (name.includes("dev") || name.includes("start") || name.includes("serve")) {
				devCmd = `${pm} run ${name}`;
				break;
			}
		}
	}
	
	// Default if still no dev script
	if (!devCmd) {
		devCmd = 'echo "No dev script found. Check package.json for available scripts."';
	}
	
	// Find build script
	let buildCmd: string | undefined;
	if (scripts.build) {
		buildCmd = `${pm} run build`;
	}
	
	// Generate the full setup command for a fresh environment
	const setupCmd = `${installCmd} && ${devCmd}`;
	
	return {
		install: installCmd,
		dev: devCmd,
		setup: setupCmd,
		build: buildCmd,
	};
}
