<script>
    export let numCalls;
    export let numCallsLeft;
</script>
<div id="footer">
    {#if numCalls}
        Number of API calls per hour: {numCalls} <br/>
        Number of API calls left this hour: {numCallsLeft}
    {/if}
</div>
<style>
    #footer { 
        overflow: hidden; clear: both;
        padding: 20px 10px;
        color: #fff; 
        background-color: rgba(40, 63, 59, 1);
        opacity: .7;
    }
</style>