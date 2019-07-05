<script>
    export let numCalls;
    export let numCallsLeft;
</script>
<div id="footer">
    {#if numCalls}
        <p>Number of API calls per hour: {numCalls}</p>
        <p>Number of API calls left this hour: {numCallsLeft}</p>
    {/if}
</div>
<style>
    #footer { 
        overflow: hidden; clear: both;
        padding: 5px 20px ;
        color: gainsboro; 
        background-color: #283F3B;
    }
</style>