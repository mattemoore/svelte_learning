
<script>
    import Modal from './Modal.svelte';
    export let beer;
    let showModal = false;
</script>

<div class='beer' on:click={() => showModal = true}>
    <p>{beer.name}</p>
    <img src={beer.image_url} alt='A picture of the beer called {beer.name}.' />
</div>

{#if showModal}
	<Modal on:close='{() => showModal = false}'>
        <div slot='header' id='modalHeader'>
		    <h2>{beer.name}</h2>
            <img src={beer.image_url} alt='A picture of the beer called {beer.name}.' />
        </div>
        <div slot='details'>
            <p>{beer.tagline}</p>
			<p>{beer.description}</p>
            <ul slot='details' class='definition-list" style="float: right;'>
                <li>abv: {beer.abv}</li>
                <li>ibu: {beer.ibu}</li>
                <li>hops:
                    <ul>
                        {#each beer.ingredients.hops as hop}
                            <li>{hop.name} ({hop.add} - {hop.attribute})</li>
                        {/each}
                    </ul>
                </li>
                <li>malts:
                    <ul>
                        {#each beer.ingredients.malt as malt}
                            <li>{malt.name}</li>
                        {/each}
                    </ul>
                </li>
                <li>yeast: {beer.ingredients.yeast}</li>
                <li>food pairing:</li>
                <ul>
                    {#each beer.food_pairing as pairing}
                        <li>{pairing}</li>
                    {/each}
                </ul>
            </ul>
        </div>
	</Modal>
{/if}

<style>
    .beer { 
        float: left;
        width: 200px; height: 250px;
        padding: 20px 10px; margin: 10px;
        color: #1f2d3d; text-align: center; 
        background-color: #95BF74; 
    }
    .beer p {
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .beer:hover {
        background-color: #659B5E;
        cursor: grab;
    }
    img {
        width: 85px; height: 200px;
        padding: 10px 10px 20px 20px;
    }
    #modalHeader {
        text-align: center;
    }
</style>