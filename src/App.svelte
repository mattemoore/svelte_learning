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
{#if beers == undefined}
	<p>Enter a search term in the header and click the Search button...</p>
{:else if beers.length <= 0}
	<p>Nothing found for that search term.  Try again with a different search term.</p>
{:else}
	{#each beers as beer}
		<Beer beer={beer} />
	{/each}
{/if}
{#if numCalls}
	<Footer {numCalls} {numCallsLeft} />
{/if}
