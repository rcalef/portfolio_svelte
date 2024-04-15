<script>
    import { page } from '$app/stores';
    let pages = [
        {url: "/", title: "Home"},
        {url: "/projects", title: "Projects"},
        {url: "/contact", title: "Contact"},
        {url: "/meta", title: "Metadata"},
    ];
    let colorScheme = "light dark";
    let root = globalThis?.document?.documentElement;
    let localStorage = globalThis.localStorage ?? {};

    if ("colorScheme" in localStorage) {
        colorScheme = localStorage.getItem("colorScheme");
    }

    $: root?.style.setProperty("color-scheme", colorScheme);
    $: localStorage.colorScheme = colorScheme;
</script>
<style>
    .color-scheme {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-family: inherit;
        font-size: 80%;
    }

    nav {
        --border-color: oklch(50% 10% 200 / 40%);
        display: flex;
        margin-bottom: 1cm;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom-color: var(--border-color);

        a {
            flex: 1;
            text-decoration: none;
            color: inherit;
            text-align: center;
            padding: 0.5em;
            &:hover { /* becomes a:hover */
                text-decoration: underline;
                accent-color: var(--color-accent);
                border-bottom-width: 0.4em;
                border-bottom-style: solid;
                border-bottom-color: var(--color-accent);
                background-color: color-mix(in oklch, var(--color-accent), canvas 85%);
            }
        }
    }

    .current {
        border-bottom-width: 0.4em;
        border-bottom-style: solid;
        border-bottom-color: oklch(80% 3% 200);
    }
</style>

<label class="color-scheme">
    Theme:
    <select bind:value={colorScheme} name="color-scheme" id="color_scheme_selector">
        <option value="light dark" selected>Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
</label>

<nav>
    {#each pages as p}
        <a href={p.url} class={$page.route.id === p.url ? "current" : "" } target={ p.url.startsWith("http") ? "_blank" : null }>{p.title}</a>
    {/each}
</nav>
<slot />