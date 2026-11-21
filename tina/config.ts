/// <reference types="node" />

import { defineConfig } from "tinacms";

export default defineConfig({
	branch: process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.GITHUB_REF_NAME || "main",
	clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
	token: process.env.TINA_TOKEN || null,
	build: {
		publicFolder: ".",
    	outputFolder: "admin",
    	basePath: "davidballesterosbarrio.github.io",
	},
	media: {
		tina: {
			publicFolder: ".",
			mediaRoot: "content",
		},
	},
	schema: {
		collections: [
			{
				name: "portfolio",
				label: "Contenido del portfolio",
				path: "content",
				format: "json",
				match: { include: "portfolio" },
				ui: {
					global: true,
					router: () => "/",
				},
				fields: [
					{
						type: "string",
						name: "heroTitle",
						label: "Titular principal",
						isTitle: true,
						required: true,
					},
					{
						type: "string",
						name: "heroDescription",
						label: "Descripción principal",
						ui: { component: "textarea" },
					},
					{ type: "string", name: "heroName", label: "Nombre y formación" },
					{
						type: "string",
						name: "highlightsIntro",
						label: "Introducción de destacados",
						ui: { component: "textarea" },
					},
					{ type: "string", name: "profileTitle", label: "Titular del perfil" },
					{
						type: "string",
						name: "profileDescription",
						label: "Resumen del perfil",
						ui: { component: "textarea" },
					},
					{
						type: "string",
						name: "siteDescription",
						label: "Descripción para buscadores",
						ui: { component: "textarea" },
					},
					{
						type: "string",
						name: "experienceSummary",
						label: "Resumen de experiencia",
						ui: { component: "textarea" },
					},
					{ type: "string", name: "projectTitle", label: "Título del proyecto" },
					{
						type: "string",
						name: "projectDescription",
						label: "Descripción del proyecto",
						ui: { component: "textarea" },
					},
					{
						type: "image",
						name: "cvFile",
						label: "CV en PDF",
						accept: "pdf",
						description: "Selecciona o sube el archivo PDF del CV.",
					},
				],
			},
		],
	},
});
