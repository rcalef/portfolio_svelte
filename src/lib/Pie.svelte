<script>
    import * as d3 from 'd3';

    export let data = [];
    export let selectedIndex = -1;

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let sliceGenerator = d3.pie().value(d=>d.value);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(40);

    let arcData;
    let arcs;
    $: {
        arcData = sliceGenerator(data);
        arcs = arcData.map(d => arcGenerator(d));
    }

    function toggleWedge (index, event) {
        selectedIndex = selectedIndex === index ? -1 : index;
    }
</script>

<style>
    svg{
        max-width: 20em;
        margin-block: 2em;
        overflow: visible;
    }
    svg:has(path:hover, path:focus-visible) {
        path:not(:hover, :focus-visible) {
            opacity: 50%;
        }
    }
    path {
	    transition: 200ms;
        cursor: pointer;
        outline: none;

        --angle: calc(var(--end-angle) - var(--start-angle));
    	--mid-angle: calc(var(--start-angle) + var(--angle) / 2);

        transform: rotate(var(--mid-angle))
	           translateY(0)
	           rotate(calc(-1 * var(--mid-angle)));

        &.selected {
            transform: rotate(var(--mid-angle))
                        translateY(-6px) scale(1.1)
                        rotate(calc(-1 * var(--mid-angle)));
        }
    }
    .legend{
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
        list-style-type: none;
        border: solid;
        border-radius: 0%;
        margin: 5%;
        flex: 1;
        height: 50%;
        vertical-align: middle;

        li {
            display: flex;
            align-items: center;
            .swatch{
                display: inline-block;
                aspect-ratio: 1/1;
                background-color: var(--color);
                border-radius: 20%;
                width: 10%;
                margin: 5%;
            }
        }
    }
    .container {
        display: flex;
        align-items: center;
    }
    .selected {
        --color: oklch(20% 45% 0) !important;

        &:is(path) {
            fill: var(--color);
        }
    }

</style>

<div class="container">
    <svg viewBox="-40 -40 80 80">
        {#each arcs as arc, index}
            <path d={arc}
                  fill={colors(index)}
                  class:selected={selectedIndex === index}
                  on:click={e => toggleWedge(index, e)}
                  on:keyup={e => toggleWedge(index, e)}
                  tabindex="0"
                  role="button"
                  aria-label="select_year"
                  style="
                    --start-angle: { arcData[index]?.startAngle }rad;
                    --end-angle: { arcData[index]?.endAngle }rad;"
            />
        {/each}
    </svg>

    <ul class="legend">
        {#each data as d, index}
            <li style="--color: { colors(index) }"
                class:selected={selectedIndex === index}>
                <span class="swatch"></span>
                {d.label} <em>({d.value})</em>
            </li>
        {/each}
    </ul>
</div>