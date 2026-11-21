const siteRoot = new URL(".", document.currentScript?.src || window.location.href);

const tinaVariables = { relativePath: "portfolio.json" };

async function loadPortfolioContent() {
	try {
		const response = await fetch(new URL("content/portfolio.json", siteRoot), { cache: "no-store" });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const content = await response.json();
		updatePortfolioContent(content);
		initializeTinaBridge(content);
	} catch (error) {
		console.error("No se pudo cargar el contenido editable del portfolio.", error);
	}
}

function updatePortfolioContent(content) {
	for (const [field, value] of Object.entries(content)) {
		if (typeof value !== "string") {
			continue;
		}

		if (
			field === "siteDescription" ||
			field.endsWith("SiteDescription") ||
			field.endsWith("PageTitle")
		) {
			const description = document.querySelector(`[data-cms-field="${field}"]`);
			if (description) {
				if (description instanceof HTMLMetaElement) {
					description.content = value;
				} else {
					description.textContent = value;
				}
			}
			continue;
		}

		if (field === "cvFile") {
			updateCvLinks(value);
			continue;
		}

		if (field === "contactEmail" || field === "contactPhone") {
			const links = document.querySelectorAll(`[data-cms-text="${field}"]`);
			const href = field === "contactEmail"
				? `mailto:${value.trim()}`
				: `tel:${value.replace(/[^\d+]/g, "")}`;
			for (const link of links) {
				link.href = href;
			}
		}

		for (const target of document.querySelectorAll(`[data-cms-text="${field}"]`)) {
			const firstTextNode = Array.from(target.childNodes).find(
				(node) => node.nodeType === Node.TEXT_NODE
			);
			if (firstTextNode) {
				firstTextNode.textContent = value;
			} else {
				target.textContent = value;
			}
		}
	}
}

function initializeTinaBridge(content) {
	const fields = Object.keys(content).filter((field) => field !== "cvFile");
	const tinaQuery = `query portfolio($relativePath: String!) {
		portfolio(relativePath: $relativePath) {
			... on Document {
				_sys {
					filename
					basename
					hasReferences
					breadcrumbs
					path
					relativePath
					extension
				}
				id
			}
			...PortfolioParts
		}
	}

	fragment PortfolioParts on Portfolio {
		__typename
		${fields.join("\n\t\t")}
		cvFile
	}`;
	const queryId = hashFromQuery(JSON.stringify({ query: tinaQuery, variables: tinaVariables }));
	const tinaFieldElements = document.querySelectorAll("[data-cms-text], [data-cms-field]");
	for (const element of tinaFieldElements) {
		const field = element.dataset.cmsText || element.dataset.cmsField;
		element.dataset.tinaField = `${queryId}---portfolio.${field}`;
	}

	if (window.parent === window) {
		return;
	}

	const adminOrigin = window.location.origin;
	const data = { portfolio: { ...content, __typename: "Portfolio" } };
	let acknowledged = false;
	let attempts = 0;
	let retryTimer;

	const sendOpen = () => {
		if (acknowledged || attempts >= 40) {
			window.clearInterval(retryTimer);
			return;
		}

		attempts += 1;
		window.parent.postMessage(
			{ type: "open", id: queryId, query: tinaQuery, variables: tinaVariables, data },
			adminOrigin
		);
		window.parent.postMessage({ type: "user-select-form", formId: queryId }, adminOrigin);
	};

	const setQuickEdit = (enabled) => {
		let style = document.getElementById("__tina-visual-edit-style");
		if (!enabled) {
			style?.remove();
			return;
		}

		if (style) {
			return;
		}

		style = document.createElement("style");
		style.id = "__tina-visual-edit-style";
		style.textContent = `
			[data-tina-field] {
				outline: 2px dashed rgba(34, 150, 254, 0.5);
				cursor: pointer;
			}
			[data-tina-field]:hover {
				outline: 2px solid rgba(34, 150, 254, 1);
				background-color: rgba(34, 150, 254, 0.12);
			}
		`;
		document.head.appendChild(style);
	};

	window.addEventListener("message", (event) => {
		if (event.source !== window.parent || event.origin !== adminOrigin) {
			return;
		}

		const message = event.data;
		if (!message || typeof message !== "object") {
			return;
		}

		if (message.type === "quickEditEnabled") {
			setQuickEdit(Boolean(message.value));
			return;
		}

		if (message.type !== "updateData" || message.id !== queryId) {
			return;
		}

		acknowledged = true;
		window.clearInterval(retryTimer);

		if (message.data?.portfolio && typeof message.data.portfolio === "object") {
			updatePortfolioContent(message.data.portfolio);
		}

		window.parent.postMessage(
			{ type: "quick-edit", value: document.querySelector("[data-tina-field]") !== null },
			adminOrigin
		);
	});

	document.addEventListener(
		"click",
		(event) => {
			if (!document.getElementById("__tina-visual-edit-style")) {
				return;
			}

			const target = event.target instanceof Element ? event.target : null;
			const fieldElement = target?.closest("[data-tina-field]");
			const fieldName = fieldElement?.dataset.tinaField;
			if (!fieldName) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			window.parent.postMessage({ type: "field:selected", fieldName }, adminOrigin);
		},
		true
	);

	window.addEventListener("beforeunload", () => {
		window.clearInterval(retryTimer);
		window.parent.postMessage({ type: "close", id: queryId }, adminOrigin);
	});

	window.parent.postMessage(
		{ type: "quick-edit", value: document.querySelector("[data-tina-field]") !== null },
		adminOrigin
	);
	sendOpen();
	retryTimer = window.setInterval(sendOpen, 250);
}

function hashFromQuery(input) {
	// Match Tina's query hash so the admin can map data-tina-field back to its form.
	let hash = 0;
	for (let index = 0; index < input.length; index += 1) {
		hash = (hash << 5) - hash + input.charCodeAt(index);
		hash |= 0;
	}
	return Math.abs(hash).toString(36);
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
