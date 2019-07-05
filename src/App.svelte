<script>
	import Header from './Header.svelte'
	import Footer from './Footer.svelte'
	import Beer from './Beer.svelte';
	import BeerDetails from './BeerDetails.svelte';
	let apiUrl = 'https://api.punkapi.com/v2/beers'
	let beers;
	let numCalls;
	let numCallsLeft;

	function gotBeers(event) {
		beers = event.detail.json
		numCalls = event.detail.headers.get('x-ratelimit-limit')
		numCallsLeft = event.detail.headers.get('x-ratelimit-remaining')
	}
</script>

<Header {apiUrl} on:gotBeers={gotBeers} />
{#if beers}
	{#each beers as beer}
		<Beer beer={beer} />
	{/each}
{:else}
	<p>Click Search in the header...</p>
{/if}
{#if numCalls}
	<Footer {numCalls} {numCallsLeft} />
{/if}
