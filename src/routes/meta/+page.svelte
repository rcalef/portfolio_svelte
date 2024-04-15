<svelte:head>
	<title>Metadata</title>
</svelte:head>

<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';

    import {
        computePosition,
        autoPlacement,
        offset,
        size,
    } from '@floating-ui/dom';

    import Pie from "$lib/Pie.svelte"

    let commits = [];
    let files = [];
    let sortedFiles = [];

    let data = [];
    onMount(async () => {
        data = await d3.csv("loc.csv", row => ({
            ...row,
            line: Number(row.line), // or just +row.line
            depth: Number(row.depth),
            length: Number(row.length),
            date: new Date(row.date + "T00:00" + row.timezone),
            datetime: new Date(row.datetime)
        }));
        commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
            let first = lines[0];
            let {author, date, time, timezone, datetime} = first;
            let ret = {
                id: commit,
                url: "https://github.com/rcalef/portfolio_svelte/commit/" + commit,
                author, date, time, timezone, datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length
            };
            Object.defineProperty(ret, "lines", {
                value: lines,
                configurable: true,
                writable: true,
                enumerable: false,
            });

            return ret;
        });

        files = d3.groups(data, d => d.file).map(([filename, lines]) => {
            let ret = {
                id: filename,
                url: "https://github.com/rcalef/portfolio_svelte/" + filename,
                numLines: lines.length,
            };

            return ret;
        });
        sortedFiles = d3.sort(files, (d) => d.numLines);
    })
    let longestFile;
    let shortestFile;
    let avgFileLen;

    $: longestFile = sortedFiles[sortedFiles.length-1];
    $: shortestFile = sortedFiles[0];
    $: avgFileLen = d3.mean(files, d => d?.numLines);

    let width = 1000, height = 600;
    let margin = {top: 10, right: 10, bottom: 30, left: 20};

    let usableArea = {
        top: margin.top,
        bottom: height - margin.bottom,
        left: margin.left,
        right: width - margin.right,
    }
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;

    let dateMin, dateMax, xScale;
    let yScale = d3.scaleLinear([0, 24], [usableArea.bottom, usableArea.top]);
    $: [dateMin, dateMax] = d3.extent(commits, d => d.datetime);
    $: xScale = d3.scaleTime([dateMin, dateMax], [usableArea.left, usableArea.right]).nice();

    let xAxis, yAxis, yAxisGridLines;
    $: {
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
        d3.select(yAxisGridLines).call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));
    }

    let minLines, maxLines;
    let sizeScale;
    $: [minLines, maxLines] = d3.extent(commits, d => d.totalLines)
    $: sizeScale = d3.scaleSqrt([minLines, maxLines], [10, 30])



    let hoveredCommit;
    let hoveredIndex = -1;
    $: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};

    let tooltipPosition = {x: 0, y: 0};
    let commitTooltip;
    async function dotInteraction (index, evt) {
        let hoveredDot = evt.target;
        tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
            strategy: "fixed", // because we use position: fixed
            middleware: [
                offset(5), // spacing from tooltip to dot
                autoPlacement() // see https://floating-ui.com/docs/autoplacement
            ],
        });
        if (evt.type === "mouseenter" || evt.type === "focus") {
            hoveredIndex = index;
        }
        else if (evt.type === "mouseleave" || evt.type === "blur") {
            hoveredIndex = -1;
        }
    }


    let brushSelection;
    function brushed (evt) {
        brushSelection = evt.selection;
        console.log(commits.filter(d => isCommitSelected(d)))
    }
    function isCommitSelected (commit) {
        if (!brushSelection) {
            return false;
        }
        let [minDate, maxHour] = brushSelection[0];
        let [maxDate, minHour] = brushSelection[1];
        minHour = yScale.invert(minHour);
        maxHour = yScale.invert(maxHour);
        minDate = xScale.invert(minDate);
        maxDate = xScale.invert(maxDate);

        let selected = commit.hourFrac >= minHour && commit.hourFrac <= maxHour && commit.datetime >= minDate && commit.datetime <= maxDate;
        return selected
    }

    let svg;
    $: {
        d3.select(svg).call(d3.brush().on("start brush end", brushed));
        d3.select(svg).selectAll(".dots, .overlay ~ *").raise();

    }
    $: selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    $: hasSelection = brushSelection && selectedCommits.length > 0;

    let selectedLines;
    let languageBreakdown;
    $: {
        selectedLines = (hasSelection ? selectedCommits : commits).flatMap(d => d.lines);
        languageBreakdown = d3.rollup(selectedLines, D => D.length, d => d.type);
        languageBreakdown = Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: lines}));
    }
