<script>
    import * as d3 from 'd3';

    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";
    import Pie from '$lib/Pie.svelte';

    let selectedYearIndex = -1;
    let query = "";
    let rolledData;
    let filteredByYear;
    let filteredProjects;

    let pieData;
    let selectedYear;

    $: filteredByYear = filteredProjects.filter(project => {
        if(selectedYear !== null) {
            return project.year === selectedYear;
        }
        return true;
    })

    $: filteredProjects = projects.filter(project => {
        if (query) {
            let values = Object.values(project).join("\n").toLowerCase();
            return values.includes(query.toLowerCase());
        }
        return true;
    });

    $: {
        pieData = {};
        rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);

        pieData = rolledData.map(([year, count]) => {
            return { value: count, label: year };
        });
    }
    $: {
        selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;
    }

</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<h1>Project portfolio ({projects.length} and counting!)</h1>
<Pie data={pieData} bind:selectedIndex={selectedYearIndex}/>
<input type="search" bind:value={query}
       aria-label="Search projects" placeholder="🔍 Search projects…" />
       
<div class="projects">
    {#each filteredByYear as p}
    <Project data={p}/>
    {/each}
</div>