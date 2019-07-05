<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let apiUrl;
    let searchTerm = 'hops';
    
    async function search() {
        let searchUrl = `${apiUrl}?beer_name=${searchTerm}`
        const response = await fetch(searchUrl);
        const json = await response.json();
        const headers = await response.headers;
        dispatch('gotBeers', {
            json: json,
            headers: headers
        });
    }
</script>

<div id='banner'>
    Search beers with Svelte and Punk API
    <input bind:value={searchTerm} />
    <button on:click={search}>Search</button>
</div>

<style>
    #banner { 
        overflow: hidden;
        padding: 20px 10px;
        color: #1f2d3d; 
        background-color: rgba(153, 221, 200, 1); 
        opacity: .7;
    }
    button:hover {
        cursor: grab;
    }
</style>