import { existsSync } from "node:fs";

if (existsSync(".env")) {
	process.loadEnvFile(".env");
}

const requiredVariables = ["NEXT_PUBLIC_TINA_CLIENT_ID", "TINA_TOKEN"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
	console.error(
		`Faltan variables de Tina Cloud necesarias para compilar: ${missingVariables.join(", ")}.`
	);
	process.exit(1);
}
