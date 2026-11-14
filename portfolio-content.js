const siteRoot = new URL(".", document.currentScript?.src || window.location.href);

async function loadPortfolioContent() {
	try {
		const response = await fetch(new URL("content/portfolio.json", siteRoot), { cache: "no-store" });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const content = await response.json();
		for (const [field, value] of Object.entries(content)) {
			if (typeof value !== "string") {
				continue;
			}

			if (field === "siteDescription") {
				const description = document.querySelector('meta[name="description"]');
				if (description) {
					description.content = value;
				}
				continue;
			}

			if (field === "cvFile") {
				updateCvLinks(value);
				continue;
			}

			const target = document.querySelector(`[data-cms-text="${field}"]`);
			if (!target) {
				continue;
			}

			if (field === "heroTitle" && target.firstChild?.nodeType === Node.TEXT_NODE) {
				target.firstChild.textContent = value;
			} else {
				target.textContent = value;
			}
		}
	} catch (error) {
		console.error("No se pudo cargar el contenido editable del portfolio.", error);
	}
}

function updateCvLinks(filePath) {
	const links = document.querySelectorAll("[data-cms-cv]");
	if (!filePath) {
		return;
	}

	let fileUrl;
	try {
		fileUrl = new URL(filePath.trim().replace(/^\/+/, ""), siteRoot);
	} catch (error) {
		console.error("La ruta del CV configurada en el CMS no es válida.", error);
		return;
	}

	if (fileUrl.origin !== window.location.origin || !fileUrl.pathname.toLowerCase().endsWith(".pdf")) {
		console.error("El CV debe ser un archivo PDF alojado en este mismo sitio.");
		return;
	}

	const fileName = fileUrl.pathname.split("/").pop();
	for (const link of links) {
		link.href = fileUrl.href;
		link.download = fileName;
		link.hidden = false;
		link.style.display = "";
	}
}

loadPortfolioContent();
