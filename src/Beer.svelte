
<script>
    export let beer;
    function selectBeer(beerId) {
        alert(`Selected beer ${beerId}!`)
    }

</script>

<div id='beer' on:click={() => selectBeer(beer.id)}>
    <p>{beer.name}</p>
    <img src={beer.image_url} alt='A picture of the beer called {beer.name}.' />
</div>

<style>
    #beer { 
        float: left;
        width: 200px; height: 250px;
        padding: 20px 10px; margin: 10px;
        color: #1f2d3d; text-align: center;
        background-color: rgba(149, 191, 116, 1); 
    }
    #beer:hover {
        background-color: rgba(101, 155, 94, 1);
        cursor: grab;
    }

    img {
        width: 85px; height: 200px;
        padding: 10px 10px 20px 20px;
    }
    color4 { color: #fff;	 background-color: (85, 111, 68, 1); 		 opacity: .3;}
</style>