</script>

<style>
    svg {
        overflow: visible;
    }
    .gridlines {
        stroke-opacity: 0.2;
    }
    dl.info {
        background-color: rgba(171, 211, 211, 0.527);
        box-shadow: 2px 2px 2px 2px;
        display: grid;
        margin: 0;
        border-radius: 10%;
        backdrop-filter: blur(5px);
        padding: 5px;

        dt {
            grid-column: 1;
            opacity: 80%;
        }
        dd {
            grid-column: 2;

        }
        transition-duration: 500ms;
    	transition-property: opacity, visibility;
        &[hidden]:not(:hover, :focus-within) {
            opacity: 0;
            visibility: hidden;
        }
    }
    .tooltip {

        position: fixed;
        top: 1em;
        left: 1em;
    }
    circle {
        transition: 200ms;
        &:hover {
            transform: scale(1.5);
            transform-origin: center;
            transform-box: fill-box;
        }

    }
    .selected {
        fill: blueviolet;
    }

    @keyframes marching-ants {
        to {
            stroke-dashoffset: -8; /* 5 + 3 */
        }
    }

    svg :global(.selection) {
        fill-opacity: 10%;
        stroke: black;
        stroke-opacity: 70%;
        stroke-dasharray: 5 3;
        animation: marching-ants 2s linear infinite;
    }
</style>

<h1>Metadata</h1>
<p>
    This is where we'll show some interesting metadata about this website!
</p>

<dl class="stats">
    <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
    <dd>{data.length}</dd>

    <dt>Number of files</dt>
    <dd>{files.length}</dd>

    <dt>Name of longest file</dt>
    <dd>{longestFile?.id}</dd>

    <dt>Length of longest file</dt>
    <dd>{longestFile?.numLines}</dd>

    <dt>Name of shortest file</dt>
    <dd>{shortestFile?.id}</dd>

    <dt>Length of shortest file</dt>
    <dd>{shortestFile?.numLines}</dd>

    <dt>Average file length</dt>
    <dd>{avgFileLen}</dd>
</dl>

<svg viewBox="0 0 {width} {height}" bind:this={svg}>
    <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridLines} />
    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />

    <g class="dots">
        {#each commits as commit, index }
            <circle
                cx={ xScale(commit.datetime) }
                cy={ yScale(commit.hourFrac) }
                r={sizeScale(commit.totalLines)}
                fill="steelblue"
                on:mouseenter={e => dotInteraction(index, e)}
                on:mouseleave={e => dotInteraction(index, e)}
                tabindex="0"
                aria-describedby="commit-tooltip"
                role="tooltip"
                aria-haspopup="true"
                on:focus={e => dotInteraction(index, e)}
                on:blur={e => dotInteraction(index, e)}
                class:selected={isCommitSelected(commit)}
            />
        {/each}
    </g>
</svg>
<p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>

<Pie data={languageBreakdown}/>

<dl id="commit-tooltip" class="info tooltip" hidden={hoveredIndex === -1} style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px" bind:this={commitTooltip}>
	<dt>Commit</dt>
	<dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id }</a></dd>

	<dt>Date</dt>
	<dd>{ hoveredCommit.datetime?.toLocaleString("en", {dateStyle: "full"}) }</dd>

    <dt>Lines changed</dt>
    <dd>{ hoveredCommit?.totalLines}</dd>
</dl>