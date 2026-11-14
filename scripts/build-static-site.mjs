import { cp, mkdir, writeFile } from "node:fs/promises";

const outputDirectory = "_site";
const rootFiles = [
	"index.html",
	"experiencia.html",
	"formacion.html",
	"informacion.html",
	"portfolio.css",
	"portfolio-content.js",
];

await mkdir(outputDirectory, { recursive: true });

for (const file of rootFiles) {
	await cp(file, `${outputDirectory}/${file}`);
}

await cp("content", `${outputDirectory}/content`, { recursive: true });
await cp("admin", `${outputDirectory}/admin`, { recursive: true });
await writeFile(`${outputDirectory}/.nojekyll`, "");
