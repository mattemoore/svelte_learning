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
    <p>Search beers with Svelte and Punk API</p>
    <input bind:value={searchTerm} />
    <button on:click={search}>Search</button>
</div>

<style>
    #banner { 
        overflow: hidden;
        padding: 10px 20px;
        color: #1f2d3d; 
        background-color:#99DDC8;
    }
    p {
        display: inline-block;
    }
    button:hover {
        cursor: grab;
    }
</style>