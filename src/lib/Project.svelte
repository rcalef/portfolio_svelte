<script>
    export let data = {};
    export let hLevel = 2;
</script>

<style>
    article {
        display: grid;
        grid-template-rows: subgrid;
        grid-row: span 3;
        max-width: 95%;

        .clickable-article {
            text-decoration: none;
            color: inherit;

            img {
                max-width: 95%;
            }
        }
    }
    h2 {
        margin: 0;
    }
    h3 {
        margin: 0;
    }
</style>

    <article>
        <a href={data.path} class="clickable-article" target="_blank">
            <svelte:element this={"h" + hLevel}>{data.title}</svelte:element>
            <img src={data.image} alt="">
            <p>{data.description} ({data.year})</p>

        </a>
    </article>