const ARE_WE_HOME = document.documentElement.classList.contains("home");

function $$ (selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}
