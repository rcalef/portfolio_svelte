<script>
    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";
</script>


<svelte:head>
	<title>Robert Calef's Homepage</title>
</svelte:head>

<h1>Robert Calef</h1>
<p>Exciting times making webpages. This is me and my grandma:</p>
<img src="images/grandma.jpg" alt="Me and my grandma" height="400">
<p
    >And this is a long string of text to test how the current design is handling
    very long texts: Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptas blanditiis minus nisi libero atque provident eligendi, consectetur officia vel impedit fugit harum molestiae, voluptate, nobis cum deserunt temporibus animi quibusdam?
</p>

<h2>Latest Projects</h2>
<div class="projects">
    {#each projects.slice(0, 3) as p}
    <Project data={p} hLevel=3/>
    {/each}
</div>