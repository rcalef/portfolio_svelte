const ARE_WE_HOME = document.documentElement.classList.contains("home");

function $$ (selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

document.body.insertAdjacentHTML("afterbegin", `
	<label class="color-scheme">
		Theme:
		<select name="color-scheme" id="color_scheme_selector">
			<option value="light dark" selected>Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>`
);
function setColorScheme (scheme) {
	document.documentElement.style.setProperty("color-scheme", scheme);
}


let select = document.querySelector("#color_scheme_selector");
select.addEventListener("input", function (event) {
	setColorScheme(event.target.value);
	localStorage.setItem("colorScheme", event.target.value);
});

if ("colorScheme" in localStorage) {
	const curr_scheme = localStorage.getItem("colorScheme");
	setColorScheme(curr_scheme);
	select.value = curr_scheme;
}


let pages = [
	{url: ".", title: "Home"},
	{url: "projects", title: "Projects"},
	{url: "contact", title: "Contact"},
];

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
	let url = p.url;
	let a = document.createElement("a")

	a.href = url;
	a.textContent = p.title;

	if (a.host === location.host && a.pathname === location.pathname) {
		a.classList.add("current");
	}

	if (a.host !== location.host) {
		a.target = "_blank";
	}

	nav.append(a);
